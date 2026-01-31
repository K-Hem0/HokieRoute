import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processSnowflakeData(snowflakeData: any, corsHeaders: Record<string, string>) {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Process and insert/update routes with safety data
  const results = {
    processed: 0,
    updated: 0,
    errors: [] as string[],
  };

  // Snowflake returns data in a specific format - parse accordingly
  const rows = snowflakeData.data || [];
  const columns = snowflakeData.resultSetMetaData?.rowType?.map((col: any) => col.name.toLowerCase()) || [];

  console.log(`Processing ${rows.length} rows with columns: ${columns.join(', ')}`);

  for (const row of rows) {
    try {
      // Map row array to object using column names
      const record: Record<string, any> = {};
      columns.forEach((col: string, idx: number) => {
        record[col] = row[idx];
      });

      // Extract safety fields - adjust these based on your actual Snowflake schema
      const routeId = record.route_id || record.id;
      const routeName = record.route_name || record.name;
      const safetyScore = record.safety_score || record.score || 'moderate';
      const safetyInsight = record.safety_insight || record.insight || '';

      if (routeId) {
        // Update existing route by ID
        const { error } = await supabase
          .from('routes')
          .update({
            safety_score: safetyScore,
            safety_insight: safetyInsight,
          })
          .eq('id', routeId);

        if (error) {
          results.errors.push(`Failed to update route ${routeId}: ${error.message}`);
        } else {
          results.updated++;
        }
      } else if (routeName) {
        // Try to match by name
        const { error } = await supabase
          .from('routes')
          .update({
            safety_score: safetyScore,
            safety_insight: safetyInsight,
          })
          .eq('name', routeName);

        if (error) {
          results.errors.push(`Failed to update route ${routeName}: ${error.message}`);
        } else {
          results.updated++;
        }
      }

      results.processed++;
    } catch (rowError) {
      results.errors.push(`Row processing error: ${rowError}`);
    }
  }

  console.log(`Import complete: ${results.processed} processed, ${results.updated} updated`);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Safety data import completed',
      results,
      snowflake_rows_returned: rows.length,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Snowflake credentials
    const account = Deno.env.get('SNOWFLAKE_ACCOUNT');
    const username = Deno.env.get('SNOWFLAKE_USERNAME');
    const password = Deno.env.get('SNOWFLAKE_PASSWORD');
    const warehouse = Deno.env.get('SNOWFLAKE_WAREHOUSE');
    const database = Deno.env.get('SNOWFLAKE_DATABASE');
    const schema = Deno.env.get('SNOWFLAKE_SCHEMA');

    if (!account || !username || !password || !warehouse || !database || !schema) {
      throw new Error('Missing Snowflake credentials');
    }

    // Parse request body for optional query customization
    const body = await req.json().catch(() => ({}));
    const tableName = body.table_name || 'SAFETY_SCORES';
    const limit = body.limit || 1000;

    console.log(`Connecting to Snowflake account: ${account}`);

    // Snowflake SQL REST API endpoint
    const snowflakeUrl = `https://${account}.snowflakecomputing.com/api/v2/statements`;

    // Execute query to fetch safety data
    const query = `SELECT * FROM ${database}.${schema}.${tableName} LIMIT ${limit}`;

    console.log(`Executing query: ${query}`);

    // Try with Basic auth first (works for some Snowflake setups)
    const snowflakeResponse = await fetch(snowflakeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Accept': 'application/json',
        'User-Agent': 'lovable-edge-function/1.0',
      },
      body: JSON.stringify({
        statement: query,
        timeout: 60,
        database: database,
        schema: schema,
        warehouse: warehouse,
      }),
    });

    if (!snowflakeResponse.ok) {
      const errorText = await snowflakeResponse.text();
      console.error('Snowflake API error:', snowflakeResponse.status, errorText);
      
      // Check if it's an auth issue
      if (snowflakeResponse.status === 401 || snowflakeResponse.status === 403) {
        throw new Error(`Snowflake authentication failed. Please verify credentials are correct. Status: ${snowflakeResponse.status}`);
      }
      
      throw new Error(`Snowflake API error: ${snowflakeResponse.status} - ${errorText.substring(0, 500)}`);
    }

    const snowflakeData = await snowflakeResponse.json();
    console.log('Snowflake response received, processing data...');

    return await processSnowflakeData(snowflakeData, corsHeaders);

  } catch (error) {
    console.error('Snowflake import error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
