import { createClient } from 'npm:@supabase/supabase-js@2';

// This function handles storage events from Supabase Storage webhooks
// It updates the storage_items table when files are uploaded, updated, or deleted

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get request body
    const payload = await req.json();
    
    // Validate webhook signature (in production, you should verify the signature)
    // const signature = req.headers.get('x-supabase-signature');
    // if (!verifySignature(payload, signature)) {
    //   throw new Error('Invalid webhook signature');
    // }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { type, record } = payload;
    
    // Process based on event type
    switch (type) {
      case 'INSERT':
      case 'UPDATE':
        // File was created or updated
        await handleFileCreatedOrUpdated(supabaseAdmin, record);
        break;
      case 'DELETE':
        // File was deleted
        await handleFileDeleted(supabaseAdmin, record);
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing storage webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process webhook' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleFileCreatedOrUpdated(supabase, record) {
  const { id, name, bucket_id, owner, metadata, created_at, updated_at, path_tokens } = record;
  
  // Construct the full path
  const path = path_tokens.join('/');
  
  // Get file size and mime type from metadata
  const size = metadata.size || 0;
  const mimeType = metadata.mimetype || 'application/octet-stream';
  
  // Check if the file already exists in our database
  const { data: existingItem } = await supabase
    .from('storage_items')
    .select('id')
    .eq('bucket_id', bucket_id)
    .eq('path', path)
    .maybeSingle();
  
  if (existingItem) {
    // Update existing record
    await supabase
      .from('storage_items')
      .update({
        name,
        size,
        mime_type: mimeType,
        metadata,
        updated_by: owner,
        updated_at
      })
      .eq('id', existingItem.id);
  } else {
    // Insert new record
    await supabase
      .from('storage_items')
      .insert({
        bucket_id,
        name,
        path,
        size,
        mime_type: mimeType,
        metadata,
        created_by: owner,
        updated_by: owner,
        created_at,
        updated_at
      });
  }
}

async function handleFileDeleted(supabase, record) {
  const { bucket_id, path_tokens } = record;
  
  // Construct the full path
  const path = path_tokens.join('/');
  
  // Delete the record from our database
  await supabase
    .from('storage_items')
    .delete()
    .eq('bucket_id', bucket_id)
    .eq('path', path);
}