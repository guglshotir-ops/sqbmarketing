import { useState } from 'react';
import { useBirthdayData, BirthdayPerson } from '@/hooks/useBirthdayData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, Eye, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { data, addPerson, removePerson, updatePerson, isLoaded } = useBirthdayData();
  const { toast } = useToast();
  
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newPosition.trim()) {
      toast({
        title: "Xatolik",
        description: "Iltimos, ism va lavozimni kiriting",
        variant: "destructive",
      });
      return;
    }
    if (data.length >= 10) {
      toast({
        title: "Xatolik",
        description: "Maksimum 10 ta ism qo'shish mumkin",
        variant: "destructive",
      });
      return;
    }
    addPerson(newName.trim(), newPosition.trim());
    setNewName('');
    setNewPosition('');
    toast({
      title: "Qo'shildi! ✓",
      description: "Yangi ism ro'yxatga qo'shildi",
    });
  };

  const handleEdit = (person: BirthdayPerson) => {
    setEditingId(person.id);
    setEditName(person.name);
    setEditPosition(person.position);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editPosition.trim() || !editingId) return;
    updatePerson(editingId, editName.trim(), editPosition.trim());
    setEditingId(null);
    toast({
      title: "Saqlandi! ✓",
      description: "Ma'lumotlar yangilandi",
    });
  };

  const handleDelete = (id: string) => {
    removePerson(id);
    toast({
      title: "O'chirildi",
      description: "Ism ro'yxatdan o'chirildi",
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            🎂 Tug'ilgan Kun Boshqaruvi
          </h1>
          <p className="text-slate-400">
            Ro'yxatda {data.length}/10 ta ism mavjud
          </p>
        </div>

        {/* Add New Person */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Yangi Ism Qo'shish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newName" className="text-white text-sm">Ism Familiya</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masalan: Азиз Каримов"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPosition" className="text-white text-sm">Lavozimi</Label>
                <Input
                  id="newPosition"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Masalan: Бош Менежер"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <Button 
              onClick={handleAdd}
              disabled={data.length >= 10}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Qo'shish
            </Button>
          </CardContent>
        </Card>

        {/* People List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Ro'yxat</CardTitle>
            <CardDescription className="text-slate-300">
              Bugungi tug'ilgan kunlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Ro'yxat bo'sh</p>
            ) : (
              data.map((person, index) => (
                <div 
                  key={person.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  {editingId === person.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                        <Input
                          value={editPosition}
                          onChange={(e) => setEditPosition(e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
                          <Save className="h-4 w-4 mr-1" /> Saqlash
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white hover:bg-white/10">
                          <X className="h-4 w-4 mr-1" /> Bekor
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                          color: '#1a1a2e',
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-lg truncate">{person.name}</p>
                        <p className="text-slate-400 text-sm truncate">{person.position}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(person)} className="text-white hover:bg-white/10 h-9 w-9">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(person.id)} className="text-red-400 hover:bg-red-500/20 h-9 w-9">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* View Button */}
        <Link to="/" className="block">
          <Button 
            variant="outline" 
            className="w-full h-14 text-lg border-white/20 text-white hover:bg-white/10"
          >
            <Eye className="mr-2 h-5 w-5" />
            Asosiy Ekranni Ko'rish
          </Button>
        </Link>

        {/* Instructions */}
        <div className="text-center text-slate-400 text-sm">
          <p>Asosiy ekranni ko'rish uchun yuqoridagi tugmani bosing</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
