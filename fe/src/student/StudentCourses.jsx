import React, { useState, useEffect, useContext } from 'react';
import StudentLayout from './StudentLayout';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { BookOpen, PlayCircle, Clock, CheckCircle, Star, Users, Filter, Plus, X } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

const StudentCourses = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(null);

  const fetchClasses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/classes/student/${user.id}`, {
        headers: {
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchClasses();

    const channel = supabase.channel('public:class_members_student')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'class_members' }, (payload) => {
        if (payload.new.student_id === user?.id) {
          fetchClasses();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (joinCode.length !== 6) {
      alert('Mã lớp học phải gồm 6 ký tự');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ joinCode: joinCode, studentId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setJoinSuccess(data);
        fetchClasses(); // Refresh list
      } else {
        alert('Mã tham gia không hợp lệ hoặc lỗi kết nối');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server');
    }
  };

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Class</h1>
              <p className="text-slate-500 mt-1">Manage and track your enrolled classes.</p>
           </div>
           <div className="flex gap-3">
             <button 
               onClick={() => setIsJoinModalOpen(true)}
               className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
             >
                <Plus size={18} />
                Tham gia lớp
             </button>
           </div>
        </div>

        {/* Join Class Modal */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
              <button 
                onClick={() => { setIsJoinModalOpen(false); setJoinSuccess(null); setJoinCode(''); }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Tham gia lớp học</h2>
              
              {joinSuccess ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{joinSuccess.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">Bạn đã tham gia lớp học thành công!</p>
                  </div>
                  <button 
                    onClick={() => { setIsJoinModalOpen(false); setJoinSuccess(null); setJoinCode(''); }}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoinClass} className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Mã tham gia lớp (6 ký tự)</label>
                    <input 
                      type="text" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="VD: 123456"
                      maxLength={6}
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-center tracking-widest font-mono text-lg font-bold"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                  >
                    Tham gia
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {['enrolled', 'completed', 'saved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold text-sm capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'enrolled' && `Enrolled (${classes.length})`}
              {tab === 'completed' && 'Completed (0)'}
              {tab === 'saved' && 'Saved (0)'}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {activeTab === 'enrolled' && (
          loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">You haven't joined any classes yet</h3>
              <p className="text-slate-500 mt-2">Click the button above to join your first class.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls, idx) => {
                const colors = ['indigo', 'purple', 'emerald', 'orange', 'blue', 'pink'];
                const color = colors[idx % colors.length];
                return (
                  <EnrolledCourseCard 
                    key={cls.id}
                    title={cls.name}
                    instructor={cls.teacherName || 'Instructor'}
                    progress={0}
                    totalLessons={0}
                    completedLessons={0}
                    thumbnail={color}
                    rating={5.0}
                  />
                );
              })}
            </div>
          )
        )}

        {activeTab === 'completed' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CompletedCourseCard 
              title="Introduction to Python"
              instructor="Prof. Emily Watson"
              completedDate="Mar 15, 2024"
              certificate={true}
              rating={5.0}
              thumbnail="emerald"
            />
            <CompletedCourseCard 
              title="Web Development Basics"
              instructor="John Smith"
              completedDate="Feb 28, 2024"
              certificate={true}
              rating={4.8}
              thumbnail="indigo"
            />
            <CompletedCourseCard 
              title="SQL Database Design"
              instructor="Dr. Robert Chen"
              completedDate="Jan 20, 2024"
              certificate={true}
              rating={4.9}
              thumbnail="purple"
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SavedCourseCard 
              title="Machine Learning A-Z"
              instructor="Andrew Ng"
              students="45.2k"
              duration="40 hours"
              rating={4.9}
              price="$89.99"
              thumbnail="indigo"
            />
            <SavedCourseCard 
              title="Advanced React Patterns"
              instructor="Kent C. Dodds"
              students="28.5k"
              duration="25 hours"
              rating={4.8}
              price="$79.99"
              thumbnail="blue"
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

const EnrolledCourseCard = ({ title, instructor, progress, totalLessons, completedLessons, thumbnail, rating }) => {
  const thumbnailColors = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600',
    orange: 'bg-orange-600',
    blue: 'bg-blue-600',
    pink: 'bg-pink-600'
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className={`h-40 ${thumbnailColors[thumbnail]} relative flex items-center justify-center`}>
        <BookOpen className="w-16 h-16 text-white/30" />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-1">
          <Star size={12} className="fill-white" />
          {rating}
        </div>
      </div>
      <div className="p-6">
        <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{title}</h4>
        <p className="text-sm text-slate-500 font-medium mb-4">{instructor}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">{completedLessons}/{totalLessons} lessons</span>
            <span className="font-bold text-slate-900">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${thumbnailColors[thumbnail]} transition-all duration-500`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition group-hover:scale-[1.02]">
          <PlayCircle size={18} />
          Continue Learning
        </button>
      </div>
    </div>
  );
};

const CompletedCourseCard = ({ title, instructor, completedDate, certificate, rating, thumbnail }) => {
  const thumbnailColors = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600'
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className={`h-40 ${thumbnailColors[thumbnail]} relative flex items-center justify-center`}>
        <CheckCircle className="w-16 h-16 text-white/30" />
        {certificate && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold">
            Certificate ✓
          </div>
        )}
      </div>
      <div className="p-6">
        <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{title}</h4>
        <p className="text-sm text-slate-500 font-medium mb-4">{instructor}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-slate-900">{rating}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Completed: {completedDate}</span>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition">
          <CheckCircle size={18} />
          View Certificate
        </button>
      </div>
    </div>
  );
};

const SavedCourseCard = ({ title, instructor, students, duration, rating, price, thumbnail }) => {
  const thumbnailColors = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600'
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className={`h-40 ${thumbnailColors[thumbnail]} relative flex items-center justify-center`}>
        <BookOpen className="w-16 h-16 text-white/30" />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white rounded-full text-slate-900 text-sm font-bold">
          {price}
        </div>
      </div>
      <div className="p-6">
        <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{title}</h4>
        <p className="text-sm text-slate-500 font-medium mb-4">{instructor}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span className="font-medium">{students}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span className="font-medium">{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{rating}</span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
          Enroll Now
        </button>
      </div>
    </div>
  );
};

export default StudentCourses;
