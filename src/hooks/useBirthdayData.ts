import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface BirthdayPerson {
  id: string;
  name: string;
  department: string;
  position: string;
}

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

export interface VideoItem {
  url: string;
  priority: number;
}

export interface DayBirthday {
  date: string;
  dayName: string;
  count: number;
  people: Array<{ name: string; department: string }>;
}

export const useBirthdayData = () => {
  const [data, setData] = useState<BirthdayPerson[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeVideos, setActiveVideos] = useState<VideoItem[]>([]);

  const fetchAllEmployees = async () => {
    let all: any[] = [];
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
      all = all.concat(data);
      if (data.length < step) break;
      from += step;
    }
    return all;
  };

  const fetchData = async () => {
    try {
      const today = new Date();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const monthDay = `-${month}-${day}`;

      const allEmployees = await fetchAllEmployees();

      // Filter by date
      const employeesToday = allEmployees.filter(e =>
        e.birth_date && e.birth_date.endsWith(monthDay)
      );

      // Filter by department (exclude regional)
      const filtered = employeesToday.filter(e => {
        const dept = (e.department || "").trim().toLowerCase();
        if (dept.includes('tarmoqlarda')) return false;

        return VALID_DEPARTMENTS.some(vd => {
          const vdLower = vd.toLowerCase();
          return dept.includes(vdLower) || vdLower.includes(dept);
        });
      });

      setData(filtered.map(e => {
        const nameParts = (e.name || '').split(' ');
        return {
          id: e.id,
          name: nameParts.slice(0, 2).join(' '),
          department: e.department || '',
          position: e.position || ''
        };
      }));

    } catch (error) {
      console.error('Data fetch error:', error);
      setData([]);
    } finally {
      setIsLoaded(true);
    }

    // LOCAL VIDEOS - Bundled with the app, no external dependencies
    // Stored in public/videos/ and deployed to GitHub Pages
    const localVideos: VideoItem[] = [
      { url: '/sqbmarketing/videos/video1.mp4', priority: 10 },
      { url: '/sqbmarketing/videos/video2.mp4', priority: 10 },
      { url: '/sqbmarketing/videos/video3.mp4', priority: 10 },
    ];

    // Use local videos - works offline, no CORS, no external APIs
    setActiveVideos(localVideos);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addPerson = async (name: string, position: string) => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    await supabase.from('employees').insert([{
      name, position, department: 'Boshqaruv', birth_date: `2000-${month}-${day}`
    }]);
  };

  const removePerson = async (id: string) => {
    await supabase.from('employees').delete().eq('id', id);
  };

  const updatePerson = async (id: string, name: string, position: string) => {
    await supabase.from('employees').update({ name, position }).eq('id', id);
  };

  const uploadVideo = async (file: File, priority: number = 10) => {
    try {
      const fileName = `admin_${Date.now()}_${file.name}`;
      await supabase.storage.from('videos').upload(fileName, file);
      const { data: publicData } = supabase.storage.from('videos').getPublicUrl(fileName);
      await supabase.from('videos').insert([{ url: publicData.publicUrl, active: true, priority }]);
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  };

  const addVideoByUrl = async (url: string, priority: number = 10) => {
    try {
      await supabase.from('videos').insert([{ url, active: true, priority }]);
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  };

  const deleteVideo = async (url: string) => {
    try {
      await supabase.from('videos').delete().eq('url', url);
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  };

  const deleteAllVideos = async () => {
    try {
      await supabase.from('videos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  };

  const getTomorrowBirthdays = useCallback(async (): Promise<number> => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const md = `-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
      const all = await fetchAllEmployees();
      return all.filter(e => {
        const dept = (e.department || "").trim().toLowerCase();
        if (dept.includes('tarmoqlarda')) return false;
        const valid = VALID_DEPARTMENTS.some(vd => dept.includes(vd.toLowerCase()) || vd.toLowerCase().includes(dept));
        return valid && e.birth_date && e.birth_date.endsWith(md);
      }).length;
    } catch { return 0; }
  }, []);

  const getWeekBirthdays = useCallback(async (): Promise<DayBirthday[]> => {
    try {
      const all = await fetchAllEmployees();
      const filtered = all.filter(e => {
        const dept = (e.department || "").trim().toLowerCase();
        if (dept.includes('tarmoqlarda')) return false;
        return VALID_DEPARTMENTS.some(vd => dept.includes(vd.toLowerCase()) || vd.toLowerCase().includes(dept));
      });

      const birthdayMap = new Map<string, any[]>();
      filtered.forEach(e => {
        if (e.birth_date) {
          const md = e.birth_date.slice(5);
          if (!birthdayMap.has(md)) birthdayMap.set(md, []);
          birthdayMap.get(md)!.push(e);
        }
      });

      const weekData: DayBirthday[] = [];
      const today = new Date();
      const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const md = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        const emps = birthdayMap.get(md) || [];
        weekData.push({
          date: `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`,
          dayName: i === 0 ? 'Bugun' : i === 1 ? 'Ertaga' : dayNames[d.getDay()],
          count: emps.length,
          people: emps.map(e => ({
            name: (e.name || '').split(' ').slice(0, 2).join(' '),
            department: e.department || ''
          }))
        });
      }
      return weekData;
    } catch { return []; }
  }, []);

  return {
    data, activeVideos, isLoaded, addPerson, removePerson, updatePerson,
    uploadVideo, addVideoByUrl, deleteVideo, deleteAllVideos,
    getTomorrowBirthdays, getWeekBirthdays
  };
};
