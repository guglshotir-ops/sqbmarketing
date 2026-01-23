const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gatnhnezkxtionzcuork.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Valid departments (head office only, no "Tarmoqlarda")
const VALID_DEPARTMENTS = [
  "O'rta biznes markazi",
  "Agrosanoat klasterini moliyalashtirishni muvofiqlashtirish xizmati",
  "Aktivlar va passivlar xizmati",
  "Aloqa markazi",
  "Axborotlarni muhofaza qilish markazi",
  "Aholini moliyaviy qo'llab-quvvatlash va tadbirlarga jalb qilish xizmati",
  "Axborot texnologiyalari departamenti",
  "Bank kartalari tizimlarini qo'llab-quvvatlash departamenti",
  "Bank tarmoqlari faoliyatini muvofiqlashtirish departamenti",
  "Bankni strategik rivojlantirish departamenti",
  "Birinchi bo'lim",
  "Buxgalteriya hisobi va hisobot departamenti",
  "Ijroni boshqarish va rivojlanishni tahlil qilish departamenti",
  "Investitsion bank departamenti",
  "Ichki audit departamenti",
  "Ichki xavfsizlik departamenti",
  "Komplaens nazorat departamenti",
  "Korporativ biznes departamenti",
  "Korporativ boshqaruv xizmati",
  "Korporativ markaz",
  "Korrupsiyaga qarshi kurashish xizmati",
  "Kredit monitoringi va nazorati departamenti",
  "Kreditlarni ma'qullash departamenti",
  "Kreditlash departamenti",
  "Loyiha boshqaruvi ofisi",
  "Marketing departamenti",
  "Ma'lumotlarni boshqarish markazi",
  "Ma'muriy-xo'jalik departamenti",
  "Ma'muriy xo'jalik departamenti",
  "Mikro va kichik biznes departamenti",
  "Moliya institutlari va investorlar bilan ishlash departamenti",
  "Moliyaviy menejment xizmati",
  "Operatsion departament",
  "Raqamli biznes departamenti",
  "Rahbariyat",
  "Risk menejment departamenti",
  "Sun'iy intellekt departamenti",
  "Tranzaksion bank departamenti",
  "Xalqaro moliyaviy hisobotlar va konsalting xizmati",
  "Xaridlarni tashkil etish xizmati",
  "Xodimlar va tashkiliy rivojlantirish departamenti",
  "Chakana biznes departamenti",
  "Yuridik departament",
  "Yakuniy nazorat xizmati",
  "Kredit qarzdorliklari bilan ishlash departamenti",
  "G'aznachilik departamenti",
  "Qurilish materiallari sanoatini rivojlantirish departamenti",
  "Sustainable Finance departamenti"
];

// Month name to number mapping
const MONTHS = {
  'yanvar': '01', 'fevral': '02', 'mart': '03', 'aprel': '04',
  'may': '05', 'iyun': '06', 'iyul': '07', 'avgust': '08',
  'sentyabr': '09', 'sentabr': '09', 'oktyabr': '10', 'oktabr': '10',
  'noyabr': '11', 'dekabr': '12'
};

function parseDate(dayStr, yearStr) {
  // dayStr: "15 yanvar", yearStr: "1990"
  const parts = dayStr.toLowerCase().trim().split(' ');
  if (parts.length !== 2) return null;

  const day = parts[0].padStart(2, '0');
  const monthName = parts[1];
  const month = MONTHS[monthName];

  if (!month) return null;

  const year = yearStr.trim() || '2000';
  return `${year}-${month}-${day}`;
}

function isValidDepartment(dept) {
  // Must start with valid department and NOT contain "Tarmoqlarda" (regional)
  if (dept.toLowerCase().includes('tarmoqlarda')) return false;

  return VALID_DEPARTMENTS.some(vd =>
    dept.toLowerCase().startsWith(vd.toLowerCase())
  );
}

async function sync() {
  console.log('🔄 Starting synchronization...\n');

  // Read CSV
  const data = fs.readFileSync('database/employees.csv', 'utf8').split('\n');
  const csvRows = data.slice(5).filter(l => l.trim() && l.includes(','));

  console.log(`📁 CSV: ${csvRows.length} total rows`);

  // Parse and filter employees
  const validEmployees = [];
  const skipped = { regional: 0, invalidDept: 0, invalidDate: 0 };

  csvRows.forEach(line => {
    const parts = line.split(',');
    const name = (parts[1] || '').trim();
    const dept = (parts[2] || '').trim();
    const dayMonth = (parts[3] || '').trim();
    const year = (parts[4] || '').trim();

    if (!name || !dayMonth) {
      skipped.invalidDate++;
      return;
    }


    if (!isValidDepartment(dept)) {
      skipped.invalidDept++;
      return;
    }

    // Parse date
    const birthDate = parseDate(dayMonth, year);
    if (!birthDate) {
      skipped.invalidDate++;
      return;
    }

    // Extract position from department string (after the main department name)
    let position = 'Xodim';
    const deptParts = dept.split(' ');
    if (deptParts.length > 2) {
      // Try to find position keywords
      const posKeywords = ['Menejer', 'Direktor', 'Boshlig', 'Mutaxassis', 'Operator', 'Katta', 'Kichik', 'Bosh'];
      for (const kw of posKeywords) {
        if (dept.includes(kw)) {
          const idx = dept.indexOf(kw);
          position = dept.slice(idx).split(' ').slice(0, 3).join(' ');
          break;
        }
      }
    }

    // Get main department name
    let mainDept = dept;
    for (const vd of VALID_DEPARTMENTS) {
      if (dept.toLowerCase().startsWith(vd.toLowerCase())) {
        mainDept = vd;
        break;
      }
    }

    validEmployees.push({
      name: name,
      department: mainDept,
      position: position,
      birth_date: birthDate
    });
  });

  console.log(`\n📊 Filtering results:`);
  console.log(`   ✅ Valid (head office): ${validEmployees.length}`);
  console.log(`   ❌ Regional (Tarmoqlarda): ${skipped.regional}`);
  console.log(`   ❌ Invalid department: ${skipped.invalidDept}`);
  console.log(`   ❌ Invalid date: ${skipped.invalidDate}`);

  // Count by month
  const byMonth = {};
  validEmployees.forEach(e => {
    const m = e.birth_date.slice(5, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  });

  console.log(`\n📅 By month (valid only):`);
  Object.keys(byMonth).sort().forEach(m => {
    const monthNames = ['', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    console.log(`   ${monthNames[parseInt(m)]}: ${byMonth[m]}`);
  });

  // Clear existing data
  console.log(`\n🗑️  Clearing existing Supabase data...`);
  const { error: deleteError } = await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return;
  }
  console.log('   ✅ Cleared');

  // Insert new data in batches
  console.log(`\n📤 Uploading ${validEmployees.length} employees to Supabase...`);

  const batchSize = 100;
  let uploaded = 0;

  for (let i = 0; i < validEmployees.length; i += batchSize) {
    const batch = validEmployees.slice(i, i + batchSize);
    const { error: insertError } = await supabase.from('employees').insert(batch);

    if (insertError) {
      console.error(`   ❌ Batch ${i}-${i + batch.length} error:`, insertError.message);
    } else {
      uploaded += batch.length;
      process.stdout.write(`   Uploaded: ${uploaded}/${validEmployees.length}\r`);
    }
  }

  console.log(`\n\n✅ SYNC COMPLETE!`);
  console.log(`   Total uploaded: ${uploaded} employees`);

  // Verify
  const { count } = await supabase.from('employees').select('*', { count: 'exact', head: true });
  console.log(`   Supabase count: ${count}`);
}

sync().catch(console.error);
