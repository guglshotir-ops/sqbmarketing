const fs = require('fs');
const data = fs.readFileSync('database/employees.csv', 'utf8').split('\n');
const employees = data.slice(5).filter(l => l.trim() && l.includes(','));

// Valid departments from code (simplified for matching)
const VALID_DEPT_KEYWORDS = [
  'axborot texnologiyalari',
  'marketing',
  'risk menejment',
  'ichki audit',
  'ichki xavfsizlik',
  'kredit monitoringi',
  'operatsion',
  'raqamli biznes',
  'investitsion banking',
  'buxgalteriya',
  'yuridik',
  'komplaens',
  'korporativ biznes',
  'chakana biznes',
  'mikro va kichik biznes',
  'kreditlash',
  'aktivlar va passivlar',
  'aloqa markazi',
  'rahbariyat',
  'moliyaviy menejment',
  'tranzaksion banking'
];

// Find people born on January 15
const jan15 = employees.filter(line => {
  const parts = line.split(',');
  const date = (parts[3] || '').toLowerCase().trim();
  return date === '15 yanvar';
});

console.log('=== 15 YANVAR (ERTAGA) ===');
console.log('CSV da jami: ' + jan15.length + ' kishi');
console.log('');

const willShow = [];
const willNotShow = [];

jan15.forEach(line => {
  const parts = line.split(',');
  const name = parts[1] || '';
  const dept = (parts[2] || '').toLowerCase();
  
  // Check if department matches any keyword
  const matches = VALID_DEPT_KEYWORDS.some(kw => dept.includes(kw));
  
  if (matches) {
    willShow.push({name, dept: parts[2].slice(0,60)});
  } else {
    willNotShow.push({name, dept: parts[2].slice(0,60)});
  }
});

console.log('✅ EKRANDA KORINADI: ' + willShow.length + ' kishi');
console.log('─'.repeat(50));
willShow.forEach((p, i) => console.log((i+1) + '. ' + p.name));

console.log('');
console.log('❌ KORINMAYDI (departament mos emas): ' + willNotShow.length + ' kishi');
console.log('─'.repeat(50));
willNotShow.slice(0, 10).forEach((p, i) => console.log((i+1) + '. ' + p.name + ' | ' + p.dept));
if (willNotShow.length > 10) console.log('... va yana ' + (willNotShow.length - 10) + ' kishi');
