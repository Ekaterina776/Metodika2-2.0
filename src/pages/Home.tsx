import React from 'react';
import { motion } from 'motion/react';
import { Rocket, School, Lightbulb, Users, Sparkles, Map, FileQuestion, Gamepad2, ArrowRight, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-3xl opacity-60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-8"
            >
              <Rocket className="w-4 h-4" />
              <span>Новое поколение методических материалов</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight"
            >
              Методика 2.0: <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
                Цифровая лаборатория учителя
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-12 leading-relaxed"
            >
              Платформа для обмена опытом, создания интерактивных уроков и внедрения современных технологий в преподавание русского языка и литературы.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link to="/catalog" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                  Начать работу
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link to="/lab" className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  В лабораторию
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section - Bento Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">О проекте</h2>
            <p className="text-gray-600">Почему учителя выбирают нашу платформу</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Современные методики</h3>
              <p className="text-gray-600 leading-relaxed">Мы объединяем классическое преподавание с новейшими цифровыми инструментами. В нашей базе — сотни разработок от ведущих педагогов, адаптированных под современные образовательные стандарты.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 flex flex-col justify-between"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Инновации</h3>
                <p className="text-indigo-100">Используйте ИИ для генерации заданий и создания интерактивных карт.</p>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Сообщество</h3>
              <p className="text-gray-600">Обменивайтесь опытом с коллегами и получайте обратную связь.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1">
                <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Интерактивный контент</h3>
                <p className="text-gray-600">Создавайте уроки, которые вовлекают учеников с первой минуты. Интеграция с Genially, Twine и другими сервисами.</p>
              </div>
              <div className="flex-1 w-full h-48 bg-gray-100 rounded-2xl overflow-hidden">
                <img src="https://picsum.photos/seed/digital-learning-platform/800/600" alt="Education" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-12">Как начать работу?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex gap-6">
                  <div className="text-4xl font-black text-indigo-500 opacity-50">01</div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Изучите каталог</h4>
                    <p className="text-gray-400">Найдите подходящую разработку по теме, классу или технологии.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="text-4xl font-black text-indigo-500 opacity-50">02</div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Используйте ИИ</h4>
                    <p className="text-gray-400">Создайте уникальные задания в нашей интерактивной лаборатории.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="text-4xl font-black text-indigo-500 opacity-50">03</div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Делитесь опытом</h4>
                    <p className="text-gray-400">Публикуйте свои лучшие уроки и становитесь экспертом платформы.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Sections */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Популярные разделы</h2>
              <p className="text-gray-600">Самые востребованные инструменты лаборатории</p>
            </div>
            <Link to="/lab" className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Все инструменты <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-indigo-200 transition-all group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold mb-2">ИИ-Генератор</h4>
              <p className="text-gray-500 text-sm">Создание карточек и тестов за секунды</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-violet-200 transition-all group">
              <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all">
                <Map className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold mb-2">Карты</h4>
              <p className="text-gray-500 text-sm">Литературные маршруты и биографии</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-fuchsia-200 transition-all group">
              <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-fuchsia-600 group-hover:text-white transition-all">
                <FileQuestion className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold mb-2">Квизы</h4>
              <p className="text-gray-500 text-sm">Интерактивные викторины для уроков</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-orange-200 transition-all group">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold mb-2">Игры</h4>
              <p className="text-gray-500 text-sm">Текстовые квесты на базе Twine</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">Готовы изменить свои уроки?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">Присоединяйтесь к сообществу учителей будущего и получите доступ ко всем инструментам платформы.</p>
              <Link to="/publish" className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all shadow-2xl inline-block">
                Опубликовать разработку
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
