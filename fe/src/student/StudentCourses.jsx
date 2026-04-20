import React, { useState } from 'react';
import StudentLayout from './StudentLayout';
import { BookOpen, PlayCircle, Clock, CheckCircle, Star, Users, Filter } from 'lucide-react';

const StudentCourses = () => {
  const [activeTab, setActiveTab] = useState('enrolled');

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
              <p className="text-slate-500 mt-1">Manage and track your enrolled courses.</p>
           </div>
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">
                <Filter size={18} />
                Filter
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                <BookOpen size={18} />
                Browse All Courses
             </button>
           </div>
        </div>

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
              {tab === 'enrolled' && 'Enrolled (6)'}
              {tab === 'completed' && 'Completed (12)'}
              {tab === 'saved' && 'Saved (4)'}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {activeTab === 'enrolled' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EnrolledCourseCard 
              title="Advanced Java Spring Boot"
              instructor="Prof. John Maverick"
              progress={65}
              totalLessons={18}
              completedLessons={12}
              thumbnail="indigo"
              rating={4.8}
            />
            <EnrolledCourseCard 
              title="UI/UX Masterclass 2024"
              instructor="Sarah Design"
              progress={40}
              totalLessons={24}
              completedLessons={10}
              thumbnail="purple"
              rating={4.9}
            />
            <EnrolledCourseCard 
              title="Data Science Fundamentals"
              instructor="Dr. Michael Chen"
              progress={85}
              totalLessons={20}
              completedLessons={17}
              thumbnail="emerald"
              rating={4.7}
            />
            <EnrolledCourseCard 
              title="Mobile App Development"
              instructor="Alex Johnson"
              progress={25}
              totalLessons={16}
              completedLessons={4}
              thumbnail="orange"
              rating={4.6}
            />
            <EnrolledCourseCard 
              title="Cloud Computing with AWS"
              instructor="Maria Garcia"
              progress={50}
              totalLessons={22}
              completedLessons={11}
              thumbnail="blue"
              rating={4.8}
            />
            <EnrolledCourseCard 
              title="Digital Marketing Strategy"
              instructor="David Lee"
              progress={70}
              totalLessons={15}
              completedLessons={11}
              thumbnail="pink"
              rating={4.5}
            />
          </div>
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
