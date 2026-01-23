
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gatnhnezkxtionzcuork.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VALID_DEPARTMENTS = [
    "O'rta biznes markazi",
    "Agrosanoat klasterini moliyalashtirishni muvofiqlashtirish xizmati",
    "Aktivlar va passivlar xizmati",
    "Aloqa markazi",
    "Axborotlarni muhofaza qilish markazi",
    "Aholini moliyaviy qo'llab-quvvatlash va tadbirlarga jalb qilish xizmati",
    "Axborot texnoloyiyalari departamenti",
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

async function checkBirthdays() {
    const today = new Date();
    const monthDay = `-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    console.log(`Checking for birthdays ending in: ${monthDay}`);

    const { data: employees, error } = await supabase
        .from('employees')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const todayBirthdays = employees.filter(e => e.birth_date && e.birth_date.endsWith(monthDay));

    console.log(`Total birthdays found in DB for today: ${todayBirthdays.length}`);

    todayBirthdays.forEach(e => {
        const dept = (e.department || "").trim().toLowerCase();
        const matches = VALID_DEPARTMENTS.some(vd => {
            const validDept = vd.toLowerCase();
            if (dept === validDept) return true;
            if (dept.includes("ma'muriy") && dept.includes("xo'jalik") &&
                validDept.includes("ma'muriy") && validDept.includes("xo'jalik")) {
                return true;
            }
            return dept.includes(validDept) || validDept.includes(dept);
        });

        console.log(`- ${e.name} | Dept: "${e.department}" | Matches Filter: ${matches ? '✅' : '❌'}`);
    });

    // Also check if any are coming up tomorrow just in case
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDay = `-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
    const tomorrowBirthdays = employees.filter(e => e.birth_date && e.birth_date.endsWith(tomorrowDay));
    console.log(`\nTomorrow (${tomorrowDay}) birthdays: ${tomorrowBirthdays.length}`);
}

checkBirthdays();
