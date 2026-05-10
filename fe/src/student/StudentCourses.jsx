import React, { useState, useEffect, useContext, useCallback } from 'react';
import StudentLayout from './StudentLayout';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { 
  BookOpen, PlayCircle, Clock, CheckCircle, Star, Users, Filter, Plus, X,
  ArrowLeft, Megaphone, FileText, ClipboardList, Calendar, Bell, Trash2,
  Download, AlertCircle, TrendingUp, CheckCircle2, ExternalLink
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

// ── Helper functions ──────────────────────────────────────────────────────────
const getUpcomingDeadlines = (posts) => {
  return posts
    .filter(p => p.postType === 'ASSIGNMENT' && p.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);
};

const getClassDocuments = (posts) => {
  return posts
    .filter(p => p.postType === 'DOCUMENT' && p.fileUrl)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
};

const formatDeadline = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return '1 day left';
  return `${diffDays} days left`;
};

const formatDeadlineDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const isOverdue = (iso) => {
  if (!iso) return false;
  return new Date(iso) < new Date();
};

const isUrgent = (iso) => {
  if (!iso) return false;
  const diffDays = Math.ceil((new Date(iso) - new Date()) / 86400000);
  return diffDays <= 2;
};

// ── Class Sidebar Component ────────────────────────────────────────────────────
const ClassSidebar = ({ classPosts, selectedClass }) => {
  const upcomingDeadlines = getUpcomingDeadlines(classPosts);
  const classDocuments = getClassDocuments(classPosts);

  return (
    <div className="w-full lg:w-80 space-y-6">
      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-orange-600" />
            Upcoming Deadlines
          </h3>
          {upcomingDeadlines.length > 0 && (
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              {upcomingDeadlines.length}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {upcomingDeadlines.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 size={32} className="text-emerald-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No upcoming deadlines</p>
            </div>
          ) : (
            upcomingDeadlines.map((assignment) => {
              const overdue = isOverdue(assignment.deadline);
              const urgent = isUrgent(assignment.deadline);
              return (
                <div
                  key={assignment.id}
                  className={`p-3 rounded-lg border transition ${
                    overdue
                      ? 'bg-red-50 border-red-200'
                      : urgent
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-semibold line-clamp-2 ${
                      overdue ? 'text-red-900' : urgent ? 'text-orange-900' : 'text-slate-900'
                    }`}>
                      {assignment.title}
                    </p>
                    {overdue && <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    overdue ? 'text-red-700 font-semibold' : urgent ? 'text-orange-700 font-semibold' : 'text-slate-500'
                  }`}>
                    <Clock size={12} />
                    {formatDeadline(assignment.deadline)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatDeadlineDate(assignment.deadline)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Class Documents */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" />
            Class Documents
          </h3>
          {classDocuments.length > 0 && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              {classDocuments.length}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {classDocuments.length === 0 ? (
            <div className="py-8 text-center">
              <FileText size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No documents available</p>
            </div>
          ) : (
            classDocuments.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition">
                  <Download size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {doc.fileName || 'Document'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {doc.title}
                  </p>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-600 shrink-0 transition" />
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StudentCourses = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classPosts, setClassPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(null);

  const authFetch = async (url, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  };

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

  const fetchPostsByClass = useCallback(async (classId) => {
    setPostsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/posts?classId=${classId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setClassPosts(data);
    } catch (err) {
      console.error('fetchPostsByClass error:', err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

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

  // When a class is selected, fetch its posts
  useEffect(() => {
    if (selectedClass?.id) {
      fetchPostsByClass(selectedClass.id);
    }
  }, [selectedClass, fetchPostsByClass]);

  // Realtime subscription for posts
  useEffect(() => {
    if (!selectedClass?.id) return;

    const channel = supabase
      .channel(`class-posts-${selectedClass.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
      }, () => fetchPostsByClass(selectedClass.id))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedClass?.id, fetchPostsByClass]);

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassPosts([]);
  };

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
        {/* If a class is selected, show the class feed */}
        {selectedClass ? (
          <div className="flex flex-col gap-8">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToClasses}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <ArrowLeft size={24} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{selectedClass.name}</h1>
                <p className="text-slate-500 mt-1">Giảng viên: {selectedClass.teacherName || 'Instructor'}</p>
              </div>
            </div>

            {/* Main content with sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Posts for the selected class */}
              <div className="flex-1 space-y-4">
                {postsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : classPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <Bell size={28} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No posts yet in this class</p>
                  </div>
                ) : (
                  <div className="grid gap-4 max-w-2xl">
                    {classPosts.map(post => (
                      <ClassPostCard
                        key={post.id}
                        post={post}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <ClassSidebar 
                classPosts={classPosts}
                selectedClass={selectedClass}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Show class list when no class is selected */}
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
                        classData={cls}
                        title={cls.name}
                        instructor={cls.teacherName || 'Instructor'}
                        progress={0}
                        totalLessons={0}
                        completedLessons={0}
                        thumbnail={color}
                        rating={5.0}
                        onSelect={handleSelectClass}
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
          </>
        )}
      </div>
    </StudentLayout>
  );
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const POST_TYPES = {
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: Megaphone,
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    iconColor: 'text-indigo-600',
    dot: 'bg-indigo-500',
  },
  DOCUMENT: {
    label: 'Document',
    icon: FileText,
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  ASSIGNMENT: {
    label: 'Assignment',
    icon: ClipboardList,
    color: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    iconColor: 'text-orange-600',
    dot: 'bg-orange-500',
  },
};

// ── Class Post Card ────────────────────────────────────────────────────────────
const ClassPostCard = ({ post, currentUserId }) => {
  const cfg = POST_TYPES[post.postType] || POST_TYPES.ANNOUNCEMENT;
  const Icon = cfg.icon;

  return (
    <div className={`bg-white border ${cfg.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${cfg.badge} rounded-lg`}>
          <Icon size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">{cfg.label}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>

      {/* Content */}
      {post.content && (
        <p className="text-sm text-slate-600 leading-relaxed mb-3">{post.content}</p>
      )}

      {/* Attached file */}
      {post.fileUrl && (
        <a
          href={post.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition mb-3 ${
            post.postType === 'DOCUMENT'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100'
          }`}
        >
          <FileText size={14} />
          {post.fileName || 'View attachment'}
        </a>
      )}

      {/* Deadline */}
      {post.postType === 'ASSIGNMENT' && post.deadline && (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-700 mb-3">
          <Calendar size={14} />
          Due: {formatDate(post.deadline)}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {post.author?.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <span className="text-xs text-slate-500 font-medium">{post.author?.fullName || 'Anonymous'}</span>
        <span className="text-slate-300 text-xs">·</span>
        <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
      </div>
    </div>
  );
};

const EnrolledCourseCard = ({ classData, title, instructor, progress, totalLessons, completedLessons, thumbnail, rating, onSelect }) => {
  const thumbnailColors = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600',
    orange: 'bg-orange-600',
    blue: 'bg-blue-600',
    pink: 'bg-pink-600'
  };

  return (
    <div 
      onClick={() => onSelect(classData)}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
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
          View Class Feed
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
