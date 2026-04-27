import React, { useState } from 'react';
import Dashboard from '../dashboard/Dashboard';
import { 
  Plus, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  FileText,
  Video,
  Award,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  Star
} from 'lucide-react';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Dashboard>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Instructor Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your courses and track student progress</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm">
              <Calendar size={18} />
              Schedule
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              <Plus size={18} />
              Create Course
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            icon={<BookOpen className="w-6 h-6" />}
            title="Total Courses"
            value="12"
            change="+2 this month"
            color="indigo"
            trend="up"
          />
          <StatsCard 
            icon={<Users className="w-6 h-6" />}
            title="Active Students"
            value="1,284"
            change="+156 this week"
            color="emerald"
            trend="up"
          />
          <StatsCard 
            icon={<TrendingUp className="w-6 h-6" />}
            title="Completion Rate"
            value="84%"
            change="+4.2% vs last month"
            color="purple"
            trend="up"
          />
          <StatsCard 
            icon={<Star className="w-6 h-6" />}
            title="Avg. Rating"
            value="4.9"
            change="From 2,847 reviews"
            color="orange"
            trend="stable"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Courses Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">My Courses</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage and monitor your active courses</p>
                </div>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowUpRight size={16} />
                </button>
              </div>
              
              <div className="p-8 space-y-4">
                <CourseRow 
                  title="Advanced Java Spring Boot"
                  students={42}
                  progress={78}
                  status="Active"
                  color="indigo"
                />
                <CourseRow 
                  title="UI/UX Design Masterclass"
                  students={156}
                  progress={92}
                  status="Active"
                  color="purple"
                />
                <CourseRow 
                  title="Data Science Fundamentals"
                  students={89}
                  progress={45}
                  status="In Progress"
                  color="emerald"
                />
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Recent Activities</h3>
                <p className="text-sm text-slate-500 mt-1">Latest updates from your courses</p>
              </div>
              
              <div className="p-8 space-y-6">
                <ActivityItem 
                  icon={<FileText className="w-5 h-5" />}
                  title="New Assignment Submission"
                  description="Sarah Jenkins submitted 'Final Project: E-commerce API'"
                  time="5 minutes ago"
                  color="indigo"
                />
                <ActivityItem 
                  icon={<MessageSquare className="w-5 h-5" />}
                  title="New Question Posted"
                  description="Michael Chen asked about React Hooks in 'Advanced React' course"
                  time="1 hour ago"
                  color="purple"
                />
                <ActivityItem 
                  icon={<CheckCircle className="w-5 h-5" />}
                  title="Course Completed"
                  description="Amanda Ross completed 'UI/UX Design Masterclass'"
                  time="3 hours ago"
                  color="emerald"
                />
                <ActivityItem 
                  icon={<Star className="w-5 h-5" />}
                  title="New Review"
                  description="John Doe rated 'Java Spring Boot' 5 stars"
                  time="5 hours ago"
                  color="orange"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Schedule */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Today's Schedule</h3>
                    <p className="text-indigo-100 text-sm">Monday, Apr 27</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <ScheduleItem 
                    time="10:00 AM"
                    title="Java Spring Boot - Lecture"
                    students="42 students"
                  />
                  <ScheduleItem 
                    time="02:00 PM"
                    title="UI/UX Design - Workshop"
                    students="156 students"
                  />
                  <ScheduleItem 
                    time="04:30 PM"
                    title="Office Hours"
                    students="Open session"
                  />
                </div>
                
                <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition">
                  View Full Calendar
                </button>
              </div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Pending Tasks</h3>
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg">
                    12 Tasks
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <TaskItem 
                  title="Grade Assignments"
                  count="8 submissions"
                  priority="high"
                />
                <TaskItem 
                  title="Review Questions"
                  count="5 pending"
                  priority="medium"
                />
                <TaskItem 
                  title="Update Course Content"
                  count="2 courses"
                  priority="low"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-6">This Month</h3>
              <div className="space-y-6">
                <QuickStat 
                  icon={<Video className="w-5 h-5" />}
                  label="Live Sessions"
                  value="24"
                />
                <QuickStat 
                  icon={<FileText className="w-5 h-5" />}
                  label="Assignments Created"
                  value="18"
                />
                <QuickStat 
                  icon={<Award className="w-5 h-5" />}
                  label="Certificates Issued"
                  value="156"
                />
                <QuickStat 
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Messages Replied"
                  value="342"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

// Stats Card Component
const StatsCard = ({ icon, title, value, change, color, trend }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          {icon}
        </div>
        {trend === 'up' && (
          <div className="flex items-center gap-1 text-emerald-600">
            <TrendingUp size={16} />
          </div>
        )}
      </div>
      <h4 className="text-2xl font-extrabold text-slate-900 mb-1">{value}</h4>
      <p className="text-sm font-bold text-slate-500 mb-2">{title}</p>
      <p className="text-xs text-slate-400 font-medium">{change}</p>
    </div>
  );
};

// Course Row Component
const CourseRow = ({ title, students, progress, status, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600'
  };

  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group">
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-12 h-12 ${colorStyles[color]} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h5 className="font-bold text-slate-900 mb-1">{title}</h5>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users size={12} />
              <span className="font-bold">{students} students</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">{progress}%</p>
          <p className="text-xs text-slate-500">Progress</p>
        </div>
        <div className="w-16 h-16">
          <svg className="transform -rotate-90" width="64" height="64">
            <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="6" fill="none" />
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              stroke={color === 'indigo' ? '#4f46e5' : color === 'purple' ? '#9333ea' : '#10b981'} 
              strokeWidth="6" 
              fill="none"
              strokeDasharray={`${progress * 1.76} 176`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ icon, title, description, time, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-xl ${colorStyles[color]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <h5 className="text-sm font-bold text-slate-900">{title}</h5>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
        <span className="text-xs text-slate-400 font-medium mt-2 block">{time}</span>
      </div>
    </div>
  );
};

// Schedule Item Component
const ScheduleItem = ({ time, title, students }) => (
  <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-bold text-indigo-200">{time}</span>
      <Clock className="w-4 h-4 text-indigo-200" />
    </div>
    <h5 className="text-sm font-bold text-white mb-1">{title}</h5>
    <p className="text-xs text-indigo-100">{students}</p>
  </div>
);

// Task Item Component
const TaskItem = ({ title, count, priority }) => {
  const priorityStyles = {
    high: 'bg-red-50 text-red-600',
    medium: 'bg-orange-50 text-orange-600',
    low: 'bg-slate-50 text-slate-600'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-orange-500' : 'bg-slate-400'}`} />
        <div>
          <h5 className="text-sm font-bold text-slate-900">{title}</h5>
          <p className="text-xs text-slate-500 mt-0.5">{count}</p>
        </div>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${priorityStyles[priority]}`}>
        {priority}
      </span>
    </div>
  );
};

// Quick Stat Component
const QuickStat = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="text-slate-400">
        {icon}
      </div>
      <span className="text-sm text-slate-300 font-medium">{label}</span>
    </div>
    <span className="text-lg font-bold text-white">{value}</span>
  </div>
);

export default InstructorDashboard;
