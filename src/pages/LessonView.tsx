import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, GraduationCap, Layers, User, Calendar, Target, 
  CheckCircle, Maximize, ExternalLink, Download, Share2, Heart, 
  Send, ArrowLeft, FileQuestion, FileText, RefreshCw, CheckCircle2,
  XCircle, Trophy, Sparkles, FileDown, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, getDoc, updateDoc, increment } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { useAuth } from '../hooks/useAuth';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [matchingSelections, setMatchingSelections] = useState<{left: number | null, right: number | null}>({left: null, right: null});
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shuffledRight, setShuffledRight] = useState<any[]>([]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'tasks', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLesson({ id: docSnap.id, ...data });
          
          // Increment views
          try {
            await updateDoc(docRef, { views: increment(1) });
          } catch (err) {
            // Ignore view increment errors for now, as they shouldn't block viewing
            console.warn('Could not increment views:', err);
          }
          
          // Initialize matching game if needed
          if (data.type === 'matching') {
            const rightSide = data.content.pairs.map((p: any, i: number) => ({ text: p.right, originalIndex: i }));
            setShuffledRight([...rightSide].sort(() => Math.random() - 0.5));
          }
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

    fetchLesson();
  }, [id]);

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    setSelectedOption(option);
    setShowFeedback(true);
    
    if (option === lesson.content.questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < lesson.content.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setScore(0);
    setIsFinished(false);
  };

  const handlePairClick = (type: 'left' | 'right', index: number) => {
    const newSelections = { ...matchingSelections, [type]: index };
    
    if (type === 'left' && matchingSelections.left === index) {
      newSelections.left = null;
    } else if (type === 'right' && matchingSelections.right === index) {
      newSelections.right = null;
    }

    setMatchingSelections(newSelections);

    if (newSelections.left !== null && newSelections.right !== null) {
      const leftIndex = newSelections.left;
      const rightOriginalIndex = shuffledRight[newSelections.right].originalIndex;

      if (leftIndex === rightOriginalIndex) {
        setMatchedPairs([...matchedPairs, leftIndex]);
        setMatchingSelections({ left: null, right: null });
        
        if (matchedPairs.length + 1 === lesson.content.pairs.length) {
          setIsFinished(true);
        }
      } else {
        // Wrong match - reset after a short delay
        setTimeout(() => {
          setMatchingSelections({ left: null, right: null });
        }, 500);
      }
    }
  };

  const exportToWord = () => {
    if (!lesson || lesson.type !== 'test') return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: lesson.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Автор: ${lesson.authorName}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Класс: ${lesson.grade}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          ...lesson.content.questions.flatMap((q: any, index: number) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${index + 1}. ${q.question}`, bold: true }),
              ],
            }),
            ...q.options.map((opt: string) => 
              new Paragraph({
                text: `[ ] ${opt}`,
                indent: { left: 720 },
              })
            ),
            new Paragraph({ text: "" }),
          ]),
        ],
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${lesson.title}.docx`);
    });
  };

  const exportToPDF = () => {
    // For PDF with Cyrillic, window.print is actually the most reliable way 
    // without embedding large fonts into the bundle.
    window.print();
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    
    // Wordwall
    if (url.includes('wordwall.net/resource/')) {
      return url.replace('wordwall.net/resource/', 'wordwall.net/embed/resource/');
    }

    // LearningApps
    if (url.includes('learningapps.org/view')) {
      return url.replace('learningapps.org/view', 'learningapps.org/watch?v=p');
    }

    // Edpuzzle
    if (url.includes('edpuzzle.com/media/')) {
      return url.replace('edpuzzle.com/media/', 'edpuzzle.com/embed/media/');
    }

    // Canva
    if (url.includes('canva.com/design/') && !url.includes('embed')) {
      return url.includes('?') ? `${url}&embed` : `${url}?embed`;
    }
    
    return url;
  };

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="pt-24 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">{error || 'Задание не найдено'}</h2>
        <Link to="/catalog" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Главная</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/catalog" className="hover:text-indigo-600 transition-colors">Каталог</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{lesson.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Cover Image */}
            {lesson.image && (
              <div className="w-full h-[300px] sm:h-[400px] rounded-[3rem] overflow-hidden shadow-2xl border border-white">
                <img src={lesson.image} alt={lesson.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            {/* Header */}
            <section>
              <h1 className="text-4xl font-black text-gray-900 mb-6 leading-tight">{lesson.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Автор</p>
                    <p className="text-sm font-bold">{lesson.authorName}</p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
                
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Класс</p>
                    <p className="text-sm font-bold">{lesson.grade}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Технология</p>
                    <p className="text-sm font-bold">{lesson.tech}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Section */}
            <section className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600 opacity-20"></div>
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    {lesson.type === 'test' && <FileQuestion className="w-5 h-5" />}
                    {lesson.type === 'flashcards' && <FileText className="w-5 h-5" />}
                    {lesson.type === 'matching' && <Layers className="w-5 h-5" />}
                    {lesson.type === 'other' && <Sparkles className="w-5 h-5" />}
                    {lesson.type === 'embed' && <ExternalLink className="w-5 h-5" />}
                    {lesson.type === 'file' && <Download className="w-5 h-5" />}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {lesson.type === 'embed' ? 'Интерактивный контент' : 'Выполнить задание'}
                  </h2>
                </div>
                
                {lesson.type === 'test' && !isFinished && (
                  <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                    Вопрос {currentQuestionIndex + 1} из {lesson.content.questions.length}
                  </div>
                )}
              </div>

              <div className="min-h-[400px] flex flex-col items-center justify-center w-full">
                {isFinished ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Trophy className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4">Отлично!</h3>
                    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                      {lesson.type === 'test' 
                        ? `Вы ответили правильно на ${score} из ${lesson.content.questions.length} вопросов.`
                        : 'Вы успешно завершили это задание!'}
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button 
                        onClick={lesson.type === 'test' ? restartTest : () => window.location.reload()}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" /> Попробовать снова
                      </button>
                      <Link 
                        to="/catalog"
                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                      >
                        В каталог
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {lesson.type === 'embed' && (
                      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                        <iframe 
                          src={getEmbedUrl(lesson.content.url)} 
                          className="w-full h-full" 
                          allowFullScreen 
                          title={lesson.title}
                        ></iframe>
                      </div>
                    )}

                    {lesson.type === 'file' && (
                      <div className="text-center py-10">
                        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                          <FileText className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{lesson.content.name || 'Файл разработки'}</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">Эта разработка доступна для скачивания в формате Word или PDF.</p>
                        <a 
                          href={lesson.content.url} 
                          download
                          className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                          <Download className="w-6 h-6" /> Скачать файл
                        </a>
                      </div>
                    )}

                    {lesson.type === 'test' && (
                      <div className="w-full max-w-2xl">
                        <h4 className="text-xl font-bold text-gray-900 mb-8 text-center">
                          {lesson.content.questions[currentQuestionIndex].question}
                        </h4>
                        <div className="space-y-4">
                          {lesson.content.questions[currentQuestionIndex].options.map((option: string, i: number) => {
                            const isCorrect = option === lesson.content.questions[currentQuestionIndex].correctAnswer;
                            const isSelected = selectedOption === option;
                            
                            let buttonClass = "w-full p-5 text-left rounded-2xl border-2 font-medium transition-all flex items-center justify-between ";
                            if (showFeedback) {
                              if (isCorrect) buttonClass += "bg-green-50 border-green-500 text-green-700";
                              else if (isSelected) buttonClass += "bg-red-50 border-red-500 text-red-700";
                              else buttonClass += "bg-white border-gray-100 opacity-50";
                            } else {
                              buttonClass += "bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30";
                            }

                            return (
                              <button 
                                key={i}
                                onClick={() => handleOptionSelect(option)}
                                className={buttonClass}
                              >
                                <span>{option}</span>
                                {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                              </button>
                            );
                          })}
                        </div>
                        
                        {showFeedback && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 flex justify-center"
                          >
                            <button 
                              onClick={nextQuestion}
                              className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
                            >
                              {currentQuestionIndex === lesson.content.questions.length - 1 ? 'Завершить' : 'Следующий вопрос'}
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {lesson.type === 'flashcards' && (
                      <div className="w-full max-w-md">
                        <div className="perspective-1000 h-[400px] w-full">
                          <motion.div 
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="relative w-full h-full preserve-3d cursor-pointer"
                          >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-xl border-2 border-indigo-50">
                              <p className="text-xs font-bold uppercase tracking-widest mb-6 text-indigo-400">Вопрос</p>
                              <p className="text-2xl font-bold text-gray-900">{lesson.content.cards[currentCardIndex].front}</p>
                              <div className="absolute bottom-10 flex items-center gap-2 text-gray-400 text-sm font-medium">
                                <RefreshCw className="w-4 h-4" /> Нажмите, чтобы перевернуть
                              </div>
                            </div>
                            
                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden bg-indigo-600 text-white rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-xl rotate-y-180">
                              <p className="text-xs font-bold uppercase tracking-widest mb-6 text-indigo-200">Ответ</p>
                              <p className="text-2xl font-bold">{lesson.content.cards[currentCardIndex].back}</p>
                              <div className="absolute bottom-10 flex items-center gap-2 text-indigo-200 text-sm font-medium">
                                <RefreshCw className="w-4 h-4" /> Нажмите, чтобы вернуться
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="mt-12 flex items-center justify-between">
                          <button 
                            disabled={currentCardIndex === 0}
                            onClick={() => { setCurrentCardIndex(currentCardIndex - 1); setIsFlipped(false); }}
                            className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 disabled:opacity-30 hover:border-indigo-200 transition-all"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          
                          <div className="text-sm font-bold text-gray-400">
                            Карточка {currentCardIndex + 1} из {lesson.content.cards.length}
                          </div>

                          <button 
                            onClick={() => {
                              if (currentCardIndex < lesson.content.cards.length - 1) {
                                setCurrentCardIndex(currentCardIndex + 1);
                                setIsFlipped(false);
                              } else {
                                setIsFinished(true);
                              }
                            }}
                            className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                          >
                            {currentCardIndex === lesson.content.cards.length - 1 ? <CheckCircle2 className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {lesson.type === 'matching' && (
                      <div className="w-full max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Столбец А</p>
                            {lesson.content.pairs.map((pair: any, i: number) => {
                              const isMatched = matchedPairs.includes(i);
                              const isSelected = matchingSelections.left === i;
                              
                              let className = "w-full p-5 text-left rounded-2xl border-2 font-medium transition-all flex items-center gap-4 ";
                              if (isMatched) className += "bg-green-50 border-green-200 text-green-700 opacity-50 cursor-default";
                              else if (isSelected) className += "bg-indigo-600 border-indigo-600 text-white shadow-lg";
                              else className += "bg-white border-gray-100 hover:border-indigo-200";

                              return (
                                <button 
                                  key={i}
                                  disabled={isMatched}
                                  onClick={() => handlePairClick('left', i)}
                                  className={className}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {i + 1}
                                  </div>
                                  {pair.left}
                                </button>
                              );
                            })}
                          </div>
                          <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Столбец Б</p>
                            {shuffledRight.map((item: any, i: number) => {
                              const isMatched = matchedPairs.includes(item.originalIndex);
                              const isSelected = matchingSelections.right === i;
                              
                              let className = "w-full p-5 text-left rounded-2xl border-2 font-medium transition-all flex items-center gap-4 ";
                              if (isMatched) className += "bg-green-50 border-green-200 text-green-700 opacity-50 cursor-default";
                              else if (isSelected) className += "bg-indigo-600 border-indigo-600 text-white shadow-lg";
                              else className += "bg-white border-gray-100 hover:border-indigo-200";

                              return (
                                <button 
                                  key={i}
                                  disabled={isMatched}
                                  onClick={() => handlePairClick('right', i)}
                                  className={className}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                    {String.fromCharCode(65 + i)}
                                  </div>
                                  {item.text}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {lesson.type === 'embed' && (
                      <div className="w-full max-w-5xl aspect-video bg-gray-100 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                        <iframe 
                          src={getEmbedUrl(lesson.content.url)} 
                          className="w-full h-full border-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {lesson.type === 'file' && (
                      <div className="text-center py-10">
                        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                          <FileText className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{lesson.content.fileName || 'Файл с заданием'}</h3>
                        <p className="text-gray-500 mb-10 max-w-md mx-auto">
                          Этот урок содержит прикрепленный документ. Вы можете скачать его для работы в классе или дома.
                        </p>
                        <a 
                          href={lesson.content.fileUrl} 
                          download={lesson.content.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                          <Download className="w-6 h-6" /> Скачать файл
                        </a>
                      </div>
                    )}

                    {lesson.type === 'other' && (
                      <div className="text-center py-10">
                        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <FileText className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Материалы урока</h4>
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 text-left max-w-2xl mx-auto shadow-sm">
                          <h5 className="font-bold text-indigo-600 mb-4 uppercase tracking-widest text-xs">Задачи урока</h5>
                          <p className="text-gray-700 mb-8 leading-relaxed whitespace-pre-wrap">{lesson.content.tasks}</p>
                          
                          <h5 className="font-bold text-indigo-600 mb-4 uppercase tracking-widest text-xs">План занятия</h5>
                          <div className="space-y-4">
                            {lesson.content.plan.map((step: string, i: number) => (
                              <div key={i} className="flex gap-4">
                                <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                                  {i + 1}
                                </div>
                                <p className="text-gray-600">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Goals */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-indigo-600" /> Цели и описание
              </h2>
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Цель:</h4>
                  <p className="text-gray-600 leading-relaxed">{lesson.goals}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Описание:</h4>
                  <p className="text-gray-600 leading-relaxed">{lesson.description}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              {lesson.type === 'test' ? (
                <div className="space-y-3 mb-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportToPDF}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Скачать PDF
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportToWord}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <FileDown className="w-5 h-5" /> Скачать Word
                  </motion.button>
                </div>
              ) : lesson.type === 'file' ? (
                <a 
                  href={lesson.content.fileUrl} 
                  download={lesson.content.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mb-4 no-underline"
                >
                  <Download className="w-5 h-5" /> Скачать файл
                </a>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mb-4"
                >
                  <Download className="w-5 h-5" /> Скачать материалы
                </motion.button>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  <Heart className="w-5 h-5" /> {lesson.likes}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  <Share2 className="w-5 h-5" /> Поделиться
                </motion.button>
                {user && lesson.authorUid === user.uid && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/edit/${lesson.id}`)}
                    className="col-span-2 flex items-center justify-center gap-2 py-3 bg-amber-50 text-amber-600 rounded-xl font-bold hover:bg-amber-100 transition-all"
                  >
                    <Edit2 className="w-5 h-5" /> Редактировать
                  </motion.button>
                )}
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Характеристики</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Просмотры</span>
                  <span className="font-bold">{lesson.views}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Тип</span>
                  <span className="font-bold uppercase">{lesson.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default LessonView;
