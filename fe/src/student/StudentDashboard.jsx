import React from 'react';
import StudentLayout from './StudentLayout';
import { BookOpen, Clock, Trophy, TrendingUp, PlayCircle, CheckCircle, Calendar, Target } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Learning Dashboard</h1>
              <p className="text-slate-500 mt-1">Track your progress and continue learning.</p>
           </div>
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                <BookOpen size={18} />
                Browse Courses
             </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard title="Enrolled Courses" value="6" icon={<BookOpen size={24} />} color="indigo" />
           <StatCard title="Completed" value="12" icon={<CheckCircle size={24} />} color="emerald" />
           <StatCard title="Study Hours" value="48h" icon={<Clock size={24} />} color="purple" />
           <StatCard title="Achievements" value="8" icon={<Trophy size={24} />} color="orange" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
                 <button className="text-sm font-bold text-indigo-600 hover:underline">View all</button>
              </div>
              <div className="space-y-4">
                <CourseProgressCard 
                  title="Advanced Java Spring Boot"
                  instructor="Prof. John Maverick"
                  progress={65}
                  lesson="Lesson 12: REST API Security"
                  color="indigo"
                />
                <CourseProgressCard 
                  title="UI/UX Masterclass 2024"
                  instructor="Sarah Design"
                  progress={40}
                  lesson="Lesson 8: Prototyping in Figma"
                  color="purple"
                />
                <CourseProgressCard 
                  title="Data Science Fundamentals"
                  instructor="Dr. Michael Chen"
                  progress={85}
                  lesson="Lesson 18: Machine Learning Basics"
                  color="emerald"
                />
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-slate-900">Upcoming Assignments</h2>
                 <button className="text-sm font-bold text-indigo-600 hover:underline">View all</button>
              </div>
              <div className="space-y-4">
                <AssignmentCard 
                  title="Final Project: E-commerce API"
                  course="Advanced Java Spring Boot"
                  deadline="Apr 25, 2024"
                  timeLeft="5 days left"
                  status="pending"
                />
                <AssignmentCard 
                  title="Weekly Exercises #4"
                  course="Data Science Fundamentals"
                  deadline="Apr 20, 2024"
                  timeLeft="Due today"
                  status="urgent"
                />
                <AssignmentCard 
                  title="Design Portfolio Review"
                  course="UI/UX Masterclass 2024"
                  deadline="Apr 28, 2024"
                  timeLeft="8 days left"
                  status="pending"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study Streak */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold">7 Days</h3>
                    <p className="text-indigo-100 text-sm font-medium">Study Streak 🔥</p>
                  </div>
                </div>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Keep it up! You're on a roll. Complete today's lesson to maintain your streak.</p>
                <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition">
                   Continue Learning
                </button>
              </div>
              <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
            </div>

            {/* Upcoming Live Session */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-900">Live Session</h3>
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Advanced React Hooks</h4>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <Calendar size={14} />
                <span className="font-medium">Today, 3:00 PM</span>
              </div>
              <button className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800 transition text-sm">
                Join Session
              </button>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                <AchievementBadge title="Fast Learner" desc="Completed 5 courses" emoji="⚡" />
                <AchievementBadge title="Perfect Score" desc="100% on Java Quiz" emoji="🎯" />
                <AchievementBadge title="Early Bird" desc="7-day streak" emoji="🔥" />
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
    orange: 'bg-orange-50 text-orange-600'
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

const CourseProgressCard = ({ title, instructor, progress, lesson, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600'
  };

  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-500 font-medium">{instructor}</p>
        </div>
        <button className="p-2 bg-white rounded-xl border border-slate-100 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition group-hover:scale-110">
          <PlayCircle size={20} />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">{lesson}</span>
          <span className="font-bold text-slate-900">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${colorStyles[color]} transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const AssignmentCard = ({ title, course, deadline, timeLeft, status }) => {
  const statusStyles = {
    pending: 'bg-indigo-50 text-indigo-600',
    urgent: 'bg-red-50 text-red-600'
  };

  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-500 font-medium">{course}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusStyles[status]}`}>
          {timeLeft}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Clock size={14} />
        <span className="font-medium">Due: {deadline}</span>
      </div>
    </div>
  );
};

const AchievementBadge = ({ title, desc, emoji }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
    <div className="text-2xl">{emoji}</div>
    <div className="flex-1">
      <h5 className="text-sm font-bold text-slate-900">{title}</h5>
      <p className="text-xs text-slate-500 font-medium">{desc}</p>
    </div>
  </div>
);

export default StudentDashboard;
