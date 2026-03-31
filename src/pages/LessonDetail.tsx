import React from 'react';
import { ChevronRight, GraduationCap, Layers, User, Calendar, Target, CheckCircle, Maximize, ExternalLink, Download, Share2, Heart, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const LessonDetail = () => {
  const lessonSteps = [
    {
      title: "Вызов (актуализация знаний)",
      content: "Ученики вспоминают, что им известно о романе, и формулируют вопросы, на которые хотели бы получить ответы в ходе игры."
    },
    {
      title: "Осмысление (прохождение квеста)",
      content: "Основной этап урока. Ученики делятся на группы и проходят интерактивный квест, принимая решения за главного героя."
    },
    {
      title: "Рефлексия (обсуждение результатов)",
      content: "Анализ принятых решений, обсуждение того, как они повлияли на финал истории и соответствуют ли они авторскому замыслу."
    }
  ];

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Главная</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/catalog" className="hover:text-indigo-600 transition-colors">Каталог</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Интерактивный квест по роману 'Евгений Онегин'</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Header */}
            <section>
              <h1 className="text-4xl font-black text-gray-900 mb-6 leading-tight">Интерактивный квест по роману 'Евгений Онегин'</h1>
              
              <div className="flex flex-wrap items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Автор</p>
                    <p className="text-sm font-bold">Мария Иванова</p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
                
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Класс</p>
                    <p className="text-sm font-bold">9 класс</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Технология</p>
                    <p className="text-sm font-bold">Twine</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Опубликовано</p>
                    <p className="text-sm font-bold">12.03.2024</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Goals */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-indigo-600" /> Цели и задачи
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Цель урока:</h4>
                  <p className="text-gray-600 leading-relaxed">Повышение читательской грамотности и интереса к классической литературе через игровые механики.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Задачи:</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" /> Анализ ключевых сцен романа</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" /> Развитие навыков принятия решений</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" /> Работа в группах</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Описание разработки</h2>
              <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed space-y-6">
                <p>Данный квест представляет собой нелинейное повествование, где ученик выступает в роли главного героя. Каждое решение влияет на развитие сюжета и отношение других персонажей к игроку.</p>
                <img src="https://picsum.photos/seed/literature-class/1200/600" alt="Onegin" className="w-full rounded-3xl shadow-lg my-8" referrerPolicy="no-referrer" />
                <p>В процессе прохождения ученики сталкиваются с цитатами из текста, историческими справками и вопросами на знание сюжета. Это позволяет не только проверить знания, но и глубже понять мотивы героев.</p>
              </div>
            </section>

            {/* Steps */}
            <section>
              <h2 className="text-2xl font-bold mb-8">Этапы урока</h2>
              <div className="space-y-6">
                {lessonSteps.map((step, index) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0 z-10">
                        {index + 1}
                      </div>
                      {index !== lessonSteps.length - 1 && (
                        <div className="w-0.5 h-full bg-indigo-100 group-hover:bg-indigo-600 transition-colors"></div>
                      )}
                    </div>
                    <div className="pb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Element */}
            <section className="bg-gray-900 rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-2xl font-bold">Интерактивный элемент</h2>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><Maximize className="w-5 h-5" /></button>
                  <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><ExternalLink className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="aspect-video bg-gray-800 rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
                <p className="text-gray-400">Здесь будет встроенный фрейм Genially / Twine</p>
              </div>
            </section>

            {/* Gallery */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Галерея материалов</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-all">
                    <img src={`https://picsum.photos/seed/school-activity${i}/400/400`} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </section>

            {/* Comments */}
            <section className="pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-8">Комментарии (12)</h2>
              
              <div className="flex gap-4 mb-12">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <textarea placeholder="Поделитесь своим мнением..." className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 transition-all"></textarea>
                  <div className="flex justify-end mt-4">
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      Отправить <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold">Елена Петрова</span>
                      <span className="text-xs text-gray-400">2 дня назад</span>
                    </div>
                    <p className="text-gray-600">Отличная разработка! Использовала на уроке в 9 классе, дети были в восторге. Особенно понравился этап рефлексии.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mb-4"
              >
                <Download className="w-5 h-5" /> Скачать материалы
              </motion.button>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  <Heart className="w-5 h-5" /> 85
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  <Share2 className="w-5 h-5" /> Поделиться
                </motion.button>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Характеристики</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Формат файла</span>
                  <span className="font-bold">PDF, ZIP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Размер</span>
                  <span className="font-bold">12.4 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Сложность</span>
                  <span className="font-bold text-orange-500">Средняя</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-4">Теги</h4>
                <div className="flex flex-wrap gap-2">
                  {['Пушкин', 'Онегин', '9 класс', 'Квест', 'Литература'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
