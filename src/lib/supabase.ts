
// Deployment trigger: 2026-01-30 v2
import { createClient } from '@supabase/supabase-js';

// NEW Supabase account (migrated 2026-01-30)
const SUPABASE_URL = 'https://igvzmosxmwvepcfhzppw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlndnptb3N4bXd2ZXBjZmh6cHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDkwNjEsImV4cCI6MjA4NTI4NTA2MX0.o9vO8pz3TL5uJZ5-oWLwRsAhfxcvxv0saGf-q9pq3ig';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
