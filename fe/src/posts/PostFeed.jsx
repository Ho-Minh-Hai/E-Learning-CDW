import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import Dashboard from '../dashboard/Dashboard';
import StudentLayout from '../student/StudentLayout';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../context/AuthContext';
import {
  Bell, FileText, ClipboardList, Plus, X, Upload,
  Calendar, Trash2, AlertCircle, BookOpen, Megaphone
} from 'lucide-react';

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

// ── Post type config ──────────────────────────────────────────────────────────
const POST_TYPES = {
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: Megaphone,
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    iconColor: 'text-indigo-600',
    dot: 'bg-indigo-500',
  },
  DOCUMENT: {
    label: 'Document',
    icon: FileText,
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  ASSIGNMENT: {
    label: 'Assignment',
    icon: ClipboardList,
    color: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    iconColor: 'text-orange-600',
    dot: 'bg-orange-500',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Accepted file types
const ACCEPTED_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg';

// Upload a file to Supabase Storage and return { fileUrl, fileName }
const uploadToStorage = async (file) => {
  const ext = file.name.split('.').pop();
  const path = `posts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('post-files')
    .upload(path, file, { upsert: false });
  if (error) {
    if (error.message?.toLowerCase().includes('bucket')) {
      throw new Error(
        'Storage bucket "post-files" not found. Please run the setup SQL in Supabase SQL Editor first, or use "Use URL instead" to paste a link.'
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
  const { data: urlData } = supabase.storage.from('post-files').getPublicUrl(data.path);
  return { fileUrl: urlData.publicUrl, fileName: file.name };
};

// ── Create post modal ─────────────────────────────────────────────────────────
const CreatePostModal = ({ onClose, onCreated, authorId }) => {
  const [postType, setPostType] = useState('ANNOUNCEMENT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');

  // File state — used for both DOCUMENT and ASSIGNMENT attachment
  const [file, setFile] = useState(null);           // File object from input
  const [fileUrl, setFileUrl] = useState('');        // Manual URL fallback
  const [useManualUrl, setUseManualUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const cfg = POST_TYPES[postType];
  const Icon = cfg.icon;

  const hasFileSection = postType === 'DOCUMENT' || postType === 'ASSIGNMENT';

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 50 * 1024 * 1024) {
      setError('File size must be under 50 MB.');
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.size > 50 * 1024 * 1024) { setError('File size must be under 50 MB.'); return; }
      setFile(dropped);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (postType === 'ASSIGNMENT' && !deadline) { setError('Please select a deadline.'); return; }
    if (postType === 'DOCUMENT' && !file && !fileUrl.trim()) {
      setError('Please attach a file or provide a URL.'); return;
    }

    setSubmitting(true);
    setError('');

    let resolvedFileUrl = '';
    let resolvedFileName = '';

    try {
      // Upload file if one was selected
      if (file && !useManualUrl) {
        setUploading(true);
        setUploadProgress('Uploading file...');
        const result = await uploadToStorage(file);
        resolvedFileUrl = result.fileUrl;
        resolvedFileName = result.fileName;
        setUploading(false);
        setUploadProgress('');
      } else if (useManualUrl && fileUrl.trim()) {
        resolvedFileUrl = fileUrl.trim();
        resolvedFileName = fileUrl.trim().split('/').pop() || 'Document';
      }

      const body = {
        postType,
        title: title.trim(),
        content: content.trim(),
        authorId,
        fileUrl: resolvedFileUrl || null,
        fileName: resolvedFileName || null,
        deadline: postType === 'ASSIGNMENT' && deadline
          ? new Date(deadline).toISOString()
          : null,
      };

      const res = await authFetch(`${API_URL}/posts`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create post');
      }

      const created = await res.json();
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setUploadProgress('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${cfg.bg} border-b ${cfg.border} shrink-0`}>
          <div className="flex items-center gap-2">
            <Icon size={20} className={cfg.iconColor} />
            <h2 className="font-bold text-slate-800">Create New Post</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Post type selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Post Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(POST_TYPES).map(([type, c]) => {
                const TIcon = c.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setPostType(type); setFile(null); setFileUrl(''); setError(''); }}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition text-xs font-semibold ${
                      postType === type
                        ? `${c.bg} ${c.border} ${c.iconColor}`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <TIcon size={18} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`Enter ${POST_TYPES[postType].label.toLowerCase()} title...`}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={3}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Add more details..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition resize-none"
            />
          </div>

          {/* File attachment — DOCUMENT or ASSIGNMENT */}
          {hasFileSection && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              postType === 'DOCUMENT' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className={`flex items-center justify-between`}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                  postType === 'DOCUMENT' ? 'text-emerald-700' : 'text-orange-700'
                }`}>
                  <Upload size={14} />
                  {postType === 'DOCUMENT' ? 'Attach File' : 'Attach Reference File (optional)'}
                </div>
                {/* Toggle: upload vs URL */}
                <button
                  type="button"
                  onClick={() => { setUseManualUrl(v => !v); setFile(null); setFileUrl(''); }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 underline"
                >
                  {useManualUrl ? 'Upload file instead' : 'Use URL instead'}
                </button>
              </div>

              {!useManualUrl ? (
                /* Drag & drop zone */
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                    file
                      ? 'border-emerald-400 bg-white'
                      : postType === 'DOCUMENT'
                        ? 'border-emerald-300 hover:border-emerald-400 bg-white/60'
                        : 'border-orange-300 hover:border-orange-400 bg-white/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {file ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={18} className="text-emerald-600 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 truncate">{file.name}</span>
                        <span className="text-xs text-slate-400 shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Drop file here or click to browse</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, PPT, images, ZIP · Max 50 MB</p>
                    </>
                  )}
                </div>
              ) : (
                /* Manual URL input */
                <input
                  type="url"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  placeholder="Paste file URL (Google Drive, OneDrive, Dropbox...)"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-white transition ${
                    postType === 'DOCUMENT'
                      ? 'border-emerald-200 focus:ring-emerald-200'
                      : 'border-orange-200 focus:ring-orange-200'
                  }`}
                />
              )}

              {/* Upload progress */}
              {uploading && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  {uploadProgress}
                </div>
              )}
            </div>
          )}

          {/* Deadline — ASSIGNMENT only */}
          {postType === 'ASSIGNMENT' && (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
                <Calendar size={14} />
                Submission Deadline *
              </div>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white transition"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-200">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                postType === 'ANNOUNCEMENT' ? 'bg-indigo-600 hover:bg-indigo-700' :
                postType === 'DOCUMENT' ? 'bg-emerald-600 hover:bg-emerald-700' :
                'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {uploading ? 'Uploading...' : submitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Post card ─────────────────────────────────────────────────────────────────
const PostCard = ({ post, currentUserId, onDelete }) => {
  const cfg = POST_TYPES[post.postType] || POST_TYPES.ANNOUNCEMENT;
  const Icon = cfg.icon;
  const isOwner = post.author?.id === currentUserId;

  return (
    <div className={`bg-white rounded-2xl border ${cfg.border} shadow-sm overflow-hidden`}>
      {/* Top stripe */}
      <div className={`h-1 ${cfg.dot}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
              <Icon size={12} />
              {cfg.label}
            </span>
            <h3 className="text-sm font-bold text-slate-900">{post.title}</h3>
          </div>
          {isOwner && (
            <button
              onClick={() => onDelete(post.id)}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
              title="Delete post"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm text-slate-600 leading-relaxed mb-3">{post.content}</p>
        )}

        {/* Attached file — shown for DOCUMENT and ASSIGNMENT */}
        {post.fileUrl && (
          <a
            href={post.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition mb-3 ${
              post.postType === 'DOCUMENT'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <FileText size={14} />
            {post.fileName || 'View attachment'}
          </a>
        )}

        {/* Deadline */}
        {post.postType === 'ASSIGNMENT' && post.deadline && (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-700 mb-3">
            <Calendar size={14} />
            Due: {formatDate(post.deadline)}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {post.author?.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-slate-500 font-medium">{post.author?.fullName || 'Anonymous'}</span>
          <span className="text-slate-300 text-xs">·</span>
          <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const PostFeed = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const userRole = user?.user_metadata?.role;
  const canPost = userRole === 'instructor' || userRole === 'admin';
  const Layout = userRole === 'student' ? StudentLayout : Dashboard;

  // ── Fetch posts ─────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const url = filter === 'ALL'
        ? `${API_URL}/posts`
        : `${API_URL}/posts?type=${filter}`;
      const res = await authFetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('fetchPosts error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
      }, () => fetchPosts())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchPosts]);

  // ── Delete post ─────────────────────────────────────────────────────────────
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await authFetch(`${API_URL}/posts/${postId}?requesterId=${user.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error('deletePost error:', err);
    }
  };

  const filterTabs = [
    { key: 'ALL', label: 'All', icon: BookOpen },
    { key: 'ANNOUNCEMENT', label: 'Announcements', icon: Megaphone },
    { key: 'DOCUMENT', label: 'Documents', icon: FileText },
    { key: 'ASSIGNMENT', label: 'Assignments', icon: ClipboardList },
  ];

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Class Feed</h1>
            <p className="text-slate-500 text-sm mt-0.5">Announcements, documents and assignments from instructors</p>
          </div>
          {canPost && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              New Post
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filterTabs.map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                filter === key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <TabIcon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Bell size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No posts yet</p>
            {canPost && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-sm text-indigo-600 font-semibold hover:underline"
              >
                Create the first post
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 max-w-2xl">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CreatePostModal
          authorId={user?.id}
          onClose={() => setShowModal(false)}
          onCreated={(newPost) => setPosts(prev => [newPost, ...prev])}
        />
      )}
    </Layout>
  );
};

export default PostFeed;
