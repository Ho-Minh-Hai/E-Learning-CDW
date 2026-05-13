import React, { useState, useEffect, useContext } from 'react';
import Dashboard from '../dashboard/Dashboard';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Plus, PlayCircle, FileText, Users, Clock, ArrowUpRight, BookOpen, X, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

const CourseManagement = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'join'
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdClass, setCreatedClass] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profiles/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  };

  const fetchClasses = async (currentProfile) => {
    const role = currentProfile?.role || 'user';
    const endpoint = (role === 'teacher' || role === 'admin') 
      ? `${API_URL}/classes/teacher/${user.id}` 
      : `${API_URL}/classes/student/${user.id}`;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(endpoint, {
        headers: {
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile().then(p => fetchClasses(p));
    }
  }, [user?.id]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ name: className, teacherId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedClass(data);
        fetchClasses(profile); // Refresh list
      } else {
        alert('Lỗi tạo lớp học');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server');
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

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
        alert(`Đã tham gia lớp học: ${data.name}`);
        setIsModalOpen(false);
        setJoinCode('');
        fetchClasses(profile);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Mã tham gia không hợp lệ');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server');
    }
  };

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

  return (
    <Dashboard>
      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {isTeacher ? 'My Class' : 'My Learning'}
              </h1>
              <p className="text-slate-500 mt-1">
                {isTeacher 
                  ? 'Design, manage and monitor your educational content.' 
                  : 'Access your joined classes and course materials.'}
              </p>
           </div>
           <div className="flex gap-3">
             {isTeacher ? (
               <button 
                 onClick={() => { setModalType('create'); setIsModalOpen(true); }}
                 className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
               >
                  <Plus size={18} />
                  Create New Class
               </button>
             ) : (
               <button 
                 onClick={() => { setModalType('join'); setIsModalOpen(true); }}
                 className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
               >
                  <Plus size={18} />
                  Join Class
               </button>
             )}
           </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
              <button 
                onClick={() => { setIsModalOpen(false); setCreatedClass(null); setClassName(''); setJoinCode(''); }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {modalType === 'create' ? 'Tạo lớp học mới' : 'Tham gia lớp học'}
              </h2>
              
              {modalType === 'create' ? (
                createdClass ? (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={40} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{createdClass.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">Lớp học đã được tạo thành công!</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mã tham gia lớp</p>
                      <p className="text-4xl font-black text-indigo-600 tracking-widest">{createdClass.joinCode}</p>
                    </div>
                    <button 
                      onClick={() => { setIsModalOpen(false); setCreatedClass(null); setClassName(''); }}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                      Đóng
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateClass} className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Tên lớp học</label>
                      <input 
                        type="text" 
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="VD: Nhập môn Lập trình Web"
                        required
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                    >
                      Tạo lớp
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handleJoinClass} className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Mã tham gia lớp học</label>
                    <input 
                      type="text" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="VD: 816927"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 text-center text-2xl font-bold tracking-widest"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
                  >
                    Tham gia ngay
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">
              {isTeacher ? "You haven't created any classes yet" : "You haven't joined any classes yet"}
            </h3>
            <p className="text-slate-500 mt-2">
              {isTeacher 
                ? "Click the button above to create your first class." 
                : "Enter a class code to start learning."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls, idx) => {
              const colors = ['indigo', 'purple', 'emerald', 'orange'];
              const color = colors[idx % colors.length];
              return (
                <CourseCard 
                  key={cls.id}
                  title={cls.name} 
                  students={isTeacher ? `${cls.studentCount || 0} Students` : `Teacher: ${cls.teacherName}`} 
                  lessons={isTeacher ? `Code: ${cls.joinCode}` : `Joined`}
                  status="Active"
                  color={color}
                />
              );
            })}
          </div>
        )}

      </div>
    </Dashboard>
  );
};

const CourseCard = ({ title, students, lessons, status, color }) => {
  const bgStyles = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600'
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <div className={`h-32 ${bgStyles[color]} relative p-6 text-white`}>
        <div className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-lg">
           <ArrowUpRight size={20} />
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full uppercase tracking-wider">{status}</span>
      </div>
      <div className="p-6 pt-8 relative">
        <div className="absolute -top-10 left-6 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50">
           <BookOpen className={`w-10 h-10 text-${color}-600`} />
        </div>
        <h4 className="text-xl font-extrabold text-slate-900 mb-4">{title}</h4>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-slate-500">
              <Users size={16} />
              <span className="text-sm font-bold">{students}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
              <PlayCircle size={16} />
              <span className="text-sm font-bold">{lessons}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
