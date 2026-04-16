import React from 'react';
import Dashboard from '../dashboard/Dashboard';
import { Send, Hash, Users, Bell, Search, Video, Phone, Info, MoreVertical, Smile } from 'lucide-react';

const RealtimeChat = () => {
  return (
    <Dashboard>
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
           <div className="p-6 border-b border-slate-100">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Messages</h2>
                <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><MoreVertical size={16} /></button>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input type="text" placeholder="Jump to..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" />
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-8">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Channels</p>
                <div className="space-y-1">
                   <ChannelLink label="java-general" active />
                   <ChannelLink label="project-group-a" />
                   <ChannelLink label="announcements" />
                   <ChannelLink label="help-desk" />
                </div>
             </div>

             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Direct Messages</p>
                <div className="space-y-2">
                   <UserDM name="Sarah Jenkins" status="online" />
                   <UserDM name="Michael Chen" status="offline" />
                   <UserDM name="Alex Rivera" status="online" msg="Thanks for the tip!" />
                   <UserDM name="Bot Assistant" status="away" msg="Deadline at 12 PM" />
                </div>
             </div>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <header className="h-20 border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                  <Hash size={20} />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 text-lg">java-general</h3>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Users size={12} />
                      <span>156 members</span>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"><Video size={20} /></button>
                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"><Phone size={20} /></button>
                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"><Info size={20} /></button>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
             <ChatMessage 
                user="Sarah Jenkins" 
                time="10:30 AM" 
                text="Has anyone started the Spring Security assignment yet? I'm having trouble with the JWT filtering part." 
                avatar="bg-orange-500"
             />
             <ChatMessage 
                user="Michael Chen" 
                time="10:32 AM" 
                text="Yeah, I found a great resource on the course site. Check the Lecture 12 supplementary materials." 
                avatar="bg-indigo-500"
             />
             <ChatMessage 
                user="Professor John Maverick" 
                time="10:45 AM" 
                text="Don't forget the deadline for Project 1 is today at 11:59 PM. I've sent a global remainder as well." 
                avatar="bg-slate-900" 
                isTeacher
             />
          </div>

          <footer className="p-6 shrink-0 border-t border-slate-100">
             <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-2 flex items-end gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <button className="p-3 text-slate-400 hover:text-indigo-600"><Smile size={20} /></button>
                <textarea 
                  rows="1" 
                  placeholder="Message #java-general" 
                  className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 resize-none text-sm font-medium"
                ></textarea>
                <button className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                   <Send size={18} />
                </button>
             </div>
          </footer>
        </div>
      </div>
    </Dashboard>
  );
};

const ChannelLink = ({ label, active }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition font-bold text-sm ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
     <Hash size={16} className={active ? 'text-white/70' : 'text-slate-300'} />
     <span>{label}</span>
  </button>
);

const UserDM = ({ name, status, msg }) => (
  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition group overflow-hidden">
     <div className="relative">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-100 shrink-0" />
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${status === 'online' ? 'bg-emerald-500' : status === 'away' ? 'bg-orange-500' : 'bg-slate-300'}`} />
     </div>
     <div className="text-left min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
        <p className="text-xs font-bold text-slate-400 truncate mt-0.5">{msg || status}</p>
     </div>
  </button>
);

const ChatMessage = ({ user, time, text, avatar, isTeacher }) => (
  <div className="flex gap-4 group">
     <div className={`w-12 h-12 rounded-2xl ${avatar} shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-xs`}>
        {user.split(' ').map(n=>n[0]).join('')}
     </div>
     <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
           <span className={`text-sm font-black text-slate-900 ${isTeacher ? 'text-indigo-600' : ''}`}>{user}</span>
           {isTeacher && <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">Teacher</span>}
           <span className="text-[11px] font-bold text-slate-400">{time}</span>
        </div>
        <div className={`p-5 rounded-2xl text-sm leading-relaxed border ${isTeacher ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
           {text}
        </div>
     </div>
  </div>
);

export default RealtimeChat;
