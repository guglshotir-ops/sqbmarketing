import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface BirthdayPerson {
  id: string;
  name: string;
  department: string;
  position: string;
}

const defaultData: BirthdayPerson[] = [
  { id: '1', name: 'Aziz Karimov', department: 'Boshqaruv', position: 'Bosh Menejer' },
  { id: '2', name: 'Malika Rahimova', department: 'Moliya', position: 'Moliya bo\'limi boshlig\'i' },
  { id: '3', name: 'Jasur Aliyev', department: 'IT', position: 'IT departamenti direktori' },
];

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

export const useBirthdayData = () => {
  const [data, setData] = useState<BirthdayPerson[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchData = async () => {
    console.log('Fetching birthdays...');
    try {
      const today = new Date();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const queryDate = `2000-${month}-${day}`;

      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('birth_date', queryDate)
        .order('name', { ascending: true });

      if (empError) throw empError;

      if (employees && employees.length > 0) {
        // Robust filter: trim and case-insensitive check
        const filtered = employees.filter(e => {
          const dept = (e.department || "").trim();
          return VALID_DEPARTMENTS.some(vd => vd.toLowerCase() === dept.toLowerCase());
        });

        setData(filtered.map(e => ({
          id: e.id,
          name: e.name || 'Noma\'lum',
          department: e.department || '',
          position: e.position || ''
        })));
      } else {
        setData([]);
      }

    } catch (error) {
      console.error('Data fetch error:', error);
      setData([]); // Don't show default data if DB is connected but empty
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();

    // Safety timeout: always stop loading after 5 seconds
    const safetyTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);

    // Subscribe to changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => {
      clearTimeout(safetyTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  const addPerson = async (name: string, position: string) => {
    try {
      const today = new Date();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const birthDate = `2000-${month}-${day}`; // Mock birthdate for today

      const { error } = await supabase.from('employees').insert([{
        name,
        position,
        department: 'Boshqaruv', // Default
        birth_date: birthDate
      }]);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  };

  const removePerson = async (id: string) => {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  };

  const updatePerson = async (id: string, name: string, position: string) => {
    try {
      const { error } = await supabase.from('employees').update({ name, position }).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  };

  return { data, isLoaded, addPerson, removePerson, updatePerson };
};
