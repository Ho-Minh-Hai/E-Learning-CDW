import { useState, useEffect, useCallback } from 'react';
import StudentLayout from './StudentLayout';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Clock, AlertCircle, Calendar,
  CheckCircle, ArrowRight, Bell
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const API_URL = 'http://localhost:8080/api';

const authFetch = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

const formatDeadline = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getDaysLeft = (iso) => {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
};

const getDeadlineLabel = (iso) => {
  const days = getDaysLeft(iso);
  if (days === null) return null;
  if (days < 0) return { text: 'Overdue', style: 'bg-red-100 text-red-600' };
  if (days === 0) return { text: 'Due today', style: 'bg-red-100 text-red-600' };
  if (days === 1) return { text: '1 day left', style: 'bg-orange-100 text-orange-600' };
  if (days <= 3) return { text: `${days} days left`, style: 'bg-orange-100 text-orange-600' };
  return { text: `${days} days left`, style: 'bg-slate-100 text-slate-600' };
};

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/posts?type=ASSIGNMENT`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setAssignments(data);
    } catch (err) {
      console.error('fetchAssignments error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('assignments-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchAssignments)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchAssignments]);

  const now = new Date();
  const upcoming = assignments.filter(a => a.deadline && new Date(a.deadline) > now);
  const overdue  = assignments.filter(a => a.deadline && new Date(a.deadline) <= now);
  const noDeadline = assignments.filter(a => !a.deadline);

  const filtered =
    filter === 'upcoming'   ? upcoming :
    filter === 'overdue'    ? overdue :
    filter === 'no-deadline' ? noDeadline :
    assignments;

  const tabs = [
    { key: 'all',         label: `All (${assignments.length})` },
    { key: 'upcoming',    label: `Upcoming (${upcoming.length})` },
    { key: 'overdue',     label: `Overdue (${overdue.length})` },
    { key: 'no-deadline', label: `Open (${noDeadline.length})` },
  ];

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
            <p className="text-slate-500 mt-1">All assignments posted by your instructors.</p>
          </div>
          <Link
            to="/posts"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 w-fit"
          >
            <Bell size={18} />
            Class Feed
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBadge label="Total"    value={assignments.length} color="indigo" />
          <StatBadge label="Upcoming" value={upcoming.length}    color="emerald" />
          <StatBadge label="Overdue"  value={overdue.length}     color="red" />
          <StatBadge label="Open"     value={noDeadline.length}  color="slate" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${
                filter === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No assignments here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(post => {
              const deadlineLabel = getDeadlineLabel(post.deadline);
              const urgent = getDaysLeft(post.deadline) !== null && getDaysLeft(post.deadline) <= 1;

              return (
                <div
                  key={post.id}
                  className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all ${
                    urgent ? 'border-red-200' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-red-100' : 'bg-orange-50'}`}>
                      <ClipboardList className={`w-6 h-6 ${urgent ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h4 className="font-bold text-slate-900">{post.title}</h4>
                        {deadlineLabel && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${deadlineLabel.style}`}>
                            {deadlineLabel.text}
                          </span>
                        )}
                      </div>

                      {post.content && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{post.content}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        {post.deadline ? (
                          <div className="flex items-center gap-1.5">
                            {urgent ? <AlertCircle size={14} className="text-red-500" /> : <Calendar size={14} />}
                            <span className={`font-medium ${urgent ? 'text-red-600' : ''}`}>
                              Due: {formatDeadline(post.deadline)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span className="font-medium">No deadline</span>
                          </div>
                        )}
                        <span className="text-slate-300">·</span>
                        <span className="font-medium">Posted by {post.author?.fullName || 'Instructor'}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <Link to="/posts" className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition shrink-0">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

const StatBadge = ({ label, value, color }) => {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red:    'bg-red-50 text-red-700',
    slate:  'bg-slate-100 text-slate-700',
  };
  return (
    <div className={`p-5 rounded-2xl border border-transparent ${styles[color]}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <h4 className="text-3xl font-extrabold">{value}</h4>
    </div>
  );
};

export default StudentAssignments;
