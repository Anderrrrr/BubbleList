import { createClient } from "@supabase/supabase-js";

export type TodoRow = {
  id: string;
  title: string;
  details: string | null;
  importance: number;
  urgency: number;
  done: boolean;
  created_at?: string;
  updated_at?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
