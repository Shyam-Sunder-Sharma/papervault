const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: connectionString && connectionString.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else {
  // Mock / dummy client to allow server to start before credentials are provided
  supabase = {
    storage: {
      from: (bucket) => ({
        createSignedUploadUrl: async (uploadPath) => ({
          data: {
            signedUrl: `https://mock-storage.local/${bucket}/${uploadPath}`,
            token: 'mock-token',
          },
          error: null,
        }),
        getPublicUrl: (uploadPath) => ({
          data: {
            publicUrl: `https://mock-storage.local/${bucket}/${uploadPath}`,
          },
        }),
        remove: async (paths) => ({ error: null }),
      }),
    },
  };
}

module.exports = {
  pool,
  query: (text, params) => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in server/.env');
    }
    return pool.query(text, params);
  },
  supabase,
};
