import { useState, useEffect, useContext, useCallback } from 'react';
import StudentLayout from './StudentLayout';
import { Link } from 'react-router-dom';
import {
  BookOpen, Clock, Trophy, TrendingUp, CheckCircle,
  Calendar, Target, Megaphone, FileText, ClipboardList,
  ArrowRight, Bell, X, Plus
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const API_URL = 'http://localhost:8080/api';

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

const POST_TYPE_CONFIG = {
  ANNOUNCEMENT: { label: 'Announcement', icon: Megaphone, badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  DOCUMENT:     { label: 'Document',     icon: FileText,  badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  ASSIGNMENT:   { label: 'Assignment',   icon: ClipboardList, badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
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

const isUrgent = (iso) => {
  if (!iso) return false;
  const diffDays = Math.ceil((new Date(iso) - new Date()) / 86400000);
  return diffDays <= 1;
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

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

  const fetchPosts = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/posts`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('fetchPosts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchPosts]);

  const recentPosts = posts.slice(0, 4);
  const upcomingAssignments = posts
    .filter(p => p.postType === 'ASSIGNMENT' && p.deadline && new Date(p.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-slate-500 mt-1">Here's what's happening in your classes today.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/student/courses"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition shadow-sm w-fit"
            >
              <Plus size={18} />
              Go to My Class
            </Link>
            <Link
              to="/posts"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 w-fit"
            >
              <BookOpen size={18} />
              Class Feed
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="New Posts"
            value={posts.length}
            icon={<Bell size={24} />}
            color="indigo"
          />
          <StatCard
            title="Assignments"
            value={posts.filter(p => p.postType === 'ASSIGNMENT').length}
            icon={<ClipboardList size={24} />}
            color="orange"
          />
          <StatCard
            title="Documents"
            value={posts.filter(p => p.postType === 'DOCUMENT').length}
            icon={<FileText size={24} />}
            color="emerald"
          />
          <StatCard
            title="Announcements"
            value={posts.filter(p => p.postType === 'ANNOUNCEMENT').length}
            icon={<Megaphone size={24} />}
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Upcoming Assignments */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Upcoming Assignments</h2>
                <Link to="/posts?type=ASSIGNMENT" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={32} className="text-emerald-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">No upcoming assignments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAssignments.map(post => {
                    const urgent = isUrgent(post.deadline);
                    return (
                      <div
                        key={post.id}
                        className={`p-5 rounded-2xl border transition-all ${urgent ? 'border-red-200 bg-red-50/40' : 'border-slate-100 bg-slate-50 hover:bg-white'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{post.title}</h4>
                            {post.content && (
                              <p className="text-sm text-slate-500 mt-0.5 truncate">{post.content}</p>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${urgent ? 'bg-red-100 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            {formatDeadline(post.deadline)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                          <Calendar size={13} />
                          <span className="font-medium">
                            Due: {new Date(post.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span>by {post.author?.fullName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Class Feed */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Posts</h2>
                <Link to="/posts" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">No posts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map(post => {
                    const cfg = POST_TYPE_CONFIG[post.postType] || POST_TYPE_CONFIG.ANNOUNCEMENT;
                    const Icon = cfg.icon;
                    return (
                      <Link
                        key={post.id}
                        to="/posts"
                        className="flex items-start gap-3 p-4 rounded-2xl hover:bg-slate-50 transition group"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.badge}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.badge.split(' ')[1]}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 truncate">{post.title}</p>
                          {post.content && (
                            <p className="text-xs text-slate-500 truncate">{post.content}</p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-1">
                            {post.author?.fullName} · {timeAgo(post.createdAt)}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition shrink-0 mt-1" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study streak card */}
            <div className="bg-linear-to-br from-indigo-600 to-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold">Stay on track</h3>
                    <p className="text-indigo-100 text-sm font-medium">Keep learning 🔥</p>
                  </div>
                </div>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                  Check the Class Feed regularly to stay up to date with new assignments and documents.
                </p>
                <Link
                  to="/posts"
                  className="block w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition text-center"
                >
                  Open Class Feed
                </Link>
              </div>
              <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
            </div>

            {/* Post type breakdown */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Post Summary</h3>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(POST_TYPE_CONFIG).map(([type, cfg]) => {
                    const count = posts.filter(p => p.postType === type).length;
                    const Icon = cfg.icon;
                    return (
                      <Link
                        key={type}
                        to="/posts"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.badge}`}>
                          <Icon size={14} />
                        </div>
                        <span className="flex-1 text-sm font-semibold text-slate-700">{cfg.label}s</span>
                        <span className="text-sm font-bold text-slate-900">{count}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <QuickLink to="/student/courses"     icon={<BookOpen size={16} />}     label="My Courses" />
                <QuickLink to="/posts"               icon={<Bell size={16} />}          label="Class Feed" />
                <QuickLink to="/student/assignments" icon={<ClipboardList size={16} />} label="Assignments" />
                <QuickLink to="/student/progress"    icon={<TrendingUp size={16} />}    label="My Progress" />
                <QuickLink to="/chat"                icon={<Clock size={16} />}         label="Messages" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-3xl font-extrabold text-slate-900">{value}</h4>
    </div>
  );
};

const QuickLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium text-sm"
  >
    <span className="shrink-0">{icon}</span>
    {label}
  </Link>
);

export default StudentDashboard;
