
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gatnhnezkxtionzcuork.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc'; // User provided service key, acting as admin for now which is fine for this internal tool

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
