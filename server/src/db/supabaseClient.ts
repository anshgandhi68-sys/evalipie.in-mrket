import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://aewsklnmcyoxdvdjiktg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_UCDJXTGkoIfSYFeIIyzUBg_DnJn7dSy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
