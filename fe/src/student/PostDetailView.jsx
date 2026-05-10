import React, { useState } from 'react';
import {
  X, Megaphone, FileText, ClipboardList, Calendar, Bell,
  Download, AlertCircle, MessageCircle, Send, Upload, CheckCircle,
} from 'lucide-react';

const POST_TYPES = {
  ANNOUNCEMENT: { 
    label: 'Announcement', icon: Megaphone, 
    bg: 'bg-indigo-50', border: 'border-indigo-200', 
    badge: 'bg-indigo-100 text-indigo-700', iconColor: 'text-indigo-600' 
  },
  DOCUMENT: { 
    label: 'Document', icon: FileText, 
    bg: 'bg-emerald-50', border: 'border-emerald-200', 
    badge: 'bg-emerald-100 text-emerald-700', iconColor: 'text-emerald-600' 
  },
  ASSIGNMENT: { 
    label: 'Assignment', icon: ClipboardList, 
    bg: 'bg-orange-50', border: 'border-orange-200', 
    badge: 'bg-orange-100 text-orange-700', iconColor: 'text-orange-600' 
  },
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

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Post Detail View Component ─────────────────────────────────────────────────
const PostDetailView = ({ post, onClose, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const cfg = POST_TYPES[post.postType] || POST_TYPES.ANNOUNCEMENT;
  const Icon = cfg.icon;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: { fullName: 'You' },
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitFile = () => {
    if (!selectedFile) return;
    const newSubmission = {
      id: Date.now(),
      fileName: selectedFile.name,
      fileSize: (selectedFile.size / 1024).toFixed(2),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };
    setSubmittedFiles([newSubmission, ...submittedFiles]);
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className={`${cfg.bg} border-b ${cfg.border} px-8 py-6 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${cfg.badge}`}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{post.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                By {post.author?.fullName || 'Anonymous'} · {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition">
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto flex">
          {/* Left: Content & Comments */}
          <div className="flex-1 p-8 space-y-8 border-r border-slate-200">
            {/* Post Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-slate-700 leading-relaxed text-base">{post.content}</p>
              </div>

              {/* Attached File */}
              {post.fileUrl && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{post.fileName || 'Document'}</p>
                        <p className="text-xs text-slate-500">Attached file</p>
                      </div>
                    </div>
                    <a
                      href={post.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-sm flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* Deadline */}
              {post.postType === 'ASSIGNMENT' && post.deadline && (
                <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                    <Calendar size={18} />
                    Deadline
                  </div>
                  <p className="text-orange-900">{formatDate(post.deadline)}</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            {post.postType !== 'DOCUMENT' && (
              <div className="space-y-4 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <MessageCircle size={20} />
                  Comments ({comments.length})
                </div>

                {/* Comment Input */}
                <div className="space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Post Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-center py-8 text-slate-400">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                              {comment.author?.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{comment.author?.fullName}</p>
                              <p className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 ml-10">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Submission Panel */}
          {post.postType === 'ASSIGNMENT' && (
            <div className="w-80 p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Upload size={18} className="text-orange-600" />
                  Submit Assignment
                </h3>

                {/* File Input */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition"
                >
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} />
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">Click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                  {selectedFile && (
                    <p className="text-xs text-emerald-600 font-semibold mt-2">
                      ✓ {selectedFile.name}
                    </p>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile && (
                  <button
                    onClick={handleSubmitFile}
                    className="w-full mt-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Submit File
                  </button>
                )}
              </div>

              {/* Submitted Files */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Your Submissions</h4>
                <div className="space-y-2">
                  {submittedFiles.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No submissions yet</p>
                  ) : (
                    submittedFiles.map((submission) => (
                      <div key={submission.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-1">
                          <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <FileText size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-emerald-900 line-clamp-1">
                              {submission.fileName}
                            </p>
                            <p className="text-[11px] text-emerald-700">
                              {submission.fileSize} KB
                            </p>
                          </div>
                        </div>
                        <p className="text-[11px] text-emerald-600 ml-8">
                          Submitted {timeAgo(submission.submittedAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailView;
