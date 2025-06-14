import { supabase } from './supabase';

export interface StorageItem {
  id: string;
  bucket_id: string;
  name: string;
  path: string;
  size: number;
  mime_type: string;
  metadata: any;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  url?: string;
  categories?: StorageCategory[];
}

export interface StorageCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StorageItemWithUrl extends StorageItem {
  url: string;
}

export interface UploadOptions {
  bucket?: string;
  path?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
  categories?: string[];
}

/**
 * Create a new storage bucket
 */
export const createBucket = async (
  bucketName: string,
  isPublic: boolean = false,
  fileSizeLimit: number = 50 * 1024 * 1024 // 50MB default
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to create a bucket');
    }

    // Call the edge function to create the bucket
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        bucketName,
        isPublic,
        fileSizeLimit,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create bucket');
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error creating bucket:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  file: File,
  options: UploadOptions = {}
): Promise<StorageItemWithUrl | null> => {
  try {
    const {
      bucket = 'content_storage',
      path = '',
      isPublic = true,
      metadata = {},
      onProgress,
      categories = [],
    } = options;

    // Generate a unique file path to avoid collisions
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const filePath = path 
      ? `${path}/${timestamp}_${file.name}`
      : `${timestamp}_${file.name}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        duplex: 'half',
      });

    if (error) throw error;

    // Get the public URL if the file is public
    let publicUrl = null;
    if (isPublic) {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      publicUrl = urlData.publicUrl;
    }

    // Get the user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Create a record in the storage_items table
    const { data: storageItem, error: insertError } = await supabase
      .from('storage_items')
      .insert({
        bucket_id: bucket,
        name: file.name,
        path: filePath,
        size: file.size,
        mime_type: file.type,
        metadata: {
          ...metadata,
          originalName: file.name,
          lastModified: file.lastModified,
        },
        created_by: userId,
        updated_by: userId,
      })
      .select('*')
      .single();

    if (insertError) throw insertError;

    // Add categories if provided
    if (categories.length > 0 && storageItem) {
      const categoryEntries = categories.map(categoryId => ({
        item_id: storageItem.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from('storage_item_categories')
        .insert(categoryEntries);

      if (categoryError) {
        console.error('Error adding categories:', categoryError);
      }
    }

    // Return the storage item with the URL
    return {
      ...storageItem,
      url: publicUrl || '',
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Get a list of storage items
 */
export const getStorageItems = async (
  bucket: string = 'content_storage',
  options: {
    limit?: number;
    offset?: number;
    search?: string;
    categoryId?: string;
    mimeType?: string;
  } = {}
): Promise<{ items: StorageItemWithUrl[]; count: number }> => {
  try {
    const { limit = 20, offset = 0, search = '', categoryId, mimeType } = options;

    let query = supabase
      .from('storage_items')
      .select(`
        *,
        storage_item_categories!inner(
          storage_categories(*)
        )
      `, { count: 'exact' });

    // Apply filters
    if (bucket) {
      query = query.eq('bucket_id', bucket);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,path.ilike.%${search}%`);
    }

    if (categoryId) {
      query = query.eq('storage_item_categories.category_id', categoryId);
    }

    if (mimeType) {
      query = query.ilike('mime_type', `${mimeType}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    // Get public URLs for all items
    const itemsWithUrls = await Promise.all((data || []).map(async (item) => {
      const { data: urlData } = supabase.storage
        .from(item.bucket_id)
        .getPublicUrl(item.path);

      // Extract categories from the nested structure
      const categories = item.storage_item_categories
        ? item.storage_item_categories.map((sic: any) => sic.storage_categories)
        : [];

      return {
        ...item,
        url: urlData.publicUrl,
        categories,
      };
    }));

    return { items: itemsWithUrls, count: count || 0 };
  } catch (error) {
    console.error('Error getting storage items:', error);
    return { items: [], count: 0 };
  }
};

/**
 * Get a single storage item by ID
 */
export const getStorageItemById = async (id: string): Promise<StorageItemWithUrl | null> => {
  try {
    const { data, error } = await supabase
      .from('storage_items')
      .select(`
        *,
        storage_item_categories(
          storage_categories(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(data.bucket_id)
      .getPublicUrl(data.path);

    // Extract categories from the nested structure
    const categories = data.storage_item_categories
      ? data.storage_item_categories.map((sic: any) => sic.storage_categories)
      : [];

    return {
      ...data,
      url: urlData.publicUrl,
      categories,
    };
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

/**
 * Delete a storage item
 */
export const deleteStorageItem = async (id: string): Promise<boolean> => {
  try {
    // First get the item to know its bucket and path
    const { data, error } = await supabase
      .from('storage_items')
      .select('bucket_id, path')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return false;

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from(data.bucket_id)
      .remove([data.path]);

    if (deleteError) throw deleteError;

    // The database record will be deleted by the storage webhook
    return true;
  } catch (error) {
    console.error('Error deleting storage item:', error);
    return false;
  }
};

/**
 * Get all storage categories
 */
export const getStorageCategories = async (): Promise<StorageCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('storage_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting storage categories:', error);
    return [];
  }
};

/**
 * Create a new storage category
 */
export const createStorageCategory = async (
  name: string,
  description?: string
): Promise<StorageCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('storage_categories')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating storage category:', error);
    return null;
  }
};

/**
 * Update a storage item's metadata and categories
 */
export const updateStorageItem = async (
  id: string,
  updates: {
    name?: string;
    metadata?: Record<string, any>;
    categories?: string[];
  }
): Promise<StorageItemWithUrl | null> => {
  try {
    const { name, metadata, categories } = updates;
    
    // Get the user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Update the storage item
    const updateData: any = { updated_by: userId };
    if (name) updateData.name = name;
    if (metadata) updateData.metadata = metadata;

    const { data, error } = await supabase
      .from('storage_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update categories if provided
    if (categories) {
      // First delete existing categories
      const { error: deleteError } = await supabase
        .from('storage_item_categories')
        .delete()
        .eq('item_id', id);

      if (deleteError) throw deleteError;

      // Then insert new categories
      if (categories.length > 0) {
        const categoryEntries = categories.map(categoryId => ({
          item_id: id,
          category_id: categoryId,
        }));

        const { error: insertError } = await supabase
          .from('storage_item_categories')
          .insert(categoryEntries);

        if (insertError) throw insertError;
      }
    }

    // Get the updated item with URL
    return await getStorageItemById(id);
  } catch (error) {
    console.error('Error updating storage item:', error);
    return null;
  }
};

/**
 * Get a signed URL for a private file
 */
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 60 // seconds
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = async (): Promise<{
  totalSize: number;
  fileCount: number;
  bucketStats: { bucket: string; size: number; count: number }[];
}> => {
  try {
    // Get total size and count
    const { data: totalData, error: totalError } = await supabase
      .from('storage_items')
      .select('size');

    if (totalError) throw totalError;

    const totalSize = totalData.reduce((sum, item) => sum + item.size, 0);
    const fileCount = totalData.length;

    // Get stats by bucket
    const { data: bucketData, error: bucketError } = await supabase
      .from('storage_items')
      .select('bucket_id, size');

    if (bucketError) throw bucketError;

    // Group by bucket
    const bucketMap = new Map<string, { size: number; count: number }>();
    bucketData.forEach(item => {
      const current = bucketMap.get(item.bucket_id) || { size: 0, count: 0 };
      bucketMap.set(item.bucket_id, {
        size: current.size + item.size,
        count: current.count + 1,
      });
    });

    const bucketStats = Array.from(bucketMap.entries()).map(([bucket, stats]) => ({
      bucket,
      size: stats.size,
      count: stats.count,
    }));

    return { totalSize, fileCount, bucketStats };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { totalSize: 0, fileCount: 0, bucketStats: [] };
  }
};