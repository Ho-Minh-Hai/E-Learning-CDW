import React from 'react';
import Dashboard from '../dashboard/Dashboard';
import { Plus, PlayCircle, FileText, Users, Clock, ArrowUpRight } from 'lucide-react';

const CourseManagement = () => {
  return (
    <Dashboard>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Course Management</h1>
              <p className="text-slate-500 mt-1">Design, manage and monitor your educational content.</p>
           </div>
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                <Plus size={18} />
                Create New Class
             </button>
           </div>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           <CourseCard 
             title="Advanced Java Spring Boot" 
             students="42 Students" 
             lessons="18 Lessons"
             status="Active"
             color="indigo"
           />
           <CourseCard 
             title="UI/UX Masterclass 2024" 
             students="156 Students" 
             lessons="24 Lessons"
             status="Archived"
             color="purple"
           />
           <CourseCard 
             title="Data Science Fundamentals" 
             students="89 Students" 
             lessons="12 Lessons"
             status="Published"
             color="emerald"
           />
        </div>

        {/* Content Tabs (Mockup) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="flex border-b border-slate-100 px-8">
             {['Overview', 'Lessons', 'Assignments', 'Students', 'Settings'].map((tab, i) => (
               <button key={tab} className={`px-6 py-6 font-bold text-sm transition-colors border-b-2 ${i === 0 ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                 {tab}
               </button>
             ))}
           </div>
           
           <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Current Assignments</h3>
                <button className="flex items-center gap-2 text-sm font-extrabold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition">
                  <Plus size={16} />
                   New Assignment
                </button>
              </div>

              <div className="space-y-4">
                <AssignmentRow 
                  title="Final Project: E-commerce API" 
                  deadline="Apr 25, 2024 (11:59 PM)" 
                  submissions="38/42" 
                  status="In Progress"
                />
                <AssignmentRow 
                  title="Midterm Quiz: Database Design" 
                  deadline="Apr 18, 2024 (10:00 AM)" 
                  submissions="42/42" 
                  status="Completed"
                />
                <AssignmentRow 
                  title="Weekly Exercises #4" 
                  deadline="Apr 20, 2024 (06:00 PM)" 
                  submissions="12/42" 
                  status="Late Allowed"
                />
              </div>
           </div>
        </div>
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

const AssignmentRow = ({ title, deadline, submissions, status }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition duration-300 shadow-sm">
        <FileText className="w-6 h-6 text-slate-600" />
      </div>
      <div>
        <h5 className="font-bold text-slate-900">{title}</h5>
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
             <Clock size={12} />
             <span>Deadline: {deadline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
             <Users size={12} />
             <span>Submissions: {submissions}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-4 sm:mt-0">
      <span className={`text-xs font-extrabold px-3 py-1.5 rounded-lg ${
        status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
        status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

export default CourseManagement;
