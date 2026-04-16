import React from 'react';
import Dashboard from '../dashboard/Dashboard';
import { Trophy, TrendingUp, AlertCircle, CheckCircle2, Award, Search, Filter } from 'lucide-react';

const EvaluationStats = () => {
  return (
    <Dashboard>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tracking & Evaluation</h1>
              <p className="text-slate-500 mt-1">Deep analysis of student performance and submission status.</p>
           </div>
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm">
                Export Data
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                Create Online Contest
             </button>
           </div>
        </div>

        {/* Evaluation Summary Cards */}
        <div className="grid md:grid-cols-3 gap-8">
           <EvalSummaryCard 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            label="Avg. Class Score" 
            value="8.4" 
            sub="Across all courses" 
           />
           <EvalSummaryCard 
            icon={<TrendingUp className="text-indigo-500" />} 
            label="On-time Submissions" 
            value="92%" 
            sub="+5% from last month" 
           />
           <EvalSummaryCard 
            icon={<AlertCircle className="text-orange-500" />} 
            label="Late Submissions" 
            value="8" 
            sub="Requires your attention" 
           />
        </div>

        {/* Detailed Performance Table (Mockup) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900">Student Leaderboard</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" placeholder="Filter student..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><Filter size={18} className="text-slate-500" /></button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Completed Tasks</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Avg. Score</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 <StudentRow rank="01" name="Sarah Jenkins" tasks="12/12" score="9.8" status="Excellent" />
                 <StudentRow rank="02" name="Michael Chen" tasks="11/12" score="9.2" status="Excellent" />
                 <StudentRow rank="03" name="Amanda Ross" tasks="12/12" score="8.9" status="Great" />
                 <StudentRow rank="04" name="David Miller" tasks="10/12" score="7.5" status="Average" />
               </tbody>
             </table>
           </div>
           <div className="p-8 text-center border-t border-slate-100">
             <button className="text-sm font-bold text-indigo-600 hover:underline">View Loadings More...</button>
           </div>
        </div>

        {/* Submission Analysis (Mockup Visual) */}
        <div className="grid lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
             <h3 className="text-xl font-bold text-slate-900 mb-8">Score Distribution</h3>
             <div className="h-64 flex items-end justify-between gap-4 px-4 pb-2 border-b border-slate-100">
                {[40, 65, 85, 95, 75, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-50 rounded-t-xl relative group cursor-pointer hover:bg-indigo-600 transition-all" style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </div>
                  </div>
                ))}
             </div>
             <div className="flex justify-between mt-4 text-xs font-bold text-slate-400">
               <span>Week 1</span>
               <span>Week 2</span>
               <span>Week 3</span>
               <span>Week 4</span>
               <span>Week 5</span>
               <span>Week 6</span>
             </div>
           </div>

           <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Trophy className="text-white w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold">Monthly Top Teacher</h3>
              </div>
              <p className="text-indigo-100 mb-8 leading-relaxed">Congratulations! You've reached the top 5% of instructors based on student engagement and satisfaction scores.</p>
              <div className="flex items-center gap-6">
                 <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                    <span className="text-xs font-bold text-indigo-200 block mb-1">Total Impact</span>
                    <span className="text-2xl font-black">2.4k Students</span>
                 </div>
                 <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                    <span className="text-xs font-bold text-indigo-200 block mb-1">Global Rank</span>
                    <span className="text-2xl font-black">#124</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Dashboard>
  );
};

const EvalSummaryCard = ({ icon, label, value, sub }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-inner">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 leading-none mb-1">{value}</h4>
      <p className="text-xs font-bold text-slate-400">{sub}</p>
    </div>
  </div>
);

const StudentRow = ({ rank, name, tasks, score, status }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="px-8 py-5 font-bold text-slate-400 group-hover:text-indigo-600">{rank}</td>
    <td className="px-8 py-5 font-bold text-slate-900">{name}</td>
    <td className="px-8 py-5 text-sm font-bold text-slate-500">{tasks}</td>
    <td className="px-8 py-5 text-sm font-black text-slate-900">{score}</td>
    <td className="px-8 py-5 text-sm">
      <span className={`px-3 py-1.5 rounded-lg font-bold ${
        status === 'Excellent' ? 'bg-indigo-50 text-indigo-600' :
        status === 'Great' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
      }`}>{status}</span>
    </td>
  </tr>
);

export default EvaluationStats;
