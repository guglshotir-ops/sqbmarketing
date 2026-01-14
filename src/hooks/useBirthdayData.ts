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
  const [activeVideos, setActiveVideos] = useState<string[]>(['/sqbmarketing/videos/fin_uzb.mp4']);

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

      // Smart Video Fetching & Scheduling
      try {
        const now = new Date().toISOString();
        const { data: videos } = await supabase
          .from('videos')
          .select('*')
          .eq('active', true)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (videos && videos.length > 0) {
          // Filter videos by schedule
          const currentValidVideos = videos.filter(v => {
            const hasStarted = !v.start_time || new Date(v.start_time) <= new Date();
            const hasNotEnded = !v.end_time || new Date(v.end_time) >= new Date();
            return hasStarted && hasNotEnded;
          });

          setActiveVideos(currentValidVideos.map(v => v.url));
        } else {
          setActiveVideos(['/sqbmarketing/videos/fin_uzb.mp4']); // Fallback
        }
      } catch (e) {
        console.error('Video fetch error:', e);
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

  return { data, activeVideos, isLoaded };
};
