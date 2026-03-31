/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Lab from './pages/Lab';
import LessonDetail from './pages/LessonDetail';
import Publish from './pages/Publish';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import LessonView from './pages/LessonView';
import EditTask from './pages/EditTask';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/lesson-detail" element={<LessonDetail />} />
            <Route path="/lesson/:id" element={<LessonView />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit/:id" element={<EditTask />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

