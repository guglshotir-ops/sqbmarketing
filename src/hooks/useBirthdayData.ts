import { useState, useEffect } from 'react';

export interface BirthdayPerson {
  id: string;
  name: string;
  position: string;
}

const STORAGE_KEY = 'birthday-greeting-data';

const defaultData: BirthdayPerson[] = [
  { id: '1', name: 'Aziz Karimov', position: 'Bosh Menejer' },
  { id: '2', name: 'Malika Rahimova', position: 'Moliya bo\'limi boshlig\'i' },
  { id: '3', name: 'Jasur Aliyev', position: 'IT departamenti direktori' },
  { id: '4', name: 'Nilufar Ismoilova', position: 'Kadrlar bo\'limi boshlig\'i' },
  { id: '5', name: 'Bobur Toshmatov', position: 'Xavfsizlik xizmati boshlig\'i' },
  { id: '6', name: 'Dilnoza Mirzayeva', position: 'Marketing menejeri' },
  { id: '7', name: 'Sherzod Qodirov', position: 'Operatsion direktor' },
  { id: '8', name: 'Gulnora Sultonova', position: 'Bosh hisobchi' },
  { id: '9', name: 'Akmal Yusupov', position: 'Kredit bo\'limi boshlig\'i' },
  { id: '10', name: 'Sevara Xolmatova', position: 'Mijozlarga xizmat ko\'rsatish bo\'limi' },
];

export const useBirthdayData = () => {
  const [data, setData] = useState<BirthdayPerson[]>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Handle migration from old format (single object) to new format (array)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Validate array items have required fields
          const validData = parsed.filter(item => item && item.name && item.position);
          if (validData.length > 0) {
            setData(validData.map((item, index) => ({
              id: item.id || String(index + 1),
              name: item.name,
              position: item.position,
            })));
          } else {
            setData(defaultData);
          }
        } else if (parsed && typeof parsed === 'object' && parsed.name) {
          // Old single-object format
          setData([{ id: '1', name: parsed.name, position: parsed.position || '' }]);
        } else {
          // Invalid data, use defaults
          localStorage.removeItem(STORAGE_KEY);
          setData(defaultData);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setData(defaultData);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateData = (newData: BirthdayPerson[]) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const addPerson = (name: string, position: string) => {
    if (data.length >= 10) return;
    const newPerson: BirthdayPerson = {
      id: Date.now().toString(),
      name,
      position,
    };
    updateData([...data, newPerson]);
  };

  const removePerson = (id: string) => {
    updateData(data.filter(p => p.id !== id));
  };

  const updatePerson = (id: string, name: string, position: string) => {
    updateData(data.map(p => p.id === id ? { ...p, name, position } : p));
  };

  return { data, updateData, addPerson, removePerson, updatePerson, isLoaded };
};
