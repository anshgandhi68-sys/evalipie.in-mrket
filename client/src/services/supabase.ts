/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const meta = import.meta as unknown as { env?: Record<string, string> };
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || 'https://aewsklnmcyoxdvdjiktg.supabase.co';
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UCDJXTGkoIfSYFeIIyzUBg_DnJn7dSy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
