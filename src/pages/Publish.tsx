import React, { useState, useEffect } from 'react';
import { Info, Layers, FileText, Target, List, Image, Upload, Plus, Trash2, Check, LogIn, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { useNavigate } from 'react-router-dom';

const Publish = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedTaskId, setPublishedTaskId] = useState<string | null>(null);
  const [creationMethod, setCreationMethod] = useState<'ai' | 'upload' | 'embed' | 'manual' | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    authorName: profile?.displayName || user?.displayName || '',
    description: '',
    goals: '',
    technology: '',
    tasks: '',
    plan: ['', '', ''],
    embedUrl: '',
    fileUrl: '',
    fileName: '',
    coverImage: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, fileName: file.name, fileUrl: 'mock-file-url' })); // In a real app, upload to storage
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (profile?.displayName || user?.displayName) {
      setFormData(prev => ({ ...prev, authorName: profile?.displayName || user?.displayName || '' }));
    }
  }, [profile, user]);

  const steps = [
    { id: 1, title: 'Информация', icon: Info },
    { id: 2, title: 'Способ создания', icon: Layers },
    { id: 3, title: 'Контент', icon: FileText },
    { id: 4, title: 'Обложка', icon: Image }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.grade || !formData.authorName || !formData.description || !formData.goals) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }
    }
    if (currentStep === 2 && !creationMethod) {
      alert('Пожалуйста, выберите способ создания');
      return;
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      const docData: any = {
        authorUid: user.uid,
        authorName: formData.authorName,
        title: formData.title,
        grade: formData.grade,
        tech: formData.technology || (creationMethod === 'embed' ? 'Встраиваемый контент' : 'Разное'),
        description: formData.description,
        goals: formData.goals,
        views: 0,
        likes: 0,
        comments: 0,
        image: formData.coverImage || null,
        createdAt: serverTimestamp(),
        creationMethod
      };

      if (creationMethod === 'manual') {
        docData.type = 'other';
        docData.content = {
          tasks: formData.tasks,
          plan: formData.plan
        };
      } else if (creationMethod === 'embed') {
        docData.type = 'embed';
        docData.content = {
          url: formData.embedUrl
        };
      } else if (creationMethod === 'upload') {
        docData.type = 'file';
        docData.content = {
          url: formData.fileUrl,
          name: formData.fileName
        };
      } else if (creationMethod === 'ai') {
        // Redirect to lab or handle AI generation here
        // For now, let's assume they use the lab and we just provide a link
        navigate('/lab');
        return;
      }

      const docRef = await addDoc(collection(db, 'tasks'), docData);
      
      setPublishedTaskId(docRef.id);
      setIsSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="pt-24 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full mx-4 bg-white p-12 rounded-[3rem] shadow-xl text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Успешно опубликовано!</h2>
          <p className="text-gray-600 mb-12">Ваша разработка отправлена на модерацию и скоро появится в каталоге. Спасибо за вклад в развитие сообщества!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate(`/lesson/${publishedTaskId}`)}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              Открыть задание <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/catalog')}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              В каталог
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Steps */}
          <div className="lg:w-1/4">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-8">Публикация</h2>
              <div className="space-y-6">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={step.id} 
                      className={`flex items-center gap-4 cursor-pointer group ${currentStep === step.id ? 'text-indigo-600' : 'text-gray-400'}`}
                      onClick={() => {
                        if (step.id < currentStep) setCurrentStep(step.id);
                      }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">{step.title}</span>
                      {currentStep > step.id && (
                        <Check className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:w-3/4 space-y-8">
            <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-gray-100 shadow-sm">
              {currentStep === 1 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold">Общая информация</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Название разработки *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Например: Интерактивный квест по роману 'Евгений Онегин'" 
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Автор *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.authorName}
                          onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                          placeholder="Ваше имя" 
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Целевой класс *</label>
                        <select 
                          required
                          value={formData.grade}
                          onChange={(e) => setFormData({...formData, grade: e.target.value})}
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                        >
                          <option value="">Выберите класс</option>
                          {[1,2,3,4,5,6,7,8,9,10,11].map(g => (
                            <option key={g} value={`${g} класс`}>{g} класс</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Описание *</label>
                      <textarea 
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Кратко опишите вашу разработку..." 
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Цели и задачи *</label>
                      <textarea 
                        required
                        value={formData.goals}
                        onChange={(e) => setFormData({...formData, goals: e.target.value})}
                        placeholder="Чего вы хотите достичь с помощью этого задания?" 
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold">Выберите способ создания</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button 
                      onClick={() => setCreationMethod('ai')}
                      className={`p-8 rounded-[2rem] border-2 text-left transition-all group ${creationMethod === 'ai' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${creationMethod === 'ai' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Сгенерировать с ИИ</h3>
                      <p className={`text-sm ${creationMethod === 'ai' ? 'text-indigo-100' : 'text-gray-500'}`}>Создайте тест или карточки за секунды с помощью нейросети</p>
                    </button>

                    <button 
                      onClick={() => setCreationMethod('upload')}
                      className={`p-8 rounded-[2rem] border-2 text-left transition-all group ${creationMethod === 'upload' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${creationMethod === 'upload' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                        <Upload className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Загрузить файл</h3>
                      <p className={`text-sm ${creationMethod === 'upload' ? 'text-indigo-100' : 'text-gray-500'}`}>Загрузите готовую разработку в формате Word или PDF</p>
                    </button>

                    <button 
                      onClick={() => setCreationMethod('embed')}
                      className={`p-8 rounded-[2rem] border-2 text-left transition-all group ${creationMethod === 'embed' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${creationMethod === 'embed' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                        <Layers className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Встроить медиа</h3>
                      <p className={`text-sm ${creationMethod === 'embed' ? 'text-indigo-100' : 'text-gray-500'}`}>Wordwall, LearningApps, YouTube, Canva и другие сервисы</p>
                    </button>

                    <button 
                      onClick={() => setCreationMethod('manual')}
                      className={`p-8 rounded-[2rem] border-2 text-left transition-all group ${creationMethod === 'manual' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${creationMethod === 'manual' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                        <List className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Ручной ввод</h3>
                      <p className={`text-sm ${creationMethod === 'manual' ? 'text-indigo-100' : 'text-gray-500'}`}>Создайте план урока и задачи вручную</p>
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold">
                    {creationMethod === 'ai' && 'Генерация с ИИ'}
                    {creationMethod === 'upload' && 'Загрузка файла'}
                    {creationMethod === 'embed' && 'Встраивание контента'}
                    {creationMethod === 'manual' && 'План урока'}
                  </h2>

                  {creationMethod === 'ai' && (
                    <div className="bg-indigo-50 p-8 rounded-[2rem] text-center">
                      <RefreshCw className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin-slow" />
                      <h3 className="text-xl font-bold mb-2">Перейти в ИИ Лабораторию</h3>
                      <p className="text-gray-600 mb-6">Для генерации контента с помощью ИИ используйте нашу лабораторию. После генерации вы сможете опубликовать результат.</p>
                      <button 
                        onClick={() => navigate('/lab')}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                      >
                        Открыть Лабораторию
                      </button>
                    </div>
                  )}

                  {creationMethod === 'upload' && (
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center hover:border-indigo-200 transition-all cursor-pointer group relative">
                        <input 
                          type="file" 
                          accept=".doc,.docx,.pdf" 
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <Upload className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          {formData.fileName || 'Выберите Word или PDF файл'}
                        </h4>
                        <p className="text-sm text-gray-500">Нажмите или перетащите файл сюда</p>
                      </div>
                    </div>
                  )}

                  {creationMethod === 'embed' && (
                    <div className="space-y-6">
                      <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                          <Info className="w-5 h-5" /> Поддерживаемые платформы
                        </h4>
                        <p className="text-sm text-indigo-700 leading-relaxed">
                          Вы можете встроить контент из: Wordwall, LearningApps, Fliktop, School AI, Edpuzzle, Canva, YouTube, Genially и других сервисов, поддерживающих iframe, а также любые сайты через прямую ссылку.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ссылка на контент или сайт</label>
                        <input 
                          type="text" 
                          value={formData.embedUrl}
                          onChange={(e) => {
                            let value = e.target.value;
                            // If it's an iframe tag, extract the src
                            if (value.includes('<iframe')) {
                              const match = value.match(/src=["']([^"']+)["']/);
                              if (match && match[1]) {
                                value = match[1];
                              }
                            }
                            setFormData({...formData, embedUrl: value});
                          }}
                          placeholder="https://wordwall.net/resource/..." 
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <p className="mt-2 text-xs text-gray-500">Вставьте прямую ссылку на упражнение или код вставки (iframe)</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['Wordwall', 'LearningApps', 'Fliktop', 'School AI', 'Edpuzzle', 'Canva', 'YouTube', 'Genially'].map(s => (
                          <div key={s} className="p-3 bg-gray-50 rounded-xl text-center text-xs font-bold text-gray-500 border border-gray-100">
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {creationMethod === 'manual' && (
                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Задачи урока</label>
                        <textarea 
                          value={formData.tasks}
                          onChange={(e) => setFormData({...formData, tasks: e.target.value})}
                          className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">План занятия</label>
                        {formData.plan.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
                              {i + 1}
                            </div>
                            <input 
                              type="text" 
                              value={step}
                              onChange={(e) => {
                                const newPlan = [...formData.plan];
                                newPlan[i] = e.target.value;
                                setFormData({...formData, plan: newPlan});
                              }}
                              placeholder={`Этап ${i + 1}`} 
                              className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                            />
                            <button 
                              onClick={() => {
                                const newPlan = formData.plan.filter((_, idx) => idx !== i);
                                setFormData({...formData, plan: newPlan});
                              }}
                              className="text-gray-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setFormData({...formData, plan: [...formData.plan, '']})}
                          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" /> Добавить этап
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold">Обложка и завершение</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <label className="block text-sm font-bold text-gray-700">Выберите обложку для каталога</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden h-[300px] flex flex-col items-center justify-center">
                        {formData.coverImage ? (
                          <>
                            <img src={formData.coverImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={(e) => { e.preventDefault(); setFormData({...formData, coverImage: ''}); }}
                                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                              <Image className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Загрузить обложку</h4>
                            <p className="text-sm text-gray-500">Рекомендуемый размер 1200x800</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[2rem] space-y-6">
                      <h4 className="font-bold text-gray-900">Проверка данных</h4>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Название:</span>
                          <span className="font-bold text-right">{formData.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Автор:</span>
                          <span className="font-bold">{formData.authorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Класс:</span>
                          <span className="font-bold">{formData.grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Метод:</span>
                          <span className="font-bold text-indigo-600 uppercase">{creationMethod}</span>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 leading-relaxed">Нажимая кнопку "Опубликовать", вы подтверждаете, что контент не нарушает авторских прав и соответствует правилам платформы.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-12 border-t border-gray-50">
                <motion.button 
                  whileHover={{ x: -5 }}
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="px-8 py-3 text-gray-500 font-bold hover:text-gray-900 transition-all disabled:opacity-30"
                >
                  Назад
                </motion.button>
                
                {currentStep < steps.length ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    Далее <ArrowRight className="w-5 h-5" />
                  </motion.button>
                ) : user ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting || (creationMethod === 'ai')}
                    className="px-10 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    Опубликовать
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/auth')}
                    className="px-10 py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all flex items-center gap-2"
                  >
                    <LogIn className="w-5 h-5" /> Войти для публикации
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Publish;
