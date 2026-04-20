import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  UserCircle, 
  LogOut,
  Bell,
  Search,
  Trophy
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const StudentLayout = ({ children }) => {
  const [isSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/student/dashboard' },
    { icon: <BookOpen size={20} />, label: 'My Courses', path: '/student/courses' },
    { icon: <Trophy size={20} />, label: 'Assignments', path: '/student/assignments' },
    { icon: <BarChart3 size={20} />, label: 'Progress', path: '/student/progress' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/chat' },
  ];

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
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${
                location.pathname === item.path 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {isSidebarOpen && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
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
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.user_metadata?.full_name || 'Student'}</p>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Student</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-md ring-1 ring-slate-100 flex items-center justify-center text-white font-bold text-sm">
                {user?.user_metadata?.full_name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;
