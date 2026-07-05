import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Class.css';
import AssignmentDetail from './AssignmentDetail';
import { 
    faPlus, 
    faSignInAlt, 
    faUsers,  
    faCalendarAlt,
    faEllipsisH,
    faCopy,
    faBullhorn,
    faFileAlt,
    faTasks,
    faPaperclip,
    faTimes,
    faPaperPlane,
    faArrowLeft,
    faUserGraduation,
    faBookOpen,
    faClock
} from '@fortawesome/free-solid-svg-icons';

const Class = ({ session, userRole, userData, onSwitchToMessages, classes, setClasses }) => {
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [className, setClassName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [postType, setPostType] = useState('announcement');
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [postDeadline, setPostDeadline] = useState('');
    const [commentTexts, setCommentTexts] = useState({});
    const [targetClassIds, setTargetClassIds] = useState([]);
    const [showClassSelector, setShowClassSelector] = useState(false);
    
    const [editingPost, setEditingPost] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [loadingPosts, setLoadingPosts] = useState(false);

    // Sub navigation tab inside selected class
    const [activeSubTab, setActiveSubTab] = useState('stream'); // 'stream', 'classwork', 'people'

    // Assignment Detail view
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const isTeacher = userRole === "1";

    useEffect(() => {
        let subscription;
        let attachmentSubscription;
        let commentSubscription;
        
        if (selectedClass) {
            fetchPosts(selectedClass.id);

            // Realtime cho bảng bài đăng
            const postChannelName = `class-posts-${selectedClass.id}`;
            subscription = supabase
                .channel(postChannelName)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'class_posts',
                        filter: `class_id=eq.${selectedClass.id}`
                    },
                    () => {
                        fetchPosts(selectedClass.id, false);
                    }
                )
                .subscribe();

            // Realtime cho bảng bình luận
            const commentChannelName = `class-comments-${selectedClass.id}`;
            commentSubscription = supabase
                .channel(commentChannelName)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'comments'
                    },
                    () => {
                        fetchPosts(selectedClass.id, false); 
                    }
                )
                .subscribe();

            // Realtime cho bảng tệp đính kèm
            attachmentSubscription = supabase
                .channel(`class-attachments-${selectedClass.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'post_attachments'
                    },
                    () => {
                        fetchPosts(selectedClass.id, false);
                    }
                )
                .subscribe();
        }
        return () => {
            if (subscription) supabase.removeChannel(subscription);
            if (attachmentSubscription) supabase.removeChannel(attachmentSubscription);
            if (commentSubscription) supabase.removeChannel(commentSubscription);
        };
    }, [selectedClass]);

    const fetchClassesLocal = async () => {
        setLoading(true);
        try {
            const roleParam = userRole ? `?role=${userRole}` : '';
            const response = await fetch(`http://localhost:8080/api/classes/user/${session.user.id}${roleParam}`);
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (classId, showLoading = true) => {
        if (showLoading) setLoadingPosts(true);
        try {
            const response = await fetch(`http://localhost:8080/api/posts/class/${classId}`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            if (showLoading) setLoadingPosts(false);
        }
    };

    const handleCommentChange = (postId, text) => {
        setCommentTexts(prev => ({ ...prev, [postId]: text }));
    };

    const submitComment = async (postId) => {
        const content = commentTexts[postId];
        if (!content?.trim()) return;

        try {
            const response = await fetch('http://localhost:8080/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: postId,
                    userId: session.user.id,
                    content: content
                })
            });

            if (response.ok) {
                setCommentTexts(prev => ({ ...prev, [postId]: '' }));
                if (selectedClass) {
                    fetchPosts(selectedClass.id, false);
                }
            } else {
                const errData = await response.json().catch(() => ({}));
                alert(errData.message || 'Không thể gửi bình luận. Vui lòng thử lại!');
            }
        } catch (err) {
            console.error("Error submitting comment:", err);
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const newAttachments = [...attachments];

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${selectedClass.id}/${fileName}`;

                const { error } = await supabase.storage
                    .from('post-files')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    throw error;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('post-files')
                    .getPublicUrl(filePath);

                newAttachments.push({
                    fileUrl: publicUrl,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                });
            } catch (err) {
                alert(`Lỗi khi tải lên file ${file.name}`);
            }
        }

        setAttachments(newAttachments);
        setUploading(false);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const toggleClassSelection = (classId) => {
        setTargetClassIds(prev => 
            prev.includes(classId) 
                ? prev.filter(id => id !== classId) 
                : [...prev, classId]
        );
    };

    const toggleAllClasses = () => {
        if (targetClassIds.length === classes.length) {
            setTargetClassIds([]);
        } else {
            setTargetClassIds(classes.map(c => c.id));
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postTitle.trim() || !postContent.trim()) return;

        const newPost = {
            classId: selectedClass.id,
            targetClassIds: targetClassIds.length > 0 ? targetClassIds : [selectedClass.id],
            authorId: session.user.id,
            type: postType,
            title: postTitle,
            content: postContent,
            attachments: attachments,
            dueAt: postType === 'assignment' && postDeadline ? postDeadline : null
        };

        try {
            const response = await fetch('http://localhost:8080/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost),
            });

            if (response.ok) {
                setShowPostModal(false);
                setPostTitle('');
                setPostContent('');
                setPostType('announcement');
                setAttachments([]);
                setPostDeadline('');
                setTargetClassIds([]);
                fetchPosts(selectedClass.id);
            } else {
                const errData = await response.json().catch(() => ({}));
                alert(errData.message || 'Không thể tạo bài đăng. Vui lòng thử lại!');
            }
        } catch (err) {
            console.error("Error creating post:", err);
        }
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setPostType(post.type);
        setPostTitle(post.title || '');
        setPostContent(post.content || '');
        setAttachments(post.attachments || []);
        setPostDeadline(post.dueAt ? post.dueAt.slice(0, 16) : '');
        setShowEditModal(true);
        setActiveMenu(null);
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!postTitle.trim() || !postContent.trim()) return;

        const updatedPost = {
            ...editingPost,
            type: postType,
            title: postTitle,
            content: postContent,
            attachments: attachments,
            dueAt: postType === 'assignment' && postDeadline ? postDeadline : null
        };

        try {
            const response = await fetch(`http://localhost:8080/api/posts/${editingPost.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost),
            });

            if (response.ok) {
                setShowEditModal(false);
                setEditingPost(null);
                setPostTitle('');
                setPostContent('');
                setAttachments([]);
                setPostDeadline('');
                if (selectedClass) fetchPosts(selectedClass.id, false);
            } else {
                const errData = await response.json().catch(() => ({}));
                alert(errData.message || 'Không thể cập nhật bài đăng. Vui lòng thử lại!');
            }
        } catch (err) {
            console.error("Error updating post:", err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) return;

        try {
            const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setActiveMenu(null);
            }
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    const generateJoinCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!className.trim()) return;

        const newClass = {
            name: className,
            teacherId: session.user.id, 
            joinCode: generateJoinCode() 
        };

        try {
            const response = await fetch('http://localhost:8080/api/classes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClass),
            });

            if (response.ok) {
                const data = await response.json();
                setClasses([...classes, data]);
                setShowCreateModal(false);
                setClassName('');
            } 
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        try {
            const response = await fetch('http://localhost:8080/api/classes/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: session.user.id,
                    join_code: joinCode
                }),
            });

            if (response.ok) {
                alert("Đã tham gia lớp học thành công!");
                setShowJoinModal(false);
                setJoinCode('');
                fetchClassesLocal();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Mã code không hợp lệ hoặc bạn đã tham gia lớp này.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        alert("Đã sao chép mã tham gia lớp học.");
    };

    // Mock list of classmates to make the People tab premium and complete
    const mockStudents = [
        { id: 1, name: "Nguyễn Văn An", email: "an.nv@hust.edu.vn", roleBadge: "Lớp trưởng" },
        { id: 2, name: "Trần Thị Bình", email: "binh.tt@hust.edu.vn", roleBadge: "Thành viên" },
        { id: 3, name: "Phạm Hồng Cường", email: "cuong.ph@hust.edu.vn", roleBadge: "Thành viên" },
        { id: 4, name: "Lê Minh Duy", email: "duy.lm@hust.edu.vn", roleBadge: "Thành viên" },
        { id: 5, name: "Đỗ Thanh Hải", email: "hai.dt@hust.edu.vn", roleBadge: "Thành viên" }
    ];

    return (
        <div className="class-container">
            {selectedAssignment ? (
                <AssignmentDetail
                    post={selectedAssignment}
                    session={session}
                    userRole={userRole}
                    userData={userData}
                    selectedClass={selectedClass}
                    onBack={() => setSelectedAssignment(null)}
                    onSwitchToMessages={onSwitchToMessages}
                />
            ) : selectedClass ? (
                /* Class Detail view with Horizontal Sub-tabs (No sidebar) */
                <div className="class-detail-container">
                    
                    {/* Glassmorphic Class Banner */}
                    <div className="class-banner">
                        <button className="back-to-classes-btn" onClick={() => { setSelectedClass(null); setSelectedAssignment(null); }}>
                            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
                            Quay lại lớp học của tôi
                        </button>
                        <div className="banner-content">
                            <h1>{selectedClass.name}</h1>
                            <p>🧑‍🏫 Giảng viên: <strong>{selectedClass.teacherName || "Giáo viên"}</strong></p>
                        </div>
                    </div>

                    {/* Horizontal Navigation Sub-tabs */}
                    <div className="class-sub-tabs-bar">
                        <button 
                            className={`sub-tab-item ${activeSubTab === 'stream' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('stream')}
                        >
                            <FontAwesomeIcon icon={faBullhorn} className="sub-tab-icon" />
                            <span>Bảng tin</span>
                        </button>
                        <button 
                            className={`sub-tab-item ${activeSubTab === 'classwork' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('classwork')}
                        >
                            <FontAwesomeIcon icon={faBookOpen} className="sub-tab-icon" />
                            <span>Bài tập & Tài liệu</span>
                        </button>
                        <button 
                            className={`sub-tab-item ${activeSubTab === 'people' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('people')}
                        >
                            <FontAwesomeIcon icon={faUsers} className="sub-tab-icon" />
                            <span>Thành viên</span>
                        </button>
                    </div>

                    {/* Sub-tab Content Area */}
                    <div className="class-detail-body">
                        
                        {activeSubTab === 'stream' && (
                            <div className="class-stream-tab">
                                <div className="stream-layout-grid">
                                    
                                    {/* Left side card: Join Code & Reminders */}
                                    <div className="stream-sidebar-card">
                                        <div className="sidebar-info-card">
                                            <h4>Mã tham gia lớp</h4>
                                            <div 
                                                className="join-code-interactive" 
                                                onClick={() => copyToClipboard(selectedClass.joinCode)}
                                                title="Click để sao chép mã"
                                            >
                                                <span>{selectedClass.joinCode}</span>
                                                <FontAwesomeIcon icon={faCopy} className="copy-badge-icon" />
                                            </div>
                                        </div>

                                        <div className="sidebar-info-card">
                                            <h4>Bài tập sắp đến hạn</h4>
                                            {posts.filter(p => p.type === 'assignment').length === 0 ? (
                                                <p className="no-reminders-text">Tuyệt vời! Không có bài tập nào sắp đến hạn nộp.</p>
                                            ) : (
                                                <div className="stream-reminders-list">
                                                    {posts.filter(p => p.type === 'assignment').slice(0, 2).map(p => (
                                                        <div key={p.id} className="stream-reminder-item">
                                                            <FontAwesomeIcon icon={faClock} className="reminder-icon" />
                                                            <div className="reminder-text">
                                                                <h6>{p.title}</h6>
                                                                <span>{p.dueAt ? new Date(p.dueAt).toLocaleDateString('vi-VN') : 'Không có hạn'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right side card: Feed and Announcements */}
                                    <div className="stream-posts-feed-area">
                                        {isTeacher && (
                                            <div className="post-composer-trigger-box" onClick={() => setShowPostModal(true)}>
                                                <div className="composer-user-avatar">
                                                    {userData?.avatarUrl ? (
                                                        <img src={userData.avatarUrl} alt="avatar" />
                                                    ) : (
                                                        (userData?.fullName || session.user.email || 'G').charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="composer-box-placeholder">Chia sẻ nội dung hoặc tạo bài tập mới cho lớp học của bạn...</span>
                                            </div>
                                        )}

                                        <div className="stream-posts-list">
                                            {loadingPosts ? (
                                                <div className="loading-shimmer-container">
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="post-item-shimmer">
                                                            <div className="shimmer-header"><div className="shimmer-avatar"></div><div className="shimmer-title-line"></div></div>
                                                            <div className="shimmer-content-line"></div>
                                                            <div className="shimmer-content-line short"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : posts.length === 0 ? (
                                                <div className="stream-empty-feed">
                                                    <FontAwesomeIcon icon={faBullhorn} className="empty-feed-icon" />
                                                    <h5>Chưa có bài đăng nào trong lớp học</h5>
                                                    <p>Mọi thông báo, bài tập và thảo luận sẽ được hiển thị tại đây.</p>
                                                </div>
                                            ) : (
                                                posts.map((post) => (
                                                    <div 
                                                        key={post.id} 
                                                        className={`post-feed-card ${post.type === 'assignment' ? 'assignment-border' : ''}`}
                                                        onMouseLeave={() => setActiveMenu(null)}
                                                        onClick={() => setSelectedAssignment(post)}
                                                    >
                                                        <div className="post-feed-card-header">
                                                            <div className="post-author-block">
                                                                <div className="author-avatar-circle">
                                                                    {post.authorAvatar ? (
                                                                        <img src={post.authorAvatar} alt="avatar" />
                                                                    ) : (
                                                                        post.authorName.charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <div className="author-metadata">
                                                                    <h5>{post.authorName}</h5>
                                                                    <span>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                                                                </div>
                                                            </div>

                                                            <div className="post-header-actions-block" onClick={(e) => e.stopPropagation()}>
                                                                <span className={`post-type-pill pill-${post.type}`}>
                                                                    <FontAwesomeIcon icon={post.type === 'assignment' ? faTasks : (post.type === 'material' ? faFileAlt : faBullhorn)} style={{ marginRight: '6px' }} />
                                                                    {post.type === 'assignment' ? 'Bài tập' : (post.type === 'material' ? 'Tài liệu' : 'Thông báo')}
                                                                </span>

                                                                {isTeacher && (
                                                                    <div className="post-options-dropdown-container">
                                                                        <button 
                                                                            className="card-ellipsis-btn"
                                                                            onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faEllipsisH} />
                                                                        </button>
                                                                        {activeMenu === post.id && (
                                                                            <div className="card-dropdown-menu">
                                                                                <button onClick={() => handleEditPost(post)}>Chỉnh sửa</button>
                                                                                <button className="delete" onClick={() => handleDeletePost(post.id)}>Xóa</button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="post-feed-card-body">
                                                            {post.title && <h4 className="post-card-title">{post.title}</h4>}
                                                            <p className="post-card-content">{post.content}</p>

                                                            {post.type === 'assignment' && post.deadline && (
                                                                <div className="post-card-deadline-tag">
                                                                    <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                                                                    Hạn nộp: {new Date(post.deadline).toLocaleString('vi-VN', {
                                                                        weekday: 'short', month: 'long', day: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            )}

                                                            <div className="post-card-cta-indicator">
                                                                <span>
                                                                    {post.type === 'assignment' ? 'Xem chi tiết & Nộp bài tập ➔' : 
                                                                     post.type === 'material' ? 'Xem & tải tài liệu xuống ➔' : 
                                                                     'Xem thảo luận & bình luận lớp học ➔'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Preview attachments */}
                                                        {post.attachments && post.attachments.length > 0 && post.type !== 'assignment' && (
                                                            <div className="post-card-attachments-preview" onClick={(e) => e.stopPropagation()}>
                                                                {post.attachments.map((att) => (
                                                                    <a key={att.id} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="att-preview-item">
                                                                        <FontAwesomeIcon icon={faFileAlt} className="att-file-icon" />
                                                                        <div className="att-metadata">
                                                                            <h6>{att.fileName}</h6>
                                                                            <span>{att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}</span>
                                                                        </div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Comment Section Footer preview */}
                                                        <div className="post-card-comment-footer" onClick={(e) => e.stopPropagation()}>
                                                            {post.recentComments && post.recentComments.length > 0 && (
                                                                <div className="post-card-comments-list">
                                                                    {post.recentComments.map(comment => (
                                                                        <div key={comment.id} className="post-comment-item">
                                                                            <div className="comment-user-avatar-xs">
                                                                                {comment.userAvatar ? <img src={comment.userAvatar} alt="avatar" /> : comment.userName.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div className="comment-balloon">
                                                                                <div className="comment-user-meta">
                                                                                    <strong>{comment.userName}</strong>
                                                                                    <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                                </div>
                                                                                <p>{comment.content}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="post-card-comment-input-row">
                                                                <div className="comment-user-avatar-xs">
                                                                    {userData?.avatarUrl ? <img src={userData.avatarUrl} alt="avatar" /> : (userData?.fullName || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="comment-input-field-wrapper">
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="Viết câu hỏi hoặc nhận xét công khai..."
                                                                        value={commentTexts[post.id] || ''}
                                                                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                                        onKeyPress={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                submitComment(post.id);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button 
                                                                        onClick={() => submitComment(post.id)}
                                                                        disabled={!commentTexts[post.id]?.trim()}
                                                                        className="comment-send-btn-arrow"
                                                                    >
                                                                        <FontAwesomeIcon icon={faPaperPlane} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'classwork' && (
                            <div className="class-classwork-tab">
                                
                                <div className="classwork-category-card">
                                    <div className="category-header">
                                        <FontAwesomeIcon icon={faTasks} className="category-header-icon" />
                                        <h3>Bài tập giao về nhà (Assignments)</h3>
                                    </div>
                                    <div className="classwork-items-list">
                                        {posts.filter(p => p.type === 'assignment').length === 0 ? (
                                            <div className="no-classwork-item-placeholder">
                                                <p>Chưa có bài tập nào được giao cho lớp học này.</p>
                                            </div>
                                        ) : (
                                            posts.filter(p => p.type === 'assignment').map(post => (
                                                <div 
                                                    key={post.id} 
                                                    className="classwork-accordion-item assignment"
                                                    onClick={() => setSelectedAssignment(post)}
                                                >
                                                    <div className="classwork-item-main">
                                                        <div className="classwork-item-title-section">
                                                            <div className="classwork-item-icon-box"><FontAwesomeIcon icon={faTasks} /></div>
                                                            <h4>{post.title}</h4>
                                                        </div>
                                                        <div className="classwork-item-meta-section">
                                                            <span>Hạn nộp: {post.dueAt ? new Date(post.dueAt).toLocaleDateString('vi-VN') : 'Không hạn'}</span>
                                                            <button className="classwork-view-action-btn">Làm bài ➔</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="classwork-category-card" style={{ marginTop: '28px' }}>
                                    <div className="category-header material">
                                        <FontAwesomeIcon icon={faFileAlt} className="category-header-icon" />
                                        <h3>Tài liệu & Học liệu khóa học (Materials)</h3>
                                    </div>
                                    <div className="classwork-items-list">
                                        {posts.filter(p => p.type === 'material').length === 0 ? (
                                            <div className="no-classwork-item-placeholder">
                                                <p>Chưa có tài liệu học liệu nào được đăng tải.</p>
                                            </div>
                                        ) : (
                                            posts.filter(p => p.type === 'material').map(post => (
                                                <div 
                                                    key={post.id} 
                                                    className="classwork-accordion-item material"
                                                    onClick={() => setSelectedAssignment(post)}
                                                >
                                                    <div className="classwork-item-main">
                                                        <div className="classwork-item-title-section">
                                                            <div className="classwork-item-icon-box"><FontAwesomeIcon icon={faFileAlt} /></div>
                                                            <h4>{post.title}</h4>
                                                        </div>
                                                        <div className="classwork-item-meta-section">
                                                            <span>Tải lên: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                                            <button className="classwork-view-action-btn">Tải về ➔</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'people' && (
                            <div className="class-people-tab">
                                
                                <div className="people-category-block">
                                    <div className="people-category-header">
                                        <h4>Giảng viên lớp học</h4>
                                        <div className="header-divider-line"></div>
                                    </div>
                                    <div className="people-teacher-profile-row">
                                        <div className="teacher-profile-avatar-circle">
                                            {selectedClass.teacherAvatar ? (
                                                <img src={selectedClass.teacherAvatar} alt="teacher" />
                                            ) : (
                                                (selectedClass.teacherName || 'G').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="teacher-profile-meta">
                                            <h5>{selectedClass.teacherName || "Giáo viên giảng dạy"}</h5>
                                            <p>Chủ sở hữu khóa học</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="people-category-block" style={{ marginTop: '36px' }}>
                                    <div className="people-category-header">
                                        <h4>Học viên cùng lớp ({mockStudents.length})</h4>
                                        <div className="header-divider-line"></div>
                                    </div>
                                    <div className="people-students-grid-list">
                                        {mockStudents.map(student => (
                                            <div key={student.id} className="student-profile-card">
                                                <div className="student-avatar-letter-box">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="student-card-details">
                                                    <h5>{student.name}</h5>
                                                    <span>{student.email}</span>
                                                    <div className="student-role-badge">{student.roleBadge}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Premium Grid view of classes (No Left Sidebar) */
                <div className="classes-grid-container-view">
                    
                    <div className="classes-main-header">
                        <div className="header-text-block">
                            <h2>Không gian học tập</h2>
                            <p>Tương tác, trao đổi và theo dõi tiến độ của bạn tại các lớp học trực quan.</p>
                        </div>
                        <div className="header-action-button-block">
                            {isTeacher ? (
                                <button className="classes-primary-action-btn" onClick={() => setShowCreateModal(true)}>
                                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                                    Tạo lớp học mới
                                </button>
                            ) : (
                                <button className="classes-primary-action-btn" onClick={() => setShowJoinModal(true)}>
                                    <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '8px' }} />
                                    Tham gia lớp học
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid-loading-spinner-wrapper">
                            <div className="loading-dots">Đang tải danh sách lớp học</div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="classes-visual-empty-state">
                            <div className="empty-state-visual-circle">
                                <FontAwesomeIcon icon={faUsers} />
                            </div>
                            <h3>Không tìm thấy dữ liệu lớp học</h3>
                            <p>
                                {isTeacher ? "Bạn chưa tạo bất kỳ phòng học trực tuyến nào. Hãy tạo ngay một phòng học mới." : 
                                 "Bạn chưa được liên kết với lớp học nào. Hãy sử dụng mã code từ giảng viên để tham gia."}
                            </p>
                            {isTeacher ? (
                                <button onClick={() => setShowCreateModal(true)} className="empty-state-btn">Tạo lớp học ngay</button>
                            ) : (
                                <button onClick={() => setShowJoinModal(true)} className="empty-state-btn">Tham gia lớp học</button>
                            )}
                        </div>
                    ) : (
                        <div className="classes-modern-3d-grid">
                            {classes.map((cls, idx) => {
                                const colors = ['blue', 'yellow', 'green', 'purple', 'red'];
                                const cardColor = colors[idx % colors.length];
                                return (
                                    <div 
                                        key={cls.id} 
                                        className={`class-modern-card ${cardColor}`}
                                        onClick={() => { setSelectedClass(cls); setActiveSubTab('stream'); }}
                                    >
                                        <div className="card-glass-glow"></div>
                                        <div className="class-card-header-accent">
                                            <div className="teacher-avatar-overlay">
                                                {cls.teacherAvatar ? (
                                                    <img src={cls.teacherAvatar} alt="teacher" />
                                                ) : (
                                                    (cls.teacherName || 'G').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                        </div>
                                        <div className="class-card-body-content">
                                            <h3 className="card-class-title-text">{cls.name}</h3>
                                            <p className="card-class-teacher-text">🧑‍🏫 {cls.teacherName || "Giảng viên"}</p>
                                            
                                            <div className="card-class-code-row" onClick={(e) => e.stopPropagation()}>
                                                <span>Mã lớp: <strong>{cls.joinCode}</strong></span>
                                                <button className="code-copy-btn-tiny" onClick={() => copyToClipboard(cls.joinCode)} title="Copy mã lớp">
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="class-card-action-bar">
                                            <span className="action-text">Vào phòng học ➔</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* CREATE CLASS MODAL */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <h2>Tạo lớp học mới</h2>
                        <form onSubmit={handleCreateClass}>
                            <div className="form-group">
                                <label>Tên lớp học</label>
                                <input 
                                    type="text" 
                                    value={className} 
                                    onChange={(e) => setClassName(e.target.value)}
                                    placeholder="Ví dụ: Thiết kế Web nâng cao - Nhóm 2"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>Hủy</button>
                                <button type="submit" className="confirm-btn">Tạo phòng học</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* JOIN CLASS MODAL */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <h2>Tham gia lớp học</h2>
                        <form onSubmit={handleJoinClass}>
                            <div className="form-group">
                                <label>Mã tham gia lớp học</label>
                                <input 
                                    type="text" 
                                    value={joinCode} 
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="Nhập mã code gồm 6 ký tự số"
                                    maxLength="6"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowJoinModal(false)}>Hủy</button>
                                <button type="submit" className="confirm-btn">Tham gia lớp</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE POST MODAL */}
            {showPostModal && (
                <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
                    <div className="modal-content-custom" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Tạo bài đăng mới</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                <span style={{ fontSize: '13px', color: '#5f6368' }}>Đăng lên:</span>
                                <button 
                                    type="button"
                                    onClick={() => setShowClassSelector(!showClassSelector)}
                                    className="class-selector-dropdown-btn"
                                >
                                    <FontAwesomeIcon icon={faUsers} size="sm" style={{ color: 'var(--primary)' }} />
                                    {targetClassIds.length === 0 ? "Lớp hiện tại" : 
                                     targetClassIds.length === classes.length ? "Tất cả lớp" : 
                                     `${targetClassIds.length} lớp đã chọn`}
                                    <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
                                </button>

                                {showClassSelector && (
                                    <div className="class-selector-dropdown-panel">
                                        <div className="panel-header-row">
                                            <span>Chọn lớp học nhận tin</span>
                                            <button type="button" onClick={toggleAllClasses}>
                                                {targetClassIds.length === classes.length ? "Bỏ chọn" : "Tất cả"}
                                            </button>
                                        </div>
                                        <div className="panel-items-scroller">
                                            {classes.map(cls => (
                                                <div 
                                                    key={cls.id} 
                                                    onClick={() => toggleClassSelection(cls.id)}
                                                    className="panel-checkbox-item"
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={targetClassIds.includes(cls.id) || (targetClassIds.length === 0 && cls.id === selectedClass.id)}
                                                        readOnly
                                                    />
                                                    <span>{cls.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="panel-footer-row">
                                            <button type="button" onClick={() => setShowClassSelector(false)}>Xong</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleCreatePost}>
                            <div className="form-group">
                                <label>Loại bài đăng</label>
                                <select value={postType} onChange={(e) => setPostType(e.target.value)}>
                                    <option value="announcement">Thông báo thảo luận</option>
                                    <option value="material">Tài liệu học tập</option>
                                    <option value="assignment">Bài tập giao về nhà</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề bài đăng</label>
                                <input 
                                    type="text" 
                                    value={postTitle} 
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề cho bài viết..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung chi tiết</label>
                                <textarea 
                                    value={postContent} 
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="Viết nội dung thảo luận, hướng dẫn làm bài tập..."
                                    rows="4"
                                    required
                                ></textarea>
                            </div>

                            {postType === 'assignment' && (
                                <div className="form-group deadline-picker-group">
                                    <label>
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: 'var(--danger)' }} />
                                        Hạn nộp bài tập (Deadline)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={postDeadline}
                                        onChange={(e) => setPostDeadline(e.target.value)}
                                        className="deadline-input"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    {postDeadline && (
                                        <p className="deadline-preview-text">
                                            📅 Hạn nộp: {new Date(postDeadline).toLocaleString('vi-VN', {
                                                weekday: 'long', year: 'numeric', month: 'long',
                                                day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label>Tập tin đính kèm ({attachments.length})</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {attachments.map((att, index) => (
                                        <div key={index} className="modal-att-item">
                                            <FontAwesomeIcon icon={faFileAlt} className="att-icon" />
                                            <span>{att.fileName}</span>
                                            <button type="button" onClick={() => removeAttachment(index)} className="att-remove-btn">
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <label className="att-file-picker-label">
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFileChange} 
                                            style={{ display: 'none' }} 
                                            disabled={uploading}
                                        />
                                        <FontAwesomeIcon icon={uploading ? faPlus : faPaperclip} spin={uploading} />
                                        {uploading ? 'Đang upload tài liệu...' : 'Đính kèm tài liệu học tập (PDF, Slide, Word)'}
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowPostModal(false)}>Hủy</button>
                                <button type="submit" className="confirm-btn">Đăng bài ngay</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT POST MODAL */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditingPost(null); }}>
                    <div className="modal-content-custom" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <h2>Chỉnh sửa bài đăng</h2>
                        <form onSubmit={handleUpdatePost}>
                            <div className="form-group">
                                <label>Loại bài đăng</label>
                                <select value={postType} onChange={(e) => setPostType(e.target.value)}>
                                    <option value="announcement">Thông báo thảo luận</option>
                                    <option value="material">Tài liệu học tập</option>
                                    <option value="assignment">Bài tập giao về nhà</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề bài đăng</label>
                                <input 
                                    type="text" 
                                    value={postTitle} 
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề mới..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung chi tiết</label>
                                <textarea 
                                    value={postContent} 
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="Nhập nội dung mới..."
                                    rows="4"
                                    required
                                ></textarea>
                            </div>

                            {postType === 'assignment' && (
                                <div className="form-group deadline-picker-group">
                                    <label>
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: 'var(--danger)' }} />
                                        Hạn nộp bài tập (Deadline)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={postDeadline}
                                        onChange={(e) => setPostDeadline(e.target.value)}
                                        className="deadline-input"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label>Tập tin đính kèm ({attachments.length})</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {attachments.map((att, index) => (
                                        <div key={index} className="modal-att-item">
                                            <FontAwesomeIcon icon={faFileAlt} className="att-icon" />
                                            <span>{att.fileName}</span>
                                            <button type="button" onClick={() => removeAttachment(index)} className="att-remove-btn">
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <label className="att-file-picker-label">
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFileChange} 
                                            style={{ display: 'none' }} 
                                            disabled={uploading}
                                        />
                                        <FontAwesomeIcon icon={uploading ? faPlus : faPaperclip} spin={uploading} />
                                        {uploading ? 'Đang upload tài liệu...' : 'Đính kèm thêm tài liệu'}
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => { setShowEditModal(false); setEditingPost(null); }}>Hủy</button>
                                <button type="submit" className="confirm-btn">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Class;
