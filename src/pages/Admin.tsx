import { useState, useEffect } from 'react';
import { useBirthdayData, BirthdayPerson, VideoItem, DayBirthday } from '@/hooks/useBirthdayData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, Plus, Trash2, Edit2, X, Save, Video, Users, Monitor, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  const { data, activeVideos, addPerson, removePerson, updatePerson, isLoaded, uploadVideo, addVideoByUrl, deleteVideo, deleteAllVideos, getTomorrowBirthdays, getWeekBirthdays } = useBirthdayData();
  const { toast } = useToast();

  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');

  // Video state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPriority, setVideoPriority] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // Extra stats
  const [tomorrowCount, setTomorrowCount] = useState<number | null>(null);
  const [weekBirthdays, setWeekBirthdays] = useState<DayBirthday[]>([]);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      getTomorrowBirthdays().then(setTomorrowCount);
      setIsLoadingWeek(true);
      getWeekBirthdays().then(week => {
        setWeekBirthdays(week);
        setIsLoadingWeek(false);
      });
    }
  }, [isLoaded, getTomorrowBirthdays, getWeekBirthdays]);

  const handleAdd = async () => {
    if (!newName.trim() || !newPosition.trim()) return;
    await addPerson(newName.trim(), newPosition.trim());
    setNewName('');
    setNewPosition('');
    toast({ title: "Qo'shildi! ✓" });
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editPosition.trim() || !editingId) return;
    await updatePerson(editingId, editName.trim(), editPosition.trim());
    setEditingId(null);
    toast({ title: "Saqlandi! ✓" });
  };

  const handleDelete = async (id: string) => {
    await removePerson(id);
    toast({ title: "O'chirildi" });
  };

  const handleUploadVideo = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    const res = await uploadVideo(uploadFile, videoPriority);
    setIsUploading(false);
    if (res.success) {
      setUploadFile(null);
      toast({ title: "Video yuklandi!" });
    }
  };

  const handleAddVideoUrl = async () => {
    if (!videoUrl.trim()) return;
    setIsAddingUrl(true);
    const res = await addVideoByUrl(videoUrl.trim(), videoPriority);
    setIsAddingUrl(false);
    if (res.success) {
      setVideoUrl('');
      toast({ title: "Havola qo'shildi!" });
    }
  };

  const handleDeleteVideo = async (url: string) => {
    const res = await deleteVideo(url);
    if (res.success) toast({ title: "Video o'chirildi" });
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-white">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-6 overflow-y-auto">
      <div className="max-w-[1800px] mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Monitor className="h-7 w-7 text-blue-400" />
          Admin Panel
        </h1>
        <Link to="/">
          <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
            <Eye className="mr-2 h-4 w-4" /> Ekranni Ko'rish
          </Button>
        </Link>
      </div>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Management Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-white text-base">Bugungi Imeninniklar ({data.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="flex gap-2">
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ism Familiya" className="bg-slate-700 border-slate-600 text-white" />
                <Input value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="Lavozimi" className="bg-slate-700 border-slate-600 text-white" />
                <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700"><Plus /></Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {data.map(p => (
                  <div key={p.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between border border-slate-600">
                    {editingId === p.id ? (
                      <div className="flex gap-2 flex-1">
                        <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-slate-600 border-slate-500 h-8" />
                        <Input value={editPosition} onChange={e => setEditPosition(e.target.value)} className="bg-slate-600 border-slate-500 h-8" />
                        <Button size="sm" onClick={handleSaveEdit} className="h-8"><Save className="h-3 w-3" /></Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-white font-medium text-sm">{p.name}</p>
                          <p className="text-slate-400 text-xs">{p.position}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditingId(p.id); setEditName(p.name); setEditPosition(p.position); }} className="h-8 w-8 text-slate-400 hover:text-white"><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-slate-400 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-white text-base">Video Boshqaruvi ({activeVideos.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <Tabs defaultValue="url">
                <TabsList className="bg-slate-700 w-full">
                  <TabsTrigger value="url" className="flex-1">Havola (URL)</TabsTrigger>
                  <TabsTrigger value="file" className="flex-1">Fayl yuklash</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="pt-2 flex gap-2">
                  <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="bg-slate-700 border-slate-600" />
                  <Button onClick={handleAddVideoUrl} disabled={isAddingUrl} className="bg-blue-600">{isAddingUrl ? '...' : 'OK'}</Button>
                </TabsContent>
                <TabsContent value="file" className="pt-2 flex gap-2">
                  <Input type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="bg-slate-700 border-slate-600" />
                  <Button onClick={handleUploadVideo} disabled={isUploading} className="bg-blue-600">{isUploading ? '...' : 'Yuklash'}</Button>
                </TabsContent>
              </Tabs>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {activeVideos.map((v, i) => (
                  <div key={i} className="bg-slate-700/50 p-2 rounded flex items-center justify-between border border-slate-600">
                    <span className="text-slate-300 text-xs truncate max-w-[80%]">{v.url}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteVideo(v.url)} className="h-7 w-7 text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly List Column */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-400" />
                Haftalik Spisok
              </CardTitle>
              {tomorrowCount !== null && (
                <div className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <span className="text-amber-400 text-[10px] font-bold">ERTANGA: {tomorrowCount}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoadingWeek ? (
              <p className="text-slate-500 text-center py-4 text-xs">Yuklanmoqda...</p>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                {weekBirthdays.map((day, idx) => (
                  <div key={idx} className={`p-2 rounded border ${day.count > 0 ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-800/20 border-slate-700/30 opacity-50'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-xs font-bold">{day.date} — {day.dayName}</span>
                      <span className={`text-[10px] px-1.5 rounded-full ${day.count > 0 ? 'bg-blue-500/20 text-blue-400' : 'text-slate-600'}`}>{day.count} kishi</span>
                    </div>
                    {day.people.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {day.people.map((p, pIdx) => (
                          <div key={pIdx} className="text-[11px] text-slate-400 border-l border-slate-600 pl-2 ml-1">
                            <span className="text-slate-200">{p.name}</span>
                            <span className="text-slate-500 ml-1 truncate">— {p.department}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Admin;
