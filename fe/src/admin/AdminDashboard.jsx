import React from 'react';
import Dashboard from '../dashboard/Dashboard';
import { Shield, Users, Server, Activity, Lock, Unlock, Eye, Trash2, Settings, Download } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <Dashboard>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
              <p className="text-slate-500 mt-1">Global control and monitoring center.</p>
           </div>
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm">
                System Logs
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                <Settings size={18} />
                Global Config
             </button>
           </div>
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <HealthCard title="Server CPU" value="24%" status="healthy" />
           <HealthCard title="Memory Usage" value="1.2GB/4GB" status="healthy" />
           <HealthCard title="Active Connections" value="1,842" status="warning" />
           <HealthCard title="DB Queries/s" value="480" status="healthy" />
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <h3 className="text-xl font-bold text-slate-900">User Management</h3>
                 <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase">Total: 4.8k</span>
              </div>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100">Students</button>
                 <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs">Instructors</button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">User</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Role</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Join Date</th>
                   <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                 <AdminUserRow name="Prof. John Maverick" email="john@eduflow.com" role="Admin/Teacher" status="active" date="Jan 12, 2024" />
                 <AdminUserRow name="Sarah Jenkins" email="s.jenkins@stu.com" role="Student" status="blocked" date="Feb 05, 2024" />
                 <AdminUserRow name="Michael Chen" email="m.chen88@gmail.com" role="Student" status="active" date="Mar 20, 2024" />
                 <AdminUserRow name="Amanda Ross" email="amanda.r@edu.net" role="Teacher" status="active" date="Apr 01, 2024" />
               </tbody>
             </table>
           </div>
        </div>

        {/* Global Statistics Visual */}
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-slate-900 font-sans">Revenue & Enrollment Growth</h3>
                 <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"><Download size={20} /></button>
              </div>
              <div className="h-64 flex items-end justify-between gap-1">
                 {Array.from({length: 24}).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-t-sm transition-all duration-300 hover:scale-110 cursor-pointer ${i % 2 === 0 ? 'bg-indigo-600' : 'bg-slate-200'}`} style={{ height: `${1 * 80 + 20}%` }}></div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <Shield className="text-indigo-400 w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold">Security Alert</h3>
              </div>
              <div className="flex-1 space-y-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">Recent Threat</p>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed">Attempted SQL Injection blocked from IP: 192.168.1.1</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">SSL Certificate</p>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed">Expires in 14 days. Auto-renew enabled.</p>
                 </div>
              </div>
              <button className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/40">
                 Run Full System Audit
              </button>
           </div>
        </div>
      </div>
    </Dashboard>
  );
};

const HealthCard = ({ title, value, status }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={`w-2 h-2 rounded-full ring-4 ${status === 'healthy' ? 'bg-emerald-500 ring-emerald-50' : 'bg-orange-500 ring-orange-50'}`} />
    </div>
    <div className="flex items-end justify-between">
      <h4 className="text-2xl font-black text-slate-900 leading-none">{value}</h4>
      <Activity size={20} className="text-slate-100" />
    </div>
  </div>
);

const AdminUserRow = ({ name, email, role, status, date }) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className="px-8 py-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-100 shrink-0" />
        <div>
           <p className="font-bold text-slate-900">{name}</p>
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{email}</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-5">
       <span className="font-bold text-slate-600">{role}</span>
    </td>
    <td className="px-8 py-5">
       <div className="flex items-center gap-2">
          {status === 'active' ? (
             <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black">
                <Unlock size={12} /> ACTIVE
             </span>
          ) : (
             <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-black">
                <Lock size={12} /> BLOCKED
             </span>
          )}
       </div>
    </td>
    <td className="px-8 py-5 text-slate-500 font-bold">{date}</td>
    <td className="px-8 py-5 text-right">
       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Eye size={18} /></button>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
       </div>
    </td>
  </tr>
);

export default AdminDashboard;
