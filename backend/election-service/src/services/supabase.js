const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_KEY, SUPABASE_STORAGE_URL, SUPABASE_BUCKET_NAME } = process.env;

// Supabase client with service role key
const supabase = createClient(SUPABASE_STORAGE_URL, SUPABASE_KEY);

const supabaseStorage = supabase.storage.from(SUPABASE_BUCKET_NAME);

module.exports = { supabase, supabaseStorage };
