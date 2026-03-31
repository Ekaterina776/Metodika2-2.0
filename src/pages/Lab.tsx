import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, FileText, FileQuestion, Map, Gamepad2, ArrowRight, ExternalLink, PlayCircle, Layers, CheckCircle2, XCircle, RefreshCw, Upload, User, Target, Info, LogIn, Image, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateTask, TaskType, GeneratedTask } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { useNavigate } from 'react-router-dom';

const Lab = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<TaskType>('test');
  const [result, setResult] = useState<GeneratedTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [showTestResults, setShowTestResults] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [publishedTaskId, setPublishedTaskId] = useState<string | null>(null);
  const [publishForm, setPublishForm] = useState({
    title: '',
    author: '',
    grade: '',
    goals: '',
    description: '',
    image: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPublishForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (profile) {
      setPublishForm(prev => ({ ...prev, author: profile.displayName }));
    }
  }, [profile]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setFlippedCards({});
    setTestAnswers({});
    setShowTestResults(false);
    setCopySuccess(false);
    setIsPublishModalOpen(false);
    setIsPublishSuccess(false);
    
    try {
      const task = await generateTask(prompt, selectedType);
      setResult(task);
      // Pre-fill description with prompt if needed
      setPublishForm(prev => ({ 
        ...prev, 
        description: prompt,
        title: task.title
      }));
    } catch (err) {
      console.error(err);
      setError('Произошла ошибка при генерации. Попробуйте еще раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !user) return;
    
    setIsPublishing(true);
    
    try {
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'tasks'), {
        authorUid: user.uid,
        authorName: publishForm.author,
        title: publishForm.title || result.title,
        grade: publishForm.grade,
        goals: publishForm.goals,
        description: publishForm.description,
        type: result.type,
        content: result.content,
        tech: 'ИИ-Генератор',
        views: 0,
        likes: 0,
        comments: 0,
        image: publishForm.image || null,
        createdAt: serverTimestamp()
      });
      
      setPublishedTaskId(docRef.id);
      setIsPublishing(false);
      setIsPublishSuccess(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const closePublishModal = () => {
    setIsPublishModalOpen(false);
    setIsPublishSuccess(false);
    if (isPublishSuccess) {
      setResult(null);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    
    let text = `${result.title}\n\n`;
    
    if (result.type === 'test') {
      result.content.questions.forEach((q: any, i: number) => {
        text += `${i + 1}. ${q.question}\n`;
        q.options.forEach((opt: string) => text += `- ${opt}\n`);
        text += `Правильный ответ: ${q.correctAnswer}\n\n`;
      });
    } else if (result.type === 'flashcards') {
      result.content.cards.forEach((card: any, i: number) => {
        text += `Карточка ${i + 1}:\nВопрос: ${card.front}\nОтвет: ${card.back}\n\n`;
      });
    } else if (result.type === 'matching') {
      result.content.pairs.forEach((pair: any, i: number) => {
        text += `${i + 1}. ${pair.left} — ${pair.right}\n`;
      });
    }
    
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const toggleCard = (index: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleTestAnswer = (qIndex: number, option: string) => {
    if (showTestResults) return;
    setTestAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Инструменты будущего для учителя</span>
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">Интерактивная лаборатория</h1>
          <p className="text-xl text-gray-600">Создавайте уникальный контент для своих уроков с помощью искусственного интеллекта и современных цифровых инструментов.</p>
        </div>

        {/* AI Generator Section */}
        <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-xl shadow-indigo-100 border border-indigo-50 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Brain className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold">ИИ-Генератор заданий</h2>
              </div>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">Опишите тему урока или загрузите текст произведения, и наш ИИ создаст для вас карточки, тесты или задания на сопоставление.</p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Генерация качественных тестов',
                  'Создание творческих заданий',
                  'Адаптация под уровень класса'
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-1">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <p className="text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">О чем будет задание?</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Например: Создай 5 вопросов по первой главе 'Героя нашего времени' для 9 класса..." 
                  className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button 
                  onClick={() => setSelectedType('test')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all border ${selectedType === 'test' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'}`}
                >
                  <FileQuestion className="w-5 h-5" /> Тест
                </button>
                <button 
                  onClick={() => setSelectedType('flashcards')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all border ${selectedType === 'flashcards' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'}`}
                >
                  <FileText className="w-5 h-5" /> Карточки
                </button>
                <button 
                  onClick={() => setSelectedType('matching')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all border ${selectedType === 'matching' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'}`}
                >
                  <Layers className="w-5 h-5" /> Пары
                </button>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Сгенерировать
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create New Task Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Создать новое задание</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => {
                const element = document.querySelector('textarea');
                element?.scrollIntoView({ behavior: 'smooth' });
                element?.focus();
              }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Сгенерировать ИИ</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Создайте интерактивный тест или карточки за считанные секунды.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => navigate('/publish')}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Загрузить файл</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Опубликуйте готовую разработку в формате Word или PDF.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => navigate('/publish')}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-all">
                <ExternalLink className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Встроить медиа</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Wordwall, LearningApps, YouTube и другие платформы.</p>
            </motion.div>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">{result.title}</h3>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleCopy}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copySuccess ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Скопировано
                        </>
                      ) : (
                        <>
                          <Layers className="w-4 h-4" /> Копировать текст
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setIsPublishModalOpen(true)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Опубликовать
                    </button>
                    {result.type === 'test' && !showTestResults && (
                      <button 
                        onClick={() => setShowTestResults(true)}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
                      >
                        Проверить ответы
                      </button>
                    )}
                    <button 
                      onClick={() => setResult(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {result.type === 'test' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {result.content.questions.map((q: any, i: number) => (
                        <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="font-bold mb-4 text-gray-800">{i + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt: string, j: number) => {
                              const isSelected = testAnswers[i] === opt;
                              const isCorrect = opt === q.correctAnswer;
                              let statusClass = 'bg-white border-gray-100 text-gray-600';
                              
                              if (showTestResults) {
                                if (isCorrect) statusClass = 'bg-green-50 border-green-200 text-green-700';
                                else if (isSelected && !isCorrect) statusClass = 'bg-red-50 border-red-200 text-red-700';
                              } else if (isSelected) {
                                statusClass = 'bg-indigo-50 border-indigo-200 text-indigo-700';
                              }

                              return (
                                <button 
                                  key={j} 
                                  onClick={() => handleTestAnswer(i, opt)}
                                  className={`w-full text-left p-3 rounded-xl text-sm border transition-all flex items-center justify-between ${statusClass}`}
                                >
                                  {opt}
                                  {showTestResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                  {showTestResults && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.type === 'flashcards' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {result.content.cards.map((card: any, i: number) => (
                        <div 
                          key={i}
                          onClick={() => toggleCard(i)}
                          className="perspective-1000 h-80 cursor-pointer group"
                        >
                          <motion.div 
                            animate={{ rotateY: flippedCards[i] ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            className="relative w-full h-full preserve-3d"
                          >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-indigo-600 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-indigo-100">
                              <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">Вопрос</p>
                              <p className="text-xl font-bold">{card.front}</p>
                              <div className="absolute bottom-6 right-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                <RefreshCw className="w-5 h-5" />
                              </div>
                            </div>
                            
                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden bg-white text-indigo-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 border-indigo-100 rotate-y-180">
                              <p className="text-xs font-bold uppercase tracking-widest mb-4 text-indigo-400">Ответ</p>
                              <p className="text-xl font-medium">{card.back}</p>
                              <div className="absolute bottom-6 right-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                <RefreshCw className="w-5 h-5" />
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.type === 'matching' && (
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Столбец А</p>
                          {result.content.pairs.map((pair: any, i: number) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ x: 5 }}
                              className="p-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium shadow-sm flex items-center gap-4"
                            >
                              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                                {i + 1}
                              </div>
                              {pair.left}
                            </motion.div>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Столбец Б</p>
                          {/* Shuffle the right side for a real matching exercise */}
                          {[...result.content.pairs].sort(() => Math.random() - 0.5).map((pair: any, i: number) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ x: -5 }}
                              className="p-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium shadow-sm flex items-center gap-4"
                            >
                              <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center font-bold">
                                {String.fromCharCode(65 + i)}
                              </div>
                              {pair.right}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-12 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" /> Правильные ответы:
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {result.content.pairs.map((pair: any, i: number) => (
                            <div key={i} className="text-sm text-indigo-700 bg-white/50 p-2 rounded-lg border border-indigo-100">
                              <span className="font-bold">{pair.left}</span> — {pair.right}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Other Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              <img src="https://picsum.photos/seed/geography-education/800/600" alt="Map" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-indigo-900/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Map className="w-12 h-12 text-white opacity-80 group-hover:scale-125 transition-transform" />
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">Интерактивные карты</h3>
              <p className="text-gray-600 mb-6">Создавайте литературные маршруты и визуализируйте биографии писателей на карте мира.</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gray-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Открыть редактор <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Quiz Builder */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              <img src="https://picsum.photos/seed/exam-paper/800/600" alt="Quiz" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-violet-900/20 group-hover:bg-violet-900/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileQuestion className="w-12 h-12 text-white opacity-80 group-hover:scale-125 transition-transform" />
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">Конструктор квизов</h3>
              <p className="text-gray-600 mb-6">Быстрое создание викторин с автоматической проверкой и интеграцией в Google Classroom.</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gray-50 text-violet-600 rounded-xl font-bold hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Создать квиз <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Twine Games */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              <img src="https://picsum.photos/seed/classroom-game/800/600" alt="Game" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-orange-900/20 group-hover:bg-orange-900/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Gamepad2 className="w-12 h-12 text-white opacity-80 group-hover:scale-125 transition-transform" />
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">Текстовые квесты</h3>
              <p className="text-gray-600 mb-6">Интегрируйте игры на базе Twine для глубокого погружения учеников в сюжет произведения.</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gray-50 text-orange-600 rounded-xl font-bold hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Смотреть примеры <PlayCircle className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Publish Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {isPublishSuccess ? 'Задание опубликовано!' : 'Публикация задания'}
                    </h3>
                  </div>
                  <button 
                    onClick={closePublishModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {isPublishSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <p className="text-lg text-gray-600 mb-8">
                      Ваше задание успешно добавлено в каталог практик. Теперь другие учителя смогут использовать его в своей работе!
                    </p>
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
                  </div>
                ) : !user ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <LogIn className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Требуется авторизация</h4>
                    <p className="text-gray-600 mb-8">
                      Чтобы опубликовать задание и сохранить его в своем профиле, необходимо войти в систему.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => navigate('/auth')}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                        Войти <ArrowRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={closePublishModal}
                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePublish} className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> Название задания
                      </label>
                      <input 
                        required
                        type="text" 
                        value={publishForm.title}
                        onChange={(e) => setPublishForm({...publishForm, title: e.target.value})}
                        placeholder="Название вашей разработки" 
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <User className="w-4 h-4 text-indigo-500" /> Автор (Имя учителя)
                        </label>
                        <input 
                          required
                          type="text" 
                          value={publishForm.author}
                          onChange={(e) => setPublishForm({...publishForm, author: e.target.value})}
                          placeholder="Иван Иванов" 
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <Layers className="w-4 h-4 text-indigo-500" /> Класс
                        </label>
                        <select 
                          required
                          value={publishForm.grade}
                          onChange={(e) => setPublishForm({...publishForm, grade: e.target.value})}
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
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Target className="w-4 h-4 text-indigo-500" /> Цели задания
                      </label>
                      <textarea 
                        required
                        value={publishForm.goals}
                        onChange={(e) => setPublishForm({...publishForm, goals: e.target.value})}
                        placeholder="Например: Закрепление знаний по теме 'Причастия'..." 
                        className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Info className="w-4 h-4 text-indigo-500" /> Описание
                      </label>
                      <textarea 
                        required
                        value={publishForm.description}
                        onChange={(e) => setPublishForm({...publishForm, description: e.target.value})}
                        placeholder="Краткое описание задания..." 
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Image className="w-4 h-4 text-indigo-500" /> Обложка задания
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                          {publishForm.image ? (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden">
                              <img src={publishForm.image} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); setPublishForm(prev => ({ ...prev, image: '' })); }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                              <span className="text-sm text-gray-500 group-hover:text-indigo-600 font-medium">Загрузить обложку</span>
                              <span className="text-xs text-gray-400 mt-1">PNG, JPG до 1MB</span>
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

                    <div className="pt-4 flex gap-4">
                      <button 
                        type="button"
                        onClick={closePublishModal}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Отмена
                      </button>
                      <button 
                        type="submit"
                        disabled={isPublishing}
                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isPublishing ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" /> Опубликовать в каталоге
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lab;
