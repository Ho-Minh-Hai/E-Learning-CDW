import React, { useState } from 'react';
import StudentLayout from './StudentLayout';
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Calendar } from 'lucide-react';

const StudentAssignments = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Assignments</h1>
              <p className="text-slate-500 mt-1">Track and submit your course assignments.</p>
           </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <QuickStat title="Pending" value="5" color="indigo" />
          <QuickStat title="Submitted" value="18" color="emerald" />
          <QuickStat title="Graded" value="15" color="purple" />
          <QuickStat title="Overdue" value="1" color="red" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {['pending', 'submitted', 'graded'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold text-sm capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Assignment List */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <PendingAssignmentCard 
              title="Final Project: E-commerce API"
              course="Advanced Java Spring Boot"
              deadline="Apr 25, 2024 11:59 PM"
              daysLeft={5}
              points={100}
              description="Build a complete REST API for an e-commerce platform with authentication, product management, and order processing."
            />
            <PendingAssignmentCard 
              title="Weekly Exercises #4"
              course="Data Science Fundamentals"
              deadline="Apr 20, 2024 06:00 PM"
              daysLeft={0}
              points={50}
              description="Complete exercises on data visualization using matplotlib and seaborn."
              urgent={true}
            />
            <PendingAssignmentCard 
              title="Design Portfolio Review"
              course="UI/UX Masterclass 2024"
              deadline="Apr 28, 2024 11:59 PM"
              daysLeft={8}
              points={80}
              description="Submit your complete design portfolio with at least 3 case studies."
            />
          </div>
        )}

        {activeTab === 'submitted' && (
          <div className="space-y-4">
            <SubmittedAssignmentCard 
              title="Midterm Quiz: Database Design"
              course="Advanced Java Spring Boot"
              submittedDate="Apr 18, 2024 09:45 AM"
              points={100}
              status="grading"
            />
            <SubmittedAssignmentCard 
              title="React Component Library"
              course="UI/UX Masterclass 2024"
              submittedDate="Apr 15, 2024 03:20 PM"
              points={75}
              status="grading"
            />
            <SubmittedAssignmentCard 
              title="Data Analysis Report"
              course="Data Science Fundamentals"
              submittedDate="Apr 12, 2024 11:30 AM"
              points={60}
              status="grading"
            />
          </div>
        )}

        {activeTab === 'graded' && (
          <div className="space-y-4">
            <GradedAssignmentCard 
              title="Spring Boot Authentication System"
              course="Advanced Java Spring Boot"
              submittedDate="Apr 10, 2024"
              gradedDate="Apr 12, 2024"
              score={95}
              maxScore={100}
              feedback="Excellent implementation! Your code is clean and well-documented. Consider adding rate limiting for production."
            />
            <GradedAssignmentCard 
              title="Figma Prototype Design"
              course="UI/UX Masterclass 2024"
              submittedDate="Apr 08, 2024"
              gradedDate="Apr 10, 2024"
              score={88}
              maxScore={100}
              feedback="Great work on the user flow. The color scheme could be improved for better accessibility."
            />
            <GradedAssignmentCard 
              title="Python Data Cleaning Exercise"
              course="Data Science Fundamentals"
              submittedDate="Apr 05, 2024"
              gradedDate="Apr 07, 2024"
              score={92}
              maxScore={100}
              feedback="Well done! Your approach to handling missing data was very thorough."
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

const QuickStat = ({ title, value, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      <h4 className={`text-3xl font-extrabold ${colorStyles[color]}`}>{value}</h4>
    </div>
  );
};

const PendingAssignmentCard = ({ title, course, deadline, daysLeft, points, description, urgent }) => (
  <div className={`bg-white p-6 rounded-2xl border ${urgent ? 'border-red-200 bg-red-50/30' : 'border-slate-100'} shadow-sm hover:shadow-lg transition-all`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${urgent ? 'bg-red-100' : 'bg-indigo-50'}`}>
          <FileText className={`w-6 h-6 ${urgent ? 'text-red-600' : 'text-indigo-600'}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-500 font-medium mb-2">{course}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
      </div>
      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${urgent ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
        {points} pts
      </span>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Clock size={16} />
          <span className="font-medium">Due: {deadline}</span>
        </div>
        {urgent ? (
          <span className="flex items-center gap-1 text-red-600 font-bold">
            <AlertCircle size={16} />
            Due today!
          </span>
        ) : (
          <span className="text-slate-500 font-medium">{daysLeft} days left</span>
        )}
      </div>
      <button className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition ${urgent ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
        <Upload size={16} />
        Submit
      </button>
    </div>
  </div>
);

const SubmittedAssignmentCard = ({ title, course, submittedDate, points, status }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-500 font-medium">{course}</p>
        </div>
      </div>
      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
        {points} pts
      </span>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Calendar size={16} />
        <span className="font-medium">Submitted: {submittedDate}</span>
      </div>
      <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold">
        Grading in progress...
      </span>
    </div>
  </div>
);

const GradedAssignmentCard = ({ title, course, submittedDate, gradedDate, score, maxScore, feedback }) => {
  const percentage = (score / maxScore) * 100;
  const gradeColor = percentage >= 90 ? 'emerald' : percentage >= 80 ? 'indigo' : percentage >= 70 ? 'orange' : 'red';
  
  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorStyles[gradeColor]}`}>
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
            <p className="text-sm text-slate-500 font-medium mb-3">{course}</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Instructor Feedback</p>
              <p className="text-sm text-slate-700 leading-relaxed">{feedback}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-extrabold ${colorStyles[gradeColor]} mb-1`}>
            {score}/{maxScore}
          </div>
          <span className="text-xs text-slate-500 font-bold">{percentage.toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span className="font-medium">Submitted: {submittedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} />
          <span className="font-medium">Graded: {gradedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
