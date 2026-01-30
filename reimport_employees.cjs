const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// New Supabase credentials
const supabaseUrl = 'https://igvzmosxmwvepcfhzppw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlndnptb3N4bXd2ZXBjZmh6cHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDkwNjEsImV4cCI6MjA4NTI4NTA2MX0.o9vO8pz3TL5uJZ5-oWLwRsAhfxcvxv0saGf-q9pq3ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function reimportEmployees() {
    console.log('📊 Re-importing employees with correct department names...\n');

    // Read the correct CSV file
    const csvPath = path.join(__dirname, 'contents', 'employees_rows (1).csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    // Skip header
    const dataLines = lines.slice(1);
    console.log(`📄 Found ${dataLines.length} employees in correct CSV\n`);

    // Parse CSV
    const employees = dataLines.map(line => {
        // Parse CSV properly handling commas
        const parts = line.split(',');
        const id = parts[0];
        const name = parts[1];
        const department = parts[2];
        const position = parts[3];
        const birth_date = parts[4];

        return { id, name, department, position, birth_date };
    }).filter(e => e.id && e.name && e.birth_date);

    console.log(`✅ Parsed ${employees.length} valid employees\n`);

    // Step 1: Delete all existing data
    console.log('🗑️ Deleting existing data...');
    const { error: deleteError } = await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error('Delete error:', deleteError);
    } else {
        console.log('✅ Existing data deleted\n');
    }

    // Step 2: Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        const { error: insertError } = await supabase.from('employees').insert(batch);

        if (insertError) {
            console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, insertError.message);
        } else {
            inserted += batch.length;
            process.stdout.write(`\r📥 Inserted: ${inserted}/${employees.length}`);
        }
    }

    console.log('\n\n✅ Import complete!');

    // Verify
    const { count } = await supabase.from('employees').select('*', { count: 'exact', head: true });
    console.log(`📊 Total employees in database: ${count}`);

    // Show sample data
    const { data: sample } = await supabase.from('employees').select('name, department').limit(5);
    console.log('\n📋 Sample data:');
    sample?.forEach(e => console.log(`  - ${e.name.substring(0, 30)}... | ${e.department}`));
}

reimportEmployees().catch(console.error);
