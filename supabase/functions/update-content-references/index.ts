import { createClient } from 'npm:@supabase/supabase-js@2';

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
    const { storageItemId, tableName, columnName, recordId } = await req.json();

    // Validate input
    if (!storageItemId || !tableName || !columnName || !recordId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: storageItemId, tableName, columnName, recordId' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    // First, get the storage item to verify it exists
    const { data: storageItem, error: storageError } = await supabaseAdmin
      .from('storage_items')
      .select('*')
      .eq('id', storageItemId)
      .single();

    if (storageError) {
      return new Response(
        JSON.stringify({ error: `Storage item not found: ${storageError.message}` }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update the record with the storage item reference
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .update({ 
        [columnName]: storageItem.url,
        storage_item_id: storageItemId 
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: `Failed to update record: ${error.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${tableName} record ${recordId} with storage item ${storageItemId}`,
        data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating content reference:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update content reference' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});