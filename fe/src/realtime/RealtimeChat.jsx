import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import Dashboard from '../dashboard/Dashboard';
import StudentLayout from '../student/StudentLayout';
import { Send, Search, Video, Phone, Info, MoreVertical, Smile, UserPlus, MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api';

// Helper: fetch với Bearer token từ Supabase session
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

const RealtimeChat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // ── Fetch conversations ───────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await authFetch(`${API_URL}/chat/conversations/${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch (err) {
      console.error('fetchConversations error:', err);
    }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Fetch messages ────────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const res = await authFetch(`${API_URL}/chat/messages/${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error('fetchMessages error:', err);
    }
  }, []);

  // ── Realtime subscription ─────────────────────────────────────────
  useEffect(() => {
    if (!activeConversation?.id) return;
    const channel = supabase
      .channel(`chat:${activeConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversation.id}`
      }, () => fetchMessages(activeConversation.id))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeConversation, fetchMessages]);

  // ── Search users ──────────────────────────────────────────────────
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await authFetch(`${API_URL}/profiles/search?query=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setSearchResults(data.filter(u => u.id !== user.id));
    } catch (err) {
      console.error('search error:', err);
    }
  };

  // ── Start conversation ────────────────────────────────────────────
  const startConversation = async (targetUser) => {
    try {
      const res = await authFetch(`${API_URL}/chat/conversation?user1Id=${user.id}&user2Id=${targetUser.id}`);
      if (!res.ok) throw new Error(await res.text());
      const conv = await res.json();
      if (conv?.id) {
        setActiveConversation(conv);
        fetchMessages(conv.id);
        fetchConversations();
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('startConversation error:', err);
    }
  };

  // ── Send message ──────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation?.id || sending) return;
    setSending(true);
    try {
      const res = await authFetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        body: JSON.stringify({
          conversationId: activeConversation.id,
          senderId: user.id,
          content: newMessage.trim(),
          messageType: 'text'
        })
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error('Send message failed:', errBody);
        return;
      }
      setNewMessage('');
      // Realtime will refresh messages automatically; fallback fetch just in case
      await fetchMessages(activeConversation.id);
    } catch (err) {
      console.error('handleSendMessage error:', err);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conv) => {
    if (!conv || !user) return { fullName: '?', id: null };
    return conv.user1?.id === user.id ? conv.user2 : conv.user1;
  };

  const otherUser = activeConversation ? getOtherUser(activeConversation) : null;

  const userRole = user?.user_metadata?.role;
  const Layout = userRole === 'student' ? StudentLayout : Dashboard;

  return (
    <Layout>
      <div className="flex-1 flex overflow-hidden h-full" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ── Sidebar ── */}
        <aside className="w-80 flex flex-col border-r border-slate-100 bg-white shrink-0">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Messages</h2>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                <MoreVertical size={16} />
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search people..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => startConversation(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition text-left border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{u.fullName || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                      </div>
                      <UserPlus size={13} className="ml-auto text-slate-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Direct Messages</p>
            {conversations.length > 0 ? (
              conversations.map(conv => {
                const other = getOtherUser(conv);
                const isActive = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => { setActiveConversation(conv); fetchMessages(conv.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition mb-0.5 ${isActive ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {other.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{other.fullName || 'User'}</p>
                      <p className={`text-xs truncate ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>online</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="mx-3 mt-4 py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <MessageCircle size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No conversations yet</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {activeConversation && otherUser ? (
            <>
              {/* Header */}
              <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-slate-100 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    {otherUser.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{otherUser.fullName}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] text-emerald-500 font-medium">Active now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Video size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Phone size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Info size={18} /></button>
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-slate-400">No messages yet. Say hello! 👋</p>
                  </div>
                )}
                {messages.map((msg, idx) => {
                  const isMine = msg.sender?.id === user?.id;
                  const showName = !isMine && (idx === 0 || messages[idx - 1]?.sender?.id !== msg.sender?.id);
                  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-1`}>
                      {showName && <p className="text-[11px] text-slate-400 font-medium mb-1 ml-1">{msg.sender?.fullName}</p>}
                      <div className={`group flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-1">
                            {msg.sender?.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-tr-sm shadow-md shadow-indigo-100'
                            : 'bg-white text-slate-700 rounded-tl-sm shadow-sm border border-slate-100'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                      <p className={`text-[10px] text-slate-400 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition ${isMine ? 'text-right' : 'text-left ml-9'}`}>{time}</p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <footer className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 transition">
                  <button type="button" className="text-slate-400 hover:text-indigo-500 transition pb-1"><Smile size={20} /></button>
                  <textarea
                    rows={1}
                    placeholder={`Message ${otherUser.fullName}...`}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm py-1.5 text-slate-700 placeholder-slate-400"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-xl hover:from-indigo-700 hover:to-violet-800 shadow-md shadow-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Your Messages</h3>
              <p className="text-sm text-slate-400 text-center max-w-xs">Search for someone or select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RealtimeChat;
