const fs = require('fs');
const data = fs.readFileSync('database/employees.csv', 'utf8').split('\n');
const employees = data.slice(5).filter(l => l.trim() && l.includes(','));

// Updated valid departments (exact names from user)
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
  const fullDept = (parts[2] || '');
  
  // Check if department STARTS WITH any valid department name
  const matches = VALID_DEPARTMENTS.some(vd => 
    fullDept.toLowerCase().startsWith(vd.toLowerCase())
  );
  
  if (matches) {
    willShow.push({name, dept: fullDept.slice(0,70)});
  } else {
    willNotShow.push({name, dept: fullDept.slice(0,70)});
  }
});

console.log('✅ EKRANDA KORINADI: ' + willShow.length + ' kishi');
console.log('─'.repeat(60));
willShow.forEach((p, i) => console.log((i+1) + '. ' + p.name + '\n   ' + p.dept));

console.log('');
console.log('❌ KORINMAYDI (departament mos emas): ' + willNotShow.length + ' kishi');
console.log('─'.repeat(60));
willNotShow.forEach((p, i) => console.log((i+1) + '. ' + p.name + '\n   ' + p.dept));
