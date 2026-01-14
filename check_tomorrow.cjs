const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gatnhnezkxtionzcuork.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc'
);

async function check() {
  // Get all employees and filter by date
  const { data: all, error } = await supabase.from('employees').select('*');

  if (error) {
    console.log('Error:', error);
    return;
  }

  // Filter for Jan 15 (tomorrow)
  const jan15 = all.filter(e => {
    const d = e.birth_date;
    return d && d.endsWith('-01-15');
  });

  console.log('=== 15 YANVAR (ERTAGA) ===');
  console.log('Jami: ' + jan15.length + ' kishi\n');
  
  jan15.forEach((p, i) => {
    console.log((i+1) + '. ' + p.name);
    console.log('   ' + p.department + ' | ' + p.position);
  });
  
  // Filter for Jan 14 (today)
  const jan14 = all.filter(e => {
    const d = e.birth_date;
    return d && d.endsWith('-01-14');
  });

  console.log('\n=== 14 YANVAR (BUGUN) ===');
  console.log('Jami: ' + jan14.length + ' kishi\n');
  
  jan14.forEach((p, i) => {
    console.log((i+1) + '. ' + p.name);
    console.log('   ' + p.department + ' | ' + p.position);
  });
}

check();
