import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  
  const navLinks = [
    { name: 'О проекте', path: '/' },
    { name: 'Практика', path: '/catalog' },
    { name: 'Лаборатория', path: '/lab' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Методика 2.0</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`font-medium transition-colors ${location.pathname === link.path ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <Link 
                to="/profile" 
                className={`flex items-center gap-2 font-medium transition-colors ${location.pathname === '/profile' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden border border-indigo-100">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <span className="hidden lg:inline">{profile?.displayName || 'Профиль'}</span>
              </Link>
            ) : (
              <Link to="/auth">
                <button className="text-gray-600 font-medium hover:text-indigo-600 transition-colors">
                  Вход
                </button>
              </Link>
            )}

            <Link to="/publish">
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                Опубликовать
              </button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors ${location.pathname === link.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${location.pathname === '/profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden border border-indigo-100">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <span>{profile?.displayName || 'Мой профиль'}</span>
                </Link>
              ) : (
                <Link 
                  to="/auth" 
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl"
                >
                  Вход для учителей
                </Link>
              )}

              <Link 
                to="/publish" 
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-center shadow-lg shadow-indigo-100"
              >
                Опубликовать
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
