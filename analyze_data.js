
const fs = require('fs');

const VALID_DEPARTMENTS = [
    "Agrosanoat klasterini moliya-rishni muvofiqlashtirish d.",
    "Aktivlar va passivlar xizmati",
    "Aloqa markazi",
    "Axborot texnologiyalari departamenti",
    "Axborotlarni muhofaza qilish markazi",
    "Aholini moliyaviy qo‘llab-quvvatlash va tadbir-ka jalb qilish d.",
    "Bank kartalari tizimlarini qo‘llab-quvvatlash dep-ti",
    "Bank tarmoqlari faoliyatini muvofiqlashtirish d.",
    "Bankni strategik rivojlantirish departamenti",
    "Birinchi bo‘lim",
    "Buxgalteriya hisobi va hisoboti departamenti",
    "G‘aznachilik departamenti",
    "Ijroni boshqarish va rivoj-ni tahlil qilish dep",
    "Investitsion banking departamenti",
    "Ichki audit departamenti",
    "Ichki xavfsizlik departamenti",
    "Komplaens nazorat departamenti",
    "Korporativ бизнес departamenti",
    "Korporativ boshqaruv xizmati",
    "Korporativ markaz",
    "Korrupsiyaga qarshi kurashish xizmati",
    "Kredit monitoringi va nazorati departamenti",
    "Kreditlarni ma’qullash departamenti",
    "Kreditlash departamenti",
    "Kredit qarzdorliklari bilan ishlash departamenti",
    "Qurilish materiallari sanoatini rivojlantirish dep.",
    "Loyiha boshqaruvi ofisi",
    "Marketing departamenti",
    "Ma’lumotlarni boshqarish markazi",
    "Ma’muriy xo‘jalik departamenti",
    "Mikro va kichik biznes departamenti",
    "Moliya institutlari va investorlar bilan ishlash dep.",
    "Moliyaviy menejment xizmati",
    "Operatsion departament",
    "Raqamli biznes departamenti",
    "Rahbariyat",
    "Risk menejment departamenti",
    "Sun’iy intellekt departamenti",
    "Sustainable Finance departamenti",
    "Tranzaksion banking departamenti",
    "Xalqaro moliyaviy hisobotlar va konsalting",
    "Xaridlarni tashkil etish xizmati",
    "Xodimlar va tashkiliy rivojlantirish departamenti",
    "Chakana biznes departamenti",
    "Yuridik departament",
    "Yakuniy nazorat xizmati",
    "O‘rta biznes markazi"
];

function analyze() {
    const text = fs.readFileSync('database/employees.csv', 'utf8');
    const lines = text.split(/\r?\n/);

    let total = 0;
    let todayCount = 0;
    let matchedCount = 0;
    let unmatched = [];

    lines.forEach(line => {
        const row = line.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
        if (row.length < 4 || isNaN(parseInt(row[0]))) return;

        total++;
        const name = row[1].replace(/"/g, '');
        const info = row[2].replace(/"/g, '');
        const birthday = row[3].replace(/"/g, '');

        if (birthday.toLowerCase().includes('13 yanvar')) {
            todayCount++;
        }

        let found = false;
        const cleanInfo = info.toLowerCase().replace(/[^a-zа-я]/gi, '');

        for (const vd of VALID_DEPARTMENTS) {
            const cleanVd = vd.toLowerCase().replace(/[^a-zа-я]/gi, '');
            if (cleanInfo.includes(cleanVd) || cleanVd.includes(cleanInfo.split(' ')[0])) {
                found = true;
                break;
            }
        }

        if (found) {
            matchedCount++;
        } else {
            unmatched.push(info);
        }
    });

    console.log('--- РЕЗУЛЬТАТЫ АНАЛИЗА ---');
    console.log(`1. Сегодня дней рождения: ${todayCount}`);
    console.log(`2. Старые департаменты совпали: ${matchedCount} из ${total}`);
    console.log(`3. Мы "кикнули" (не подошли под список): ${total - matchedCount} человек`);

    if (unmatched.length > 0) {
        console.log('\nПримеры департаментов, которые не вошли в список:');
        const uniqueUnmatched = [...new Set(unmatched)].slice(0, 10);
        uniqueUnmatched.forEach(d => console.log(` - ${d}`));
    }
}

analyze();
