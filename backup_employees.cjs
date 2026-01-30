const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Current Supabase credentials
const supabaseUrl = 'https://sqfuixqtkbwxcwbmjroc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnVpeHF0a2J3eGN3Ym1qcm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDI3NTEsImV4cCI6MjA1MjQxODc1MX0.7clS8dKxnKLnpX4HqexUztyLhS8ycNCsueB5W51q7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function backupData() {
    console.log('🔄 Экспорт данных из Supabase...\n');

    try {
        // Export all employees
        let allEmployees = [];
        let from = 0;
        const step = 1000;

        while (true) {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .range(from, from + step - 1)
                .order('name', { ascending: true });

            if (error) throw error;
            if (!data || data.length === 0) break;

            allEmployees = allEmployees.concat(data);
            console.log(`  Загружено: ${allEmployees.length} записей...`);

            if (data.length < step) break;
            from += step;
        }

        // Save to JSON
        const timestamp = new Date().toISOString().split('T')[0];
        const jsonFileName = `backup/employees_backup_${timestamp}.json`;

        // Create backup folder if not exists
        if (!fs.existsSync('backup')) {
            fs.mkdirSync('backup');
        }

        fs.writeFileSync(jsonFileName, JSON.stringify(allEmployees, null, 2), 'utf-8');
        console.log(`\n✅ Сохранено ${allEmployees.length} сотрудников в ${jsonFileName}`);

        // Also save as CSV
        const csvFileName = `backup/employees_backup_${timestamp}.csv`;
        const headers = ['id', 'name', 'department', 'position', 'birth_date'];
        const csvContent = [
            headers.join(','),
            ...allEmployees.map(e =>
                headers.map(h => `"${(e[h] || '').toString().replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n');

        fs.writeFileSync(csvFileName, csvContent, 'utf-8');
        console.log(`✅ Сохранено ${allEmployees.length} сотрудников в ${csvFileName}`);

        console.log('\n📦 Бэкап завершён! Данные в безопасности.\n');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

backupData();
