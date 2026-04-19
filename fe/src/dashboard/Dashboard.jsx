import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  UserCircle, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Plus,
  Calendar
} from 'lucide-react';

const Dashboard = ({ children }) => {
  const [isSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <BookOpen size={20} />, label: 'My Courses', path: '/courses' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/chat' },
    { icon: <BarChart3 size={20} />, label: 'Performance', path: '/evaluation' },
    { icon: <UserCircle size={20} />, label: 'Admin Panel', path: '/admin' },
  ];

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
          <button className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition w-full font-medium">
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
                 placeholder="Search courses, lessons, files..." 
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
                <p className="text-sm font-bold text-slate-900 uppercase">John Maverick</p>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Lead Instructor</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-md ring-1 ring-slate-100" />
            </div>
          </div>
        </header>

        {/* Dashboard View Content */}
        {!children ? (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
                  <p className="text-slate-500 mt-1">Check what's happening in your classes today.</p>
               </div>
               <div className="flex gap-3">
                 <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                    <Plus size={18} />
                    New Course
                 </button>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard title="Active Students" value="1,284" change="+12.5%" color="indigo" />
               <StatCard title="Course Completion" value="84%" change="+4.2%" color="emerald" />
               <StatCard title="Avg. Feedback" value="4.9/5" change="Stable" color="orange" />
               <StatCard title="Pending Tasks" value="12" change="-2" color="purple" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-xl font-bold text-slate-900">Recent Activities</h2>
                     <button className="text-sm font-bold text-indigo-600 hover:underline">View all</button>
                  </div>
                  <div className="space-y-6">
                    <ActivityItem 
                      title="Assignment Submitted" 
                      desc="Sarah Jenkins submitted 'Modern Architecture' Quiz." 
                      time="2 mins ago" 
                      dot="indigo"
                    />
                     <ActivityItem 
                      title="New Course Published" 
                      desc="You launched 'UX Research Fundamentals'." 
                      time="3 hours ago" 
                      dot="emerald"
                    />
                     <ActivityItem 
                      title="System Update" 
                      desc="Backend performance optimization completed." 
                      time="Yesterday" 
                      dot="orange"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                 <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-2">Live Session Reminder</h3>
                      <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Your workshop on "Advanced React Hooks" starts in 15 minutes.</p>
                      <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition">
                         Join Classroom
                      </button>
                    </div>
                    <Calendar className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                 </div>
              </div>
            </div>
          </div>
        ) : children}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, change }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-3xl font-extrabold text-slate-900">{value}</h4>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
        change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 
        change.startsWith('-') ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
      }`}>
        {change}
      </span>
    </div>
  </div>
);

const ActivityItem = ({ title, desc, time, dot }) => {
  const dotColors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    orange: 'bg-orange-600',
  };
  return (
    <div className="flex gap-4">
      <div className="pt-1.5">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColors[dot]} ring-4 ring-white shadow-sm`} />
      </div>
      <div>
        <h5 className="text-sm font-bold text-slate-900">{title}</h5>
        <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
        <span className="text-[11px] font-bold text-slate-400 mt-2 block uppercase tracking-tight">{time}</span>
      </div>
    </div>
  );
};

export default Dashboard;
