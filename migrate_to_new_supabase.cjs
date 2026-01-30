const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// OLD Supabase (blocked but maybe DB still works)
const oldSupabaseUrl = 'https://sqfuixqtkbwxcwbmjroc.supabase.co';
const oldSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnVpeHF0a2J3eGN3Ym1qcm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDI3NTEsImV4cCI6MjA1MjQxODc1MX0.7clS8dKxnKLnpX4HqexUztyLhS8ycNCsueB5W51q7cc';

// NEW Supabase
const newSupabaseUrl = 'https://igvzmosxmwvepcfhzppw.supabase.co';
const newSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlndnptb3N4bXd2ZXBjZmh6cHB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTcwOTA2MSwiZXhwIjoyMDg1Mjg1MDYxfQ.3IZvvrPtFPk6hbaAxlJOLmTZiSmUythBZFQBtcAayhw';

const oldSupabase = createClient(oldSupabaseUrl, oldSupabaseKey);
const newSupabase = createClient(newSupabaseUrl, newSupabaseKey);

async function migrate() {
    console.log('🔄 Миграция данных между Supabase...\n');

    // Step 1: Export from OLD Supabase
    console.log('📤 Экспорт из СТАРОГО Supabase...');

    let allEmployees = [];
    let from = 0;
    const step = 1000;

    try {
        while (true) {
            const { data, error } = await oldSupabase
                .from('employees')
                .select('name, department, position, birth_date')
                .range(from, from + step - 1)
                .order('name', { ascending: true });

            if (error) {
                console.error('   Ошибка:', error.message);
                break;
            }
            if (!data || data.length === 0) break;

            allEmployees = allEmployees.concat(data);
            console.log(`   Загружено: ${allEmployees.length}...`);

            if (data.length < step) break;
            from += step;
        }
    } catch (e) {
        console.error('   Не удалось подключиться к старой базе:', e.message);
    }

    if (allEmployees.length === 0) {
        console.log('\n❌ Старый Supabase недоступен. Используем локальный CSV...\n');

        // Fallback to local CSV
        const csvContent = fs.readFileSync('database/employees.csv', 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());

        const months = {
            'yanvar': '01', 'fevral': '02', 'mart': '03', 'aprel': '04',
            'may': '05', 'iyun': '06', 'iyul': '07', 'avgust': '08',
            'sentyabr': '09', 'oktyabr': '10', 'noyabr': '11', 'dekabr': '12'
        };

        for (let i = 5; i < lines.length; i++) {
            const line = lines[i];
            const matches = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
            if (!matches || matches.length < 5) continue;

            const values = matches.map(v => v.replace(/^,?"?|"?$/g, '').replace(/""/g, '"').trim());
            const [num, name, department, birthDayMonth, birthYear] = values;

            if (!name || !birthDayMonth || !birthYear) continue;

            const birthParts = birthDayMonth.toLowerCase().match(/(\d+)\s+(\w+)/);
            if (!birthParts) continue;

            const day = birthParts[1].padStart(2, '0');
            const month = months[birthParts[2]];
            if (!month) continue;

            allEmployees.push({
                name: name.trim(),
                department: department.trim(),
                position: '',
                birth_date: `${birthYear}-${month}-${day}`
            });
        }
        console.log(`   Загружено из CSV: ${allEmployees.length} сотрудников\n`);
    }

    // Save backup
    fs.writeFileSync('backup/employees_export.json', JSON.stringify(allEmployees, null, 2));
    console.log(`💾 Сохранено в backup/employees_export.json\n`);

    // Step 2: Import to NEW Supabase
    console.log('📥 Импорт в НОВЫЙ Supabase...');

    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < allEmployees.length; i += batchSize) {
        const batch = allEmployees.slice(i, i + batchSize);
        const { error } = await newSupabase.from('employees').insert(batch);

        if (error) {
            console.error(`   Ошибка batch ${Math.floor(i / batchSize)}: ${error.message}`);
        } else {
            imported += batch.length;
            process.stdout.write(`   Импортировано: ${imported}/${allEmployees.length}\r`);
        }
    }

    console.log(`\n\n✅ Миграция завершена! Импортировано ${imported} сотрудников.\n`);
}

migrate();
