import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth, signOut, db, collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User, Mail, School, BookOpen, Edit2, Save, X, Plus, Book, Clock, CheckCircle2, Layout, FileText, Layers, Trash2, GraduationCap } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (profile) {
      setEditData({
        displayName: profile.displayName || '',
        school: profile.school || '',
        subject: profile.subject || '',
        bio: profile.bio || ''
      });
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'tasks'), where('authorUid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserTasks(tasks);
        setLoadingTasks(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, editData);
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'tasks', taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskToDelete.id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600"></div>
              
              <div className="relative pt-12 text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-lg mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-indigo-600" />
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Имя</label>
                      <input 
                        type="text" 
                        value={editData.displayName}
                        onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Школа</label>
                      <input 
                        type="text" 
                        value={editData.school}
                        onChange={(e) => setEditData({...editData, school: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Предмет</label>
                      <input 
                        type="text" 
                        value={editData.subject}
                        onChange={(e) => setEditData({...editData, subject: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">О себе</label>
                      <textarea 
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleSaveProfile}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Сохранить
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.displayName}</h3>
                    <p className="text-indigo-600 font-medium mb-6 flex items-center justify-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Учитель
                    </p>
                    
                    <div className="space-y-4 text-left border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <School className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{profile.school || 'Школа не указана'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{profile.subject || 'Предмет не указан'}</span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <p className="text-sm text-gray-500 italic leading-relaxed">
                        {profile.bio || 'Расскажите немного о себе и своем подходе к обучению...'}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> Редактировать профиль
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Выйти
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-6">Статистика</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-3xl text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">{userTasks.length}</div>
                  <div className="text-xs font-bold text-indigo-400 uppercase">Заданий</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-3xl text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">0</div>
                  <div className="text-xs font-bold text-emerald-400 uppercase">Просмотров</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Мои задания</h2>
              <button 
                onClick={() => navigate('/lab')}
                className="py-3 px-6 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Создать новое
              </button>
            </div>

            {loadingTasks ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : userTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {userTasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-gray-100 group relative"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${
                        task.type === 'test' ? 'bg-indigo-100 text-indigo-600' :
                        task.type === 'flashcards' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {task.type === 'test' ? <FileText className="w-6 h-6" /> :
                         task.type === 'flashcards' ? <Layers className="w-6 h-6" /> :
                         <Layout className="w-6 h-6" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">
                          {task.grade}
                        </span>
                      </div>
                    </div>
                    
                    <h3 
                      onClick={() => navigate(`/lesson/${task.id}`)}
                      className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {task.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'Недавно'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/edit/${task.id}`)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setTaskToDelete(task)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Book className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">У вас пока нет созданных заданий</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Начните создавать интерактивные уроки в нашей лаборатории и они появятся здесь.
                </p>
                <button 
                  onClick={() => navigate('/lab')}
                  className="py-4 px-8 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Создать первое задание
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Удалить задание?</h3>
              <p className="text-gray-500 mb-8">
                Вы уверены, что хотите удалить задание <span className="font-bold text-gray-900">"{taskToDelete.title}"</span>? Это действие нельзя будет отменить.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Удаление...' : 'Да, удалить'}
                </button>
                <button 
                  onClick={() => setTaskToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
