import { supabase } from '../lib/supabase';
import { StorageItemWithUrl } from '../lib/storage';

/**
 * Updates a content reference in a database table
 * @param storageItem The storage item to reference
 * @param tableName The table to update
 * @param columnName The column to update
 * @param recordId The record ID to update
 */
export const updateContentReference = async (
  storageItem: StorageItemWithUrl,
  tableName: string,
  columnName: string,
  recordId: string
): Promise<boolean> => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to update content references');
    }

    // Call the edge function to update the reference
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-content-references`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        storageItemId: storageItem.id,
        tableName,
        columnName,
        recordId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update content reference');
    }

    return true;
  } catch (error) {
    console.error('Error updating content reference:', error);
    return false;
  }
};

/**
 * Gets the storage item ID from a URL
 * @param url The URL to parse
 * @returns The storage item ID or null if not found
 */
export const getStorageItemIdFromUrl = async (url: string): Promise<string | null> => {
  try {
    if (!url) return null;
    
    // Query the storage_items table to find the item with this URL
    const { data, error } = await supabase
      .from('storage_items')
      .select('id, bucket_id, path')
      .eq('url', url)
      .maybeSingle();
    
    if (error) throw error;
    
    // If we found a direct match, return it
    if (data) return data.id;
    
    // Otherwise, try to match by path
    // Extract the path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // The path might be in the format /storage/v1/object/public/bucket_name/path
    // or it might be /bucket_name/path
    // We need to handle both cases
    
    let bucketName = '';
    let filePath = '';
    
    if (pathParts.includes('storage') && pathParts.includes('object') && pathParts.includes('public')) {
      // Format: /storage/v1/object/public/bucket_name/path
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex >= 0 && publicIndex + 1 < pathParts.length) {
        bucketName = pathParts[publicIndex + 1];
        filePath = pathParts.slice(publicIndex + 2).join('/');
      }
    } else {
      // Format: /bucket_name/path
      if (pathParts.length > 1) {
        bucketName = pathParts[1];
        filePath = pathParts.slice(2).join('/');
      }
    }
    
    if (!bucketName || !filePath) return null;
    
    // Query by bucket and path
    const { data: pathData, error: pathError } = await supabase
      .from('storage_items')
      .select('id')
      .eq('bucket_id', bucketName)
      .eq('path', filePath)
      .maybeSingle();
    
    if (pathError) throw pathError;
    
    return pathData?.id || null;
  } catch (error) {
    console.error('Error getting storage item ID from URL:', error);
    return null;
  }
};

/**
 * Migrates existing content to use storage_item_id references
 * @param tableName The table to update
 * @param urlColumn The column containing the URL
 * @param storageItemColumn The column to store the storage_item_id
 */
export const migrateContentReferences = async (
  tableName: string,
  urlColumn: string,
  storageItemColumn: string = 'storage_item_id'
): Promise<{ success: boolean; processed: number; updated: number; errors: number }> => {
  try {
    // Get records that have a URL but no storage_item_id
    const { data, error } = await supabase
      .from(tableName)
      .select(`id, ${urlColumn}`)
      .not(urlColumn, 'is', null)
      .is(storageItemColumn, null);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { success: true, processed: 0, updated: 0, errors: 0 };
    }
    
    let updated = 0;
    let errors = 0;
    
    // Process each record
    for (const record of data) {
      try {
        const url = record[urlColumn];
        if (!url) continue;
        
        const storageItemId = await getStorageItemIdFromUrl(url);
        if (!storageItemId) continue;
        
        // Update the record
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ [storageItemColumn]: storageItemId })
          .eq('id', record.id);
        
        if (updateError) throw updateError;
        
        updated++;
      } catch (e) {
        console.error(`Error processing record ${record.id}:`, e);
        errors++;
      }
    }
    
    return {
      success: true,
      processed: data.length,
      updated,
      errors
    };
  } catch (error) {
    console.error('Error migrating content references:', error);
    return {
      success: false,
      processed: 0,
      updated: 0,
      errors: 1
    };
  }
};