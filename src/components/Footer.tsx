import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Методика 2.0</span>
            </div>
            <p className="text-gray-400 max-w-md">Цифровая платформа для учителей русского языка и литературы. Создаем будущее образования вместе.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Навигация</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/catalog" className="hover:text-white transition-colors">Каталог</Link></li>
              <li><Link to="/lab" className="hover:text-white transition-colors">Лаборатория</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">О проекте</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Контакты</h4>
            <ul className="space-y-4 text-gray-400">
              <li>support@metodika.ru</li>
              <li>г. Москва, ул. Примерная, 1</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p>© 2024 Методика 2.0. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};
