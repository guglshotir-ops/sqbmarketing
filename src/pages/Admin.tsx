import { useState } from 'react';
import { useBirthdayData, BirthdayPerson, VideoItem } from '@/hooks/useBirthdayData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, Plus, Trash2, Edit2, X, Save, Video, Users, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { data, activeVideos, addPerson, removePerson, updatePerson, isLoaded, uploadVideo, addVideoByUrl, deleteVideo, deleteAllVideos } = useBirthdayData();
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

  // Video handlers
  const handleUploadVideo = async () => {
    if (!uploadFile) return;
    setIsUploading(true);

    const res = await uploadVideo(uploadFile, videoPriority);

    setIsUploading(false);
    setUploadFile(null);

    const input = document.getElementById('videoInput') as HTMLInputElement;
    if (input) input.value = '';

    if (res.success) {
      toast({ title: "Video yuklandi! ✓", description: "Video muvaffaqiyatli qo'shildi" });
    } else {
      const errorMsg = (res.error as any)?.message || "";
      let description = "Yuklashda xatolik yuz berdi";
      
      if (errorMsg.includes("exceeded the maximum allowed size")) {
        description = "Fayl hajmi juda katta (maksimum 50MB). Iltimos, kichikroq fayl yuklang yoki havola orqali qo'shing.";
      }

      toast({ 
        title: "Xatolik", 
        description: description, 
        variant: "destructive" 
      });
    }
  };

  const handleAddVideoUrl = async () => {
    if (!videoUrl.trim()) return;
    setIsAddingUrl(true);

    const res = await addVideoByUrl(videoUrl.trim(), videoPriority);

    setIsAddingUrl(false);
    if (res.success) {
      setVideoUrl('');
      setVideoPriority(10);
      toast({ title: "Havola qo'shildi! ✓", description: "Video muvaffaqiyatli ro'yxatga kiritildi" });
    } else {
      toast({ title: "Xatolik", description: "Havolani saqlashda xatolik", variant: "destructive" });
    }
  };

  const handleDeleteVideo = async (video: VideoItem) => {
    const res = await deleteVideo(video.url);
    if (res.success) {
      toast({ title: "Video o'chirildi", description: "Video ro'yxatdan olib tashlandi" });
    } else {
      toast({ title: "Xatolik", description: "O'chirishda xatolik", variant: "destructive" });
    }
  };

  const handleDeleteAllVideos = async () => {
    if (!confirm("Barcha videolarni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.")) {
      return;
    }

    const res = await deleteAllVideos();
    if (res.success) {
      toast({ title: "Barcha videolar o'chirildi", description: "Barcha videolar ro'yxatdan olib tashlandi" });
    } else {
      toast({ title: "Xatolik", description: "O'chirishda xatolik", variant: "destructive" });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-6 overflow-y-auto">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Monitor className="h-7 w-7 text-blue-400" />
              SQB LED Ekran Boshqaruvi
            </h1>
            <p className="text-slate-400 mt-1">
              Imeninniklar: {data.length}/10 • Videolar: {activeVideos?.length || 0}
            </p>
          </div>
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6">
              <Eye className="mr-2 h-5 w-5" />
              LED Ekranni Ko'rish
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN - Birthday Management */}
        <div className="space-y-4">
          {/* Add New Person */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                Yangi Imeninnik Qo'shish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ism Familiya"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 h-10"
                />
                <Input
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Lavozimi"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 h-10"
                />
                <Button 
                  onClick={handleAdd}
                  disabled={data.length >= 10}
                  className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* People List */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Bugungi Imeninniklar</CardTitle>
              <CardDescription className="text-slate-400">
                {data.length === 0 ? "Ro'yxat bo'sh" : `${data.length} ta ism`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {data.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Hali imeninniklar yo'q</p>
                  </div>
                ) : (
                  data.map((person, index) => (
                    <div 
                      key={person.id}
                      className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {editingId === person.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white/10 border-white/20 text-white h-9 flex-1"
                          />
                          <Input
                            value={editPosition}
                            onChange={(e) => setEditPosition(e.target.value)}
                            className="bg-white/10 border-white/20 text-white h-9 flex-1"
                          />
                          <Button size="sm" onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700 h-9">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white hover:bg-white/10 h-9">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                              color: '#1a1a2e',
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{person.name}</p>
                            <p className="text-slate-400 text-xs truncate">{person.position}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(person)} className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(person.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Video Management */}
        <div className="space-y-4">
          {/* Upload Video */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-400" />
                Video Yuklash
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-300 text-xs">Fayl orqali (.mp4)</Label>
                  <span className="text-[10px] text-slate-500">MAKS. 50MB</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="videoInput"
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="bg-white/10 border-white/20 text-white file:text-slate-400 cursor-pointer h-9 text-sm"
                  />
                  <Button
                    onClick={handleUploadVideo}
                    disabled={!uploadFile || isUploading}
                    className="bg-blue-600 hover:bg-blue-700 h-9 px-4 text-sm"
                  >
                    {isUploading ? '...' : 'Yuklash'}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-slate-800/80 px-2 text-slate-500">yoki</span>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Havola orqali (Direct mp4 / Google Drive)</Label>
                <div className="flex gap-2">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-white/10 border-white/20 text-white h-9 text-sm"
                  />
                  <Button
                    onClick={handleAddVideoUrl}
                    disabled={!videoUrl.trim() || isAddingUrl}
                    className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 text-sm"
                  >
                    {isAddingUrl ? '...' : 'Qo\'shish'}
                  </Button>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Label className="text-slate-300 text-xs">📊 Prioritet (muhimlik darajasi)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={videoPriority}
                    onChange={(e) => setVideoPriority(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="w-12 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 font-bold text-sm">
                    {videoPriority}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Yuqori prioritet = tez-tez ko'rsatiladi (1-100)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Videos List */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-base">Aktiv Videolar</CardTitle>
                  <CardDescription className="text-slate-400">
                    {(!activeVideos || activeVideos.length === 0) ? "Hali videolar yo'q" : `${activeVideos.length} ta video`}
                  </CardDescription>
                </div>
                {activeVideos && activeVideos.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDeleteAllVideos}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Tozalash
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {(!activeVideos || activeVideos.length === 0) ? (
                  <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <Video className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Videolar yo'q</p>
                  </div>
                ) : (
                  activeVideos.map((video, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <a href={video.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-400 transition-colors truncate text-sm flex-1">
                          {video.url.split('/').pop()?.split('?')[0] || 'Video file'}
                        </a>
                        <div className="px-2 py-1 bg-amber-500/20 rounded text-amber-400 text-xs font-bold flex-shrink-0">
                          P:{video.priority}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteVideo(video)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
};

export default Admin;
