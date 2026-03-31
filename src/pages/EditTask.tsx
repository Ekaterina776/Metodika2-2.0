import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft, Save, Trash2, Info, Layers, Target, FileText, 
  Check, XCircle, Loader2, Image as ImageIcon, Upload
} from 'lucide-react';
import { motion } from 'motion/react';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    tech: '',
    description: '',
    goals: '',
    image: ''
  });

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'tasks', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Check if user is the author
          if (user && data.authorUid !== user.uid) {
            setError('У вас нет прав для редактирования этого задания');
            setLoading(false);
            return;
          }
          
          setTask({ id: docSnap.id, ...data });
          setFormData({
            title: data.title || '',
            grade: data.grade || '',
            tech: data.tech || '',
            description: data.description || '',
            goals: data.goals || '',
            image: data.image || ''
          });
        } else {
          setError('Задание не найдено');
        }
      } catch (err) {
        console.error(err);
        setError('Ошибка при загрузке задания');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        fetchTask();
      }
    }
  }, [id, user, authLoading, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'tasks', id);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Ошибка при сохранении изменений');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">{error}</h2>
        <button onClick={() => navigate('/profile')} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold">Вернуться в профиль</button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Назад в профиль
        </button>

        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 lg:p-12 border-b border-gray-50 bg-indigo-600 text-white">
            <h1 className="text-3xl font-black mb-2">Редактирование разработки</h1>
            <p className="text-indigo-100 opacity-80">Внесите изменения в ваше задание</p>
          </div>

          <form onSubmit={handleSave} className="p-8 lg:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Info className="w-4 h-4 text-indigo-500" /> Название
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Layers className="w-4 h-4 text-indigo-500" /> Класс
                  </label>
                  <select 
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Выберите класс</option>
                    {[5,6,7,8,9,10,11].map(g => (
                      <option key={g} value={`${g} класс`}>{g} класс</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Target className="w-4 h-4 text-indigo-500" /> Технология
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.tech}
                    onChange={(e) => setFormData({...formData, tech: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" /> Обложка задания
                </label>
                <label className="flex flex-col items-center justify-center h-[236px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group overflow-hidden">
                  {formData.image ? (
                    <div className="relative w-full h-full">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                      <span className="text-sm text-gray-500 group-hover:text-indigo-600 font-medium">Сменить обложку</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Описание
              </label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Target className="w-4 h-4 text-indigo-500" /> Цели
              </label>
              <textarea 
                required
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="pt-8 flex gap-4">
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Сохранить изменения
              </button>
              <button 
                type="button"
                onClick={() => navigate('/profile')}
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
