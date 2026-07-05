import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch,  
    faSmile,
    faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://localhost:8080/api';
const CHAT_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const RECALL_LIMIT_MS = 3 * 60 * 60 * 1000;

const normalizeUser = (user) => user ? ({
    ...user,
    full_name: user.full_name ?? user.fullName,
    avatar_url: user.avatar_url ?? user.avatarUrl
}) : null;

const normalizeConversation = (conversation) => ({
    ...conversation,
    user1_id: conversation.user1_id ?? conversation.user1?.id,
    user2_id: conversation.user2_id ?? conversation.user2?.id,
    created_at: conversation.created_at ?? conversation.createdAt,
    user1: normalizeUser(conversation.user1),
    user2: normalizeUser(conversation.user2)
});

const normalizeMessage = (message) => ({
    ...message,
    conversation_id: message.conversation_id ?? message.conversation?.id,
    sender_id: message.sender_id ?? message.sender?.id,
    read_at: message.read_at ?? message.readAt,
    created_at: message.created_at ?? message.createdAt,
    updated_at: message.updated_at ?? message.updatedAt,
    is_edited: message.is_edited ?? message.isEdited
});

const normalizeMessageEdit = (edit) => ({
    ...edit,
    old_content: edit.old_content ?? edit.oldContent,
    edited_at: edit.edited_at ?? edit.editedAt
});

const readResponseError = async (response, fallbackMessage) => {
    const body = await response.json().catch(() => ({}));
    return body.message || `${fallbackMessage} (${response.status})`;
};

const Chat = ({ session, userData, pendingConversation, refreshUnreadCount }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const userDefaultAvatar = userData?.avatarUrl || session?.user?.user_metadata?.avatar_url;
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [conversationLastMessages, setConversationLastMessages] = useState({});
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [detailMessageId, setDetailMessageId] = useState(null);
    const [messageEdits, setMessageEdits] = useState({});
    const [, setRecallLimitExceeded] = useState({});
    const messagesEndRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiInputRef = useRef(null);

    // Danh sách emoji
    const emojis = [
        '😀', '😁', '😂', '😃', '😄', '😅',
        '😆', '😉', '😊', '😋', '😌', '😍',
        '😘', '😗', '😙', '😚', '😜', '😝',
        '😞', '😟', '😠', '😡', '😢', '😣',
        '😥', '😦', '😧', '😨', '😯', '😰',
        '😱', '😲', '😳', '😴', '😵', '😶',
        '😷', '😈', '😺', '😻', '😼', '🙀',
        '🙄', '😭', '😪', '😓', '😔', '😕',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
        '👍', '👎', '👏', '🙌', '👋', '✌', '🤞', '🤘', '🤟', '🤚',
        '🎉', '🎊', '🎈', '🎁', '💝', '🌟', '✨', '⭐', '🔥', '💯',
        '📊', '📈', '📉', '💼', '💻', '📱', '🎓', '📚', '✏️', '📝',
        '🚀', '✈️', '🚗', '🚙', '🏠', '🏫', '🏢', '⚽', '🏀', '🎮'
    ];

    const insertEmoji = (emoji) => {
        setNewMessage(currentMessage => currentMessage + emoji);
        setShowEmojiPicker(false);
        emojiInputRef.current?.focus();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchConversations();
            const conversationInterval = setInterval(fetchConversations, 10000);
            return () => clearInterval(conversationInterval);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            markAsRead(selectedConversation.id);
            const messageInterval = setInterval(() => {
                fetchMessages(selectedConversation.id);
                markAsRead(selectedConversation.id);
            }, 5000);
            return () => clearInterval(messageInterval);
        } else {
            setMessages([]);
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (pendingConversation && conversations.length > 0) {
            // Find the conversation by ID
            const conv = conversations.find(c => c.id === pendingConversation.conversationId);
            if (conv) {
                const otherUser = getOtherUser(conv);
                setSelectedConversation({
                    ...conv,
                    otherUser: otherUser
                });
            }
        }
    }, [pendingConversation, conversations]);

    const markAsRead = async (conversationId) => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/mark-as-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: conversationId,
                    userId: session.user.id
                }),
            });
            
            if (response.ok) {
                // Refresh local unread state
                setConversationLastMessages(prev => {
                    const lastMsg = prev[conversationId];
                    if (lastMsg && lastMsg.sender_id !== session.user.id && !lastMsg.read_at) {
                        return {
                            ...prev,
                            [conversationId]: { ...lastMsg, read_at: new Date().toISOString() }
                        };
                    }
                    return prev;
                });
                if (refreshUnreadCount) refreshUnreadCount();
            }
        } catch (err) {
            console.error("Error marking messages as read:", err);
        }
    };

    const fetchConversations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/conversations/${session.user.id}`);
            if (!response.ok) {
                throw new Error(`Không tải được cuộc trò chuyện (${response.status})`);
            }
            const data = (await response.json()).map(normalizeConversation);
            setConversations(data);

            const latestMessages = await Promise.all(data.map(async (conversation) => {
                const messagesResponse = await fetch(`${API_BASE_URL}/chat/messages/${conversation.id}`);
                if (!messagesResponse.ok) return null;
                const conversationMessages = (await messagesResponse.json()).map(normalizeMessage);
                return conversationMessages[conversationMessages.length - 1] || null;
            }));

            const lastMessages = {};
            latestMessages.filter(Boolean).forEach(message => {
                lastMessages[message.conversation_id] = message;
            });
            setConversationLastMessages(lastMessages);
        } catch (error) {
            console.error('Error fetching conversations:', error.message || error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/messages/${conversationId}`);
            if (!response.ok) {
                throw new Error(`Không tải được tin nhắn (${response.status})`);
            }
            setMessages((await response.json()).map(normalizeMessage));
        } catch (error) {
            console.error('Error fetching messages:', error.message || error);
        }
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length > 1) {
            setLoading(true);
            try {
                const params = new URLSearchParams({ query: value, excludeId: session.user.id });
                const response = await fetch(`${API_BASE_URL}/auth/users/search?${params}`);
                if (!response.ok) {
                    throw new Error(`Không tìm được người dùng (${response.status})`);
                }
                setSearchResults((await response.json()).map(normalizeUser));
            } catch (error) {
                console.error('Error searching users:', error.message || error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const startConversation = async (otherUser) => {
        try {
            if (!userData?.id) {
                throw new Error('Tài khoản chưa được đồng bộ với máy chủ. Vui lòng đăng xuất và đăng nhập lại.');
            }
            const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user1Id: userData.id,
                    user2Id: otherUser.id
                })
            });
            if (!response.ok) {
                throw new Error(await readResponseError(response, 'Không tạo được cuộc trò chuyện'));
            }
            const conversation = normalizeConversation(await response.json());
            setSelectedConversation({
                ...conversation,
                otherUser
            });
            await fetchConversations();
        } catch (error) {
            console.error('Error creating conversation:', error.message || error);
            alert(error.message || 'Lỗi tạo cuộc trò chuyện.');
        } finally {
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const content = newMessage.trim();
        try {
            const response = await fetch(`${API_BASE_URL}/chat/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    senderId: session.user.id,
                    content
                })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Không gửi được tin nhắn (${response.status})`);
            }
            const data = normalizeMessage(await response.json());
            setNewMessage('');
            setMessages(prev => prev.some(msg => msg.id === data.id) ? prev : [...prev, data]);
            setConversationLastMessages(prev => ({
                ...prev,
                [selectedConversation.id]: data
            }));
        } catch (error) {
            console.error('Error sending message:', error.message || error);
            alert(error.message || 'Lỗi gửi tin nhắn.');
        }
    };

    const getOtherUser = (conv) => {
        return conv.user1_id === session.user.id ? conv.user2 : conv.user1;
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: CHAT_TIME_ZONE
        }).format(date);
    };

    const formatLastMessage = (conv) => {
        const lastMsg = conversationLastMessages[conv.id];
        
        if (!lastMsg) {
            return "Hãy gửi tin nhắn cho nhau!";
        }
        
        const isMe = lastMsg.sender_id === session.user.id;
        const messageText = lastMsg.content;
        
        if (isMe) {
            return `Bạn: ${messageText}`;
        } else {
            return messageText;
        }
    };

    const formatDetailDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';

        const parts = new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false,
            timeZone: CHAT_TIME_ZONE
        }).formatToParts(date).reduce((result, part) => {
            result[part.type] = part.value;
            return result;
        }, {});
        
        return `${parts.hour}:${parts.minute} ${parts.day}/${parts.month}/${parts.year}`;
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            // Check if message is within 3 hours
            const message = messages.find(m => m.id === messageId);
            if (!message) return;

            const createdTime = new Date(message.created_at);
            const now = new Date();
            const hoursDifference = (now - createdTime) / (1000 * 60 * 60);

            if (hoursDifference >= 3) {
                alert('Tin nhắn đã gửi quá 3 giờ, không thể thu hồi');
                setRecallLimitExceeded(prev => ({
                    ...prev,
                    [messageId]: true
                }));
                return;
            }

            const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Không thu hồi được tin nhắn (${response.status})`);
            }
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            await fetchConversations();
            setOpenMenuId(null);
        } catch (error) {
            console.error('Error deleting message:', error.message || error);
        }
    };

    const handleStartEdit = (message) => {
        setEditingMessageId(message.id);
        setEditingContent(message.content);
        setOpenMenuId(null);
    };

    const handleUpdateMessage = async () => {
        if (!editingContent.trim() || !editingMessageId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/chat/messages/${editingMessageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editingContent.trim() })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Không chỉnh sửa được tin nhắn (${response.status})`);
            }
            const updatedMessage = normalizeMessage(await response.json());
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === editingMessageId 
                            ? updatedMessage
                            : msg
                    )
                );
                setConversationLastMessages(prev => {
                    const lastMessage = prev[selectedConversation.id];
                    if (!lastMessage || lastMessage.id !== editingMessageId) return prev;
                    return {
                        ...prev,
                        [selectedConversation.id]: {
                            ...lastMessage,
                            ...updatedMessage
                        }
                    };
                });
                setEditingMessageId(null);
                setEditingContent('');
        } catch (error) {
            console.error('Error updating message:', error.message || error);
            alert(error.message || 'Lỗi chỉnh sửa tin nhắn.');
        }
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingContent('');
    };

    const canRecallMessage = (message) => {
        if (!message.created_at) return false;
        try {
            const createdTime = new Date(message.created_at);
            const timeDiffMs = Date.now() - createdTime.getTime();
            return !Number.isNaN(timeDiffMs) && timeDiffMs < RECALL_LIMIT_MS && timeDiffMs >= 0;
        } catch (e) {
            return false;
        }
    };

    const fetchMessageEdits = async (messageId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/edits`);
            if (!response.ok) {
                throw new Error(`Không tải được lịch sử chỉnh sửa (${response.status})`);
            }
            const data = (await response.json()).map(normalizeMessageEdit).reverse();
            setMessageEdits(prev => ({
                ...prev,
                [messageId]: data
            }));
        } catch (error) {
            console.error('Error fetching edits:', error.message || error);
        }
    };

    return (
        <div className="chat-container">
            {/* Sidebar List */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <div className="chat-app-logo">
                        E-Chat
                    </div>
                    <div className="chat-search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search people..." 
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <div className="search-results-dropdown">
                                {loading ? (
                                    <div className="search-item">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <div key={user.id} className="search-item" onClick={() => startConversation(user)}>
                                            <img src={user.avatar_url} alt={user.full_name} />
                                            <span>{user.full_name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="search-item">No users found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="chat-list-section">
                    <div className="chat-list-label">ALL MESSAGES</div>
                    {conversations.map(conv => {
                        const otherUser = getOtherUser(conv);
                        const lastMsg = conversationLastMessages[conv.id];
                        const isUnread = lastMsg && lastMsg.sender_id !== session.user.id && !lastMsg.read_at;

                        return (
                            <div 
                                key={conv.id} 
                                className={`chat-list-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                                onClick={() => setSelectedConversation({...conv, otherUser})}
                            >
                                <div className="chat-avatar">
                                    <img src={otherUser?.avatar_url} alt={otherUser?.full_name} />
                                    {isUnread && <div className="unread-dot"></div>}
                                </div>
                                <div className="chat-info">
                                    <div className="chat-name-row">
                                        <span className="chat-name">{otherUser?.full_name}</span>
                                        <span className="chat-time">
                                            {formatTime(conv.created_at)}
                                        </span>
                                    </div>
                                    <div className="chat-msg-row">
                                        <span className="chat-last-msg">{formatLastMessage(conv)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedConversation ? (
                    <>
                        <div className="chat-window-header">
                            <div className="header-user-info">
                                <div className="header-avatar">
                                    <img src={selectedConversation.otherUser?.avatar_url} alt={selectedConversation.otherUser?.full_name} />
                                </div>
                                <div className="header-text">
                                    <div className="header-name">{selectedConversation.otherUser?.full_name}</div>
                                    <div className="header-status">Online</div>
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map(msg => {
                                const isMe = msg.sender_id === session.user.id;
                                const isEditing = editingMessageId === msg.id;
                                
                                return (
                                    <div 
                                        key={msg.id} 
                                        className={`message-row ${isMe ? 'me' : 'them'}`}
                                        onMouseEnter={() => !editingMessageId && setHoveredMessageId(msg.id)}
                                        onMouseLeave={() => {
                                            setHoveredMessageId(null);
                                            setOpenMenuId(null);
                                        }}
                                    >
                                        {!isMe && (
                                            <div className="msg-avatar">
                                                <img src={selectedConversation.otherUser?.avatar_url} alt={selectedConversation.otherUser?.full_name} />
                                            </div>
                                        )}
                                        
                                        <div className="message-wrapper">
                                            <div className="message-bubble">
                                                {msg.is_edited && <div className="edited-badge">Đã chỉnh sửa</div>}
                                                {!isMe && <div className="sender-name">{selectedConversation.otherUser?.full_name} <span className="time">{formatTime(msg.created_at)}</span></div>}
                                                
                                                {isEditing ? (
                                                    <div className="edit-message">
                                                        <input 
                                                            type="text" 
                                                            value={editingContent}
                                                            onChange={(e) => setEditingContent(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <div className="edit-actions">
                                                            <button onClick={handleUpdateMessage} className="edit-save">Lưu</button>
                                                            <button onClick={handleCancelEdit} className="edit-cancel">Hủy</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="message-text">
                                                        {msg.content}
                                                    </div>
                                                )}
                                                
                                                {isMe && !isEditing && (
                                                    <div className="me-meta">
                                                        <span className="time">{formatTime(msg.created_at)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {!isMe && hoveredMessageId === msg.id && !isEditing && (
                                                <div className="message-actions">
                                                    <button 
                                                        className="ellipsis-btn"
                                                        onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                                                    >
                                                        ⋮
                                                    </button>
                                                    
                                                    {openMenuId === msg.id && (
                                                        <div className="message-dropdown-menu">
                                                            <button 
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setDetailMessageId(msg.id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                Chi tiết
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isMe && (
                                            <div className="msg-avatar">
                                                <img src={userDefaultAvatar} alt="User Avatar"/>
                                            </div>
                                        )}
                                        
                                        {isMe && hoveredMessageId === msg.id && !isEditing && (
                                            <div className="message-actions">
                                                <button 
                                                    className="ellipsis-btn"
                                                    onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                                                >
                                                    ⋮
                                                </button>
                                                
                                                {openMenuId === msg.id && (
                                                    <div className="message-dropdown-menu">
                                                        <button 
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                handleStartEdit(msg);
                                                                setOpenMenuId(null);
                                                            }}
                                                        >
                                                            Chỉnh sửa
                                                        </button>
                                                        
                                                        {canRecallMessage(msg) && (
                                                            <button 
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    handleDeleteMessage(msg.id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                            >
                                                                Thu hồi
                                                            </button>
                                                        )}
                                                        
                                                        <button 
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                setDetailMessageId(msg.id);
                                                                if (msg.is_edited) {
                                                                    fetchMessageEdits(msg.id);
                                                                }
                                                                setOpenMenuId(null);
                                                            }}
                                                        >
                                                            Chi tiết
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Detail Modal */}
                        {detailMessageId && (
                            <div className="message-detail-modal">
                                <div className="modal-overlay" onClick={() => setDetailMessageId(null)}></div>
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h3>Chi tiết tin nhắn</h3>
                                        <button className="modal-close" onClick={() => setDetailMessageId(null)}>×</button>
                                    </div>
                                    <div className="modal-body">
                                        <p className="detail-text">{messages.find(m => m.id === detailMessageId)?.content}</p>
                                        <p className="detail-date">
                                            Gửi lúc: <strong>{formatDetailDate(messages.find(m => m.id === detailMessageId)?.created_at)}</strong>
                                        </p>
                                        
                                        {messages.find(m => m.id === detailMessageId)?.is_edited && (
                                            <div className="edit-history">
                                                <p className="edit-label">Đã chỉnh sửa</p>
                                                {messageEdits[detailMessageId]?.map((edit, idx) => (
                                                    <div key={idx} className="edit-item">
                                                        <p className="edit-time">Lần {idx + 1}: {formatDetailDate(edit.edited_at)}</p>
                                                        <p className="edit-content">Tin nhắn cũ: {edit.old_content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <div className="input-container">
                                <input 
                                    ref={emojiInputRef}
                                    type="text" 
                                    placeholder="Type message..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="button" className="input-aux-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <FontAwesomeIcon icon={faSmile} />
                                </button>
                                
                                {/* Emoji Picker */}
                                {showEmojiPicker && (
                                    <div className="emoji-picker">
                                        <div className="emoji-grid">
                                            {emojis.map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="emoji-btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        insertEmoji(emoji);
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="send-btn">
                                <span>Send</span>
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="no-chat-content">
                            <h3>Bắt đầu nhắn tin</h3>
                            <p>Hãy tìm hoặc chọn một người để bắt đầu cuộc trò chuyện</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
