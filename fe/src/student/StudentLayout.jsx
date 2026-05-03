import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  BarChart3,
  LogOut,
  Bell,
  Search,
  Trophy,
  Newspaper,
  Megaphone,
  FileText,
  ClipboardList,
  X,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../context/AuthContext';

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
  ANNOUNCEMENT: { label: 'Announcement', icon: Megaphone, badge: 'bg-indigo-100 text-indigo-700' },
  DOCUMENT:     { label: 'Document',     icon: FileText,  badge: 'bg-emerald-100 text-emerald-700' },
  ASSIGNMENT:   { label: 'Assignment',   icon: ClipboardList, badge: 'bg-orange-100 text-orange-700' },
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Per-user read state in localStorage ──────────────────────────────────────
const readKey = (userId) => `read_posts_${userId}`;

const getReadIds = (userId) => {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(readKey(userId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const saveReadIds = (userId, ids) => {
  if (!userId) return;
  localStorage.setItem(readKey(userId), JSON.stringify([...ids]));
};

// ── Notification dropdown ─────────────────────────────────────────────────────
const NotificationPanel = ({ posts, readIds, onClose, onMarkAllRead, onMarkOneRead }) => {
  const unreadCount = posts.filter(p => !readIds.has(p.id)).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No notifications yet</p>
          </div>
        ) : (
          posts.map((post) => {
            const cfg = POST_TYPE_CONFIG[post.postType] || POST_TYPE_CONFIG.ANNOUNCEMENT;
            const Icon = cfg.icon;
            const isUnread = !readIds.has(post.id);

            return (
              <Link
                key={post.id}
                to="/posts"
                onClick={() => { onMarkOneRead(post.id); onClose(); }}
                className={`flex gap-3 px-5 py-4 hover:bg-slate-50 transition ${isUnread ? 'bg-indigo-50/50' : ''}`}
              >
                {/* Type icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.badge}`}>
                  <Icon size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.badge.split(' ')[1]}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-500'}`}>
                    {post.title}
                  </p>
                  {post.content && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{post.content}</p>
                  )}
                  {post.postType === 'ASSIGNMENT' && post.deadline && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-orange-600 font-semibold">
                      <Calendar size={11} />
                      Due: {formatDate(post.deadline)}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {post.author?.fullName} · {formatDate(post.createdAt)}
                  </p>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Footer */}
      {posts.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <Link
            to="/posts"
            onClick={() => { onMarkAllRead(); onClose(); }}
            className="block text-center text-sm font-bold text-indigo-600 hover:underline"
          >
            View all posts →
          </Link>
        </div>
      )}
    </div>
  );
};

// ── Main layout ───────────────────────────────────────────────────────────────
const StudentLayout = ({ children }) => {
  const [isSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { signOut } = useAuth();

  const userId = user?.id;

  const [posts, setPosts] = useState([]);
  // readIds persisted per-user in localStorage
  const [readIds, setReadIds] = useState(() => getReadIds(userId));
  const [showNotifications, setShowNotifications] = useState(false);

  // Re-load readIds when userId changes (different account)
  useEffect(() => {
    setReadIds(getReadIds(userId));
  }, [userId]);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard',   path: '/student/dashboard' },
    { icon: <BookOpen size={20} />,        label: 'My Class',    path: '/student/courses' },
    { icon: <Newspaper size={20} />,       label: 'Class Feed',  path: '/posts' },
    { icon: <Trophy size={20} />,          label: 'Assignments', path: '/student/assignments' },
    { icon: <BarChart3 size={20} />,       label: 'Progress',    path: '/student/progress' },
    { icon: <MessageSquare size={20} />,   label: 'Messages',    path: '/chat' },
  ];

  // ── Fetch posts — does NOT touch readIds ────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/posts`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('fetchPosts error:', err);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ── Realtime: new post arrives → refresh list (new post not in readIds → unread) ──
  useEffect(() => {
    const channel = supabase
      .channel('student-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
      }, fetchPosts)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchPosts]);

  // ── Auto mark all read when student visits /posts ───────────────────────────
  useEffect(() => {
    if (location.pathname === '/posts' && posts.length > 0 && userId) {
      const allIds = new Set(posts.map(p => p.id));
      setReadIds(allIds);
      saveReadIds(userId, allIds);
    }
  }, [location.pathname, posts, userId]);

  // ── Mark a single post as read (click on notification item) ────────────────
  const handleMarkOneRead = useCallback((postId) => {
    setReadIds(prev => {
      const next = new Set([...prev, postId]);
      saveReadIds(userId, next);
      return next;
    });
  }, [userId]);

  // ── Mark all posts as read ──────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(() => {
    const allIds = new Set(posts.map(p => p.id));
    setReadIds(allIds);
    saveReadIds(userId, allIds);
  }, [posts, userId]);

  const unreadCount = posts.filter(p => !readIds.has(p.id)).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && <span className="text-xl font-bold text-slate-900 overflow-hidden whitespace-nowrap">EduFlow</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showBadge = item.path === '/posts' && unreadCount > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="shrink-0 relative">
                  {item.icon}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  )}
                </span>
                {isSidebarOpen && (
                  <span className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap">
                    {item.label}
                    {showBadge && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition w-full font-medium"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, lessons, assignments..."
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotifications && (
                <NotificationPanel
                  posts={posts}
                  readIds={readIds}
                  onClose={() => setShowNotifications(false)}
                  onMarkAllRead={handleMarkAllRead}
                  onMarkOneRead={handleMarkOneRead}
                />
              )}
            </div>

            <div className="w-px h-8 bg-slate-200 mx-2" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.user_metadata?.full_name || 'Student'}</p>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Student</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-md ring-1 ring-slate-100 flex items-center justify-center text-white font-bold text-sm">
                {user?.user_metadata?.full_name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {children}
      </main>

      {/* Backdrop to close notification panel */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default StudentLayout;
