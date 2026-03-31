import React, { useState, useEffect } from 'react';
import { Filter, Search, GraduationCap, Layers, User, ArrowUpDown, Eye, Heart, MessageSquare, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db, collection, query, onSnapshot } from '../firebase';

const Catalog = () => {
  const [publishedTasks, setPublishedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublishedTasks(tasks);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const catalogItems = publishedTasks;

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Каталог практик</h1>
            <p className="text-gray-500">Лучшие методические разработки коллег со всей страны</p>
          </div>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Поиск по теме или автору..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="relative group">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
            <select className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option>Все классы</option>
              <option>5-6 классы</option>
              <option>7-9 классы</option>
              <option>10-11 классы</option>
            </select>
          </div>
          
          <div className="relative group">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
            <select className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option>Все технологии</option>
              <option>Интерактивные карты</option>
              <option>Игровые механики</option>
              <option>ИИ-инструменты</option>
            </select>
          </div>
          
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
            <select className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option>Все авторы</option>
              <option>Эксперты</option>
              <option>Новички</option>
            </select>
          </div>
          
          <div className="relative group">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
            <select className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option>Сначала популярные</option>
              <option>Сначала новые</option>
              <option>По рейтингу</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {catalogItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link to={`/lesson/${item.id}`} className="group block bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  {item.image && (
                    <div className="relative h-56 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-md text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">{item.grade}</span>
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">{item.tech}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-6 flex flex-col ${item.image ? 'h-[calc(100%-14rem)]' : 'h-full'}`}>
                    {!item.image && (
                      <div className="flex gap-2 mb-4">
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{item.grade}</span>
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{item.tech}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    
                    <div className="flex items-center gap-2 mb-auto pb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-500 font-medium">{item.author || item.authorName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {item.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {item.likes}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {item.comments}</span>
                      </div>
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4">
          <button className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100">1</button>
            <button className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-white hover:border-indigo-200 transition-all">2</button>
            <button className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-white hover:border-indigo-200 transition-all">3</button>
            <span className="w-12 h-12 flex items-center justify-center text-gray-400">...</span>
            <button className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-white hover:border-indigo-200 transition-all">12</button>
          </div>
          <button className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
