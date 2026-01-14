
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gatnhnezkxtionzcuork.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setup() {
    console.log('🚀 Attempting to create tables...');

    // Note: We normally can't run RAW SQL via the client unless an RPC is set up.
    // We will try to do a simple query to see if connection works.
    try {
        const { data, error } = await supabase.from('employees').select('id').limit(1);

        if (error && error.code === '42P01') {
            console.log('❌ Table "employees" does not exist.');
            console.log('Please go to your Supabase SQL Editor and PASTE the following SQL:');
            console.log(`
        CREATE TABLE employees (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          department TEXT,
          position TEXT,
          birth_date DATE,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        CREATE TABLE videos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          url TEXT NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        -- Enable Realtime
        ALTER PUBLICATION supabase_realtime ADD TABLE employees;
        ALTER PUBLICATION supabase_realtime ADD TABLE videos;
      `);
        } else {
            console.log('✅ Tables already exist or connection successful.');
        }
    } catch (err) {
        console.error('Error connecting to Supabase:', err);
    }
}

setup();
