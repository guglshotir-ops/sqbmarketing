
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://gatnhnezkxtionzcuork.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const monthsMap = {
    'yanvar': '01', 'fevral': '02', 'mart': '03', 'aprel': '04',
    'may': '05', 'iyun': '06', 'iyul': '07', 'avgust': '08',
    'sentabr': '09', 'sentyabr': '09', 'sentaybr': '09', 'oktabr': '10', 'oktyabr': '10', 'noyabr': '11', 'dekabr': '12',
    'январь': '01', 'февраль': '02', 'март': '03', 'апрель': '04',
    'май': '05', 'июнь': '06', 'июль': '07', 'август': '08',
    'сентябрь': '09', 'октябрь': '10', 'ноябрь': '11', 'декабрь': '12'
};

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
    "Korporativ biznes departamenti",
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

const STANDARDIZED_POSITIONS = [
    "Departament direktori",
    "Direktor o'rinbosari",
    "Bosh menejer",
    "Yetakchi menejer",
    "Menejer",
    "Kichik menejer",
    "Bosh mutaxassis",
    "Bo'lim boshlig'i",
    "Boshqarma boshlig'i o'rinbosari",
    "Ish yurituvchi",
    "Xizmat rahbari",
    "Xo'jalik mudiri",
    "Bo'lim boshlig'i o'rinbosari"
];

function normalizeUz(str) {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/`|’|‘|'/g, "'") // Standardize all ticks to '
        .replace(/[^a-zа-я']/gi, ''); // Keep only letters and the standardized tick
}

function parseInfo(info) {
    if (!info) return { dept: '', pos: '' };
    info = info.replace(/"/g, '').replace(/`/g, "'").replace(/’/g, "'").trim();

    // 1. Try to find a match from VALID_DEPARTMENTS
    let matchedDept = '';
    const cleanInfo = normalizeUz(info);

    for (const validDept of VALID_DEPARTMENTS) {
        const cleanValid = normalizeUz(validDept);
        if (cleanInfo.includes(cleanValid)) {
            matchedDept = validDept;
            break;
        }
    }

    // 2. Position standardization
    let pos = '';
    const sortedPositions = [...STANDARDIZED_POSITIONS].sort((a, b) => b.length - a.length);

    for (const standardPos of sortedPositions) {
        const cleanStandard = normalizeUz(standardPos);
        if (cleanInfo.includes(cleanStandard)) {
            pos = standardPos;
            break;
        }
    }

    // Fallback if no standardized position found
    if (!pos) {
        const parts = info.split(/\s+/);
        pos = parts.length > 2 ? parts.slice(-2).join(' ') : parts[0];
        pos = pos.replace(/[,\.]/g, '').trim();
    }

    pos = pos.toUpperCase();

    return { dept: matchedDept || info, pos };
}

function parseDate(birthdayStr) {
    if (!birthdayStr) return '2000-01-01';
    // Typical: "1 yanvar" or "1-yanvar"
    const clean = birthdayStr.toLowerCase().replace(/-/g, ' ').trim();
    const parts = clean.split(' ');
    if (parts.length < 2) return '2000-01-01';

    const day = parts[0].padStart(2, '0');
    const monthName = parts[1];
    const month = monthsMap[monthName] || '01';

    return `2000-${month}-${day}`;
}

async function importData() {
    console.log('📦 Starting local import from database/employees.csv...');

    try {
        const filePath = 'e:/2026/007-Code/birthday-beacon-main/birthday-beacon-main/database/employees.csv';
        const text = fs.readFileSync(filePath, 'utf8');

        // Split by lines, handle CRLF
        const lines = text.split(/\r?\n/);

        const employees = [];
        console.log(`Read ${lines.length} lines.`);

        // Data usually starts after headers. Looking for row 6 or 7.
        // In our CSV, line 1-5 might be headers.
        // Let's find the header row first.
        let dataStarted = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            // Split CSV line correctly (handling quotes)
            const row = line.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
            if (row.length < 4) continue;

            // Detect start of data (usually where column 1 is a number)
            const firstCol = row[0].trim();
            if (!dataStarted) {
                if (!isNaN(parseInt(firstCol))) {
                    dataStarted = true;
                } else {
                    continue;
                }
            }

            let name = row[1]?.replace(/"/g, '').trim();
            const info = row[2]?.replace(/"/g, '').trim();
            const birthdayStr = row[3]?.replace(/"/g, '').trim();

            if (!name || name.length < 3) continue;

            // Remove patronymic (otchestvo) - keep only first two words (Lastname Firstname)
            const nameParts = name.split(/\s+/);
            if (nameParts.length >= 2) {
                name = `${nameParts[0]} ${nameParts[1]}`;
            }
            const { dept, pos } = parseInfo(info);
            const birthDate = parseDate(birthdayStr);

            if (birthDate) {
                employees.push({
                    name,
                    department: dept,
                    position: pos,
                    birth_date: birthDate
                });
            }
        }

        console.log(`📊 Found ${employees.length} valid employees. Clearing old data and uploading...`);

        // Reliability fix: Clear ALL existing data to avoid duplicates
        const { error: deleteError } = await supabase
            .from('employees')
            .delete()
            .neq('name', '___NON_EXISTENT___');

        if (deleteError) {
            console.warn('Delete error (maybe table empty?):', deleteError);
        }

        // Chunk uploads (500 per request)
        const chunkSize = 500;
        for (let i = 0; i < employees.length; i += chunkSize) {
            const chunk = employees.slice(i, i + chunkSize);
            const { error } = await supabase.from('employees').insert(chunk);
            if (error) throw error;
            console.log(`✅ Uploaded chunk ${i / chunkSize + 1}`);
        }

        console.log('🚀 SUCCESS! Database is full.');

    } catch (err) {
        console.error('❌ Import failed:', err);
    }
}

importData();
