import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faLayerGroup,
    faComments,
    faFileAlt,
    faTrash,
    faUserShield,
    faSearch,
    faSpinner,
    faExclamationTriangle,
    faCalendarAlt,
    faUniversity,
    faCheckCircle,
    faInfoCircle,
    faClock,
    faBan
} from '@fortawesome/free-solid-svg-icons';
import './AdminDashboard.css';

const AdminDashboard = ({ session, userData, setActiveTab }) => {
    const isMounted = useRef(false);
    const [activeSubTab, setActiveSubTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClasses: 0,
        totalPosts: 0,
        totalComments: 0
    });
    
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [comments, setComments] = useState([]);
    const [posts, setPosts] = useState([]);
    const [overviewLogTab, setOverviewLogTab] = useState('posts');
    const [bannedKeywords, setBannedKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [keywordSearch, setKeywordSearch] = useState('');

    // Loading states
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Search filters
    const [userSearch, setUserSearch] = useState('');
    const [classSearch, setClassSearch] = useState('');
    const [commentSearch, setCommentSearch] = useState('');
    const [postSearch, setPostSearch] = useState('');

    // Notification toast
    const [toast, setToast] = useState(null);

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        isDanger: false
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                console.error("Failed to fetch admin stats:", res.status);
                showToast(`Không thể tải số liệu thống kê (Mã lỗi: ${res.status})`, 'error');
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
            showToast("Có lỗi xảy ra khi tải số liệu thống kê", 'error');
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchData = async () => {
        setLoadingData(true);
        try {
            let endpoint = '';
            if (activeSubTab === 'users') endpoint = 'users';
            else if (activeSubTab === 'classes') endpoint = 'classes';
            else if (activeSubTab === 'comments') endpoint = 'comments';
            else if (activeSubTab === 'posts') endpoint = 'posts';
            else if (activeSubTab === 'banned-keywords') endpoint = 'banned-keywords';

            if (!endpoint) return;

            const res = await fetch(`http://localhost:8080/api/admin/${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                if (activeSubTab === 'users') setUsers(data);
                else if (activeSubTab === 'classes') setClasses(data);
                else if (activeSubTab === 'comments') setComments(data);
                else if (activeSubTab === 'posts') setPosts(data);
                else if (activeSubTab === 'banned-keywords') setBannedKeywords(data);
            } else {
                showToast(`Không thể tải dữ liệu ${endpoint} (Mã lỗi: ${res.status})`, 'error');
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            showToast("Có lỗi xảy ra khi tải dữ liệu", 'error');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true);
            try {
                const [statsRes, postsRes, commentsRes, usersRes, classesRes] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/stats'),
                    fetch('http://localhost:8080/api/admin/posts'),
                    fetch('http://localhost:8080/api/admin/comments'),
                    fetch('http://localhost:8080/api/admin/users'),
                    fetch('http://localhost:8080/api/admin/classes')
                ]);

                // Detailed error checking and logging
                const failedEndpoints = [];
                if (!statsRes.ok) failedEndpoints.push(`stats (${statsRes.status})`);
                if (!postsRes.ok) failedEndpoints.push(`posts (${postsRes.status})`);
                if (!commentsRes.ok) failedEndpoints.push(`comments (${commentsRes.status})`);
                if (!usersRes.ok) failedEndpoints.push(`users (${usersRes.status})`);
                if (!classesRes.ok) failedEndpoints.push(`classes (${classesRes.status})`);

                if (failedEndpoints.length > 0) {
                    console.error("Failed to fetch admin endpoints:", failedEndpoints.join(", "));
                    showToast(`Không thể tải dữ liệu: ${failedEndpoints.join(", ")}`, 'error');
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
                
                if (postsRes.ok && commentsRes.ok) {
                    const postsData = await postsRes.json();
                    const commentsData = await commentsRes.json();
                    setPosts(postsData);
                    setComments(commentsData);
                }

                if (usersRes.ok && classesRes.ok) {
                    const usersData = usersRes.ok ? await usersRes.json() : [];
                    const classesData = classesRes.ok ? await classesRes.json() : [];
                    setUsers(usersData);
                    setClasses(classesData);
                }
            } catch (err) {
                console.error("Error loading initial admin data:", err);
                showToast("Có lỗi xảy ra khi tải dữ liệu hệ thống", 'error');
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchOverviewLogs = async () => {
        setLoadingData(true);
        try {
            const [postsRes, commentsRes] = await Promise.all([
                fetch('http://localhost:8080/api/admin/posts'),
                fetch('http://localhost:8080/api/admin/comments')
            ]);
            if (postsRes.ok && commentsRes.ok) {
                const postsData = await postsRes.json();
                const commentsData = await commentsRes.json();
                setPosts(postsData);
                setComments(commentsData);
            } else {
                const failed = [];
                if (!postsRes.ok) failed.push(`posts (${postsRes.status})`);
                if (!commentsRes.ok) failed.push(`comments (${commentsRes.status})`);
                showToast(`Không thể tải nhật ký hệ thống: ${failed.join(", ")}`, 'error');
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
            showToast("Có lỗi xảy ra khi tải nhật ký", 'error');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        if (activeSubTab !== 'overview') {
            fetchData();
        } else {
            fetchStats();
            fetchOverviewLogs();
        }
    }, [activeSubTab]);

    // Handle user role update
    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
                showToast("Cập nhật vai trò thành công!");
                fetchStats();
            } else {
                showToast("Không thể cập nhật vai trò", 'error');
            }
        } catch (err) {
            console.error("Error changing role:", err);
            showToast("Có lỗi xảy ra", 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Generic delete handler with modal confirmation
    const triggerDelete = (id, type, nameDetail) => {
        let title = '';
        let message = '';
        let confirmFn = null;

        if (type === 'user') {
            title = 'Xác nhận xóa Người dùng';
            message = `Bạn có chắc chắn muốn xóa người dùng "${nameDetail}"? Hành động này sẽ XÓA TOÀN BỘ lớp học do người này dạy, các bài đăng, bình luận, tin nhắn, và điểm số liên quan. Đây là hành động không thể hoàn tác!`;
            confirmFn = () => deleteUser(id);
        } else if (type === 'class') {
            title = 'Xác nhận xóa Lớp học';
            message = `Bạn có chắc chắn muốn xóa lớp học "${nameDetail}"? Hành động này sẽ XÓA TOÀN BỘ bài đăng, câu hỏi, điểm thi, bài nộp và danh sách thành viên của lớp này.`;
            confirmFn = () => deleteClass(id);
        } else if (type === 'comment') {
            title = 'Xác nhận xóa Bình luận';
            message = `Bạn có chắc chắn muốn xóa bình luận này? Nội dung: "${nameDetail}"`;
            confirmFn = () => deleteComment(id);
        } else if (type === 'post') {
            title = 'Xác nhận xóa Bài đăng';
            message = `Bạn có chắc chắn muốn xóa bài đăng "${nameDetail}"? Việc này cũng sẽ xóa toàn bộ bình luận và tệp bài nộp đi kèm.`;
            confirmFn = () => deletePost(id);
        } else if (type === 'banned-keyword') {
            title = 'Xác nhận xóa Từ khóa cấm';
            message = `Bạn có chắc chắn muốn xóa từ khóa cấm "${nameDetail}"? Từ khóa này sẽ có thể được sử dụng lại trong bài đăng và bình luận.`;
            confirmFn = () => deleteBannedKeyword(id);
        }

        setConfirmModal({
            show: true,
            title,
            message,
            onConfirm: confirmFn,
            isDanger: true
        });
    };

    const deleteUser = async (userId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                showToast("Đã xóa người dùng thành công");
                fetchStats();
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.message || "Xóa người dùng thất bại", 'error');
            }
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra", 'error');
        } finally {
            setActionLoading(false);
            closeConfirmModal();
        }
    };

    const deleteClass = async (classId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/classes/${classId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setClasses(prev => prev.filter(c => c.id !== classId));
                showToast("Đã xóa lớp học thành công");
                fetchStats();
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.message || "Xóa lớp học thất bại", 'error');
            }
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra", 'error');
        } finally {
            setActionLoading(false);
            closeConfirmModal();
        }
    };

    const deleteComment = async (commentId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/comments/${commentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
                showToast("Đã xóa bình luận thành công");
                fetchStats();
            } else {
                showToast("Xóa bình luận thất bại", 'error');
            }
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra", 'error');
        } finally {
            setActionLoading(false);
            closeConfirmModal();
        }
    };

    const deletePost = async (postId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/posts/${postId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                showToast("Đã xóa bài đăng thành công");
                fetchStats();
            } else {
                showToast("Xóa bài đăng thất bại", 'error');
            }
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra", 'error');
        } finally {
            setActionLoading(false);
            closeConfirmModal();
        }
    };

    const deleteBannedKeyword = async (id) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/banned-keywords/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setBannedKeywords(prev => prev.filter(k => k.id !== id));
                showToast("Đã xóa từ khóa cấm thành công");
                fetchStats();
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.message || "Xóa từ khóa cấm thất bại", 'error');
            }
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra", 'error');
        } finally {
            setActionLoading(false);
            closeConfirmModal();
        }
    };

    const handleAddKeyword = async (e) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;

        setActionLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/banned-keywords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keyword: newKeyword.trim() })
            });

            if (res.ok) {
                const data = await res.json();
                setBannedKeywords(prev => [...prev, data]);
                setNewKeyword('');
                showToast("Thêm từ khóa cấm thành công!");
                fetchStats();
            } else {
                const errData = await res.json().catch(() => ({}));
                showToast(errData.message || "Không thể thêm từ khóa cấm", 'error');
            }
        } catch (err) {
            console.error("Error adding keyword:", err);
            showToast("Có lỗi xảy ra khi thêm từ khóa cấm", 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            show: false,
            title: '',
            message: '',
            onConfirm: null,
            isDanger: false
        });
    };

    // Filter logic
    const filteredUsers = users.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.school && u.school.toLowerCase().includes(userSearch.toLowerCase()))
    );

    const filteredClasses = classes.filter(c => 
        (c.name && c.name.toLowerCase().includes(classSearch.toLowerCase())) ||
        (c.joinCode && c.joinCode.toLowerCase().includes(classSearch.toLowerCase())) ||
        (c.teacherName && c.teacherName.toLowerCase().includes(classSearch.toLowerCase()))
    );

    const filteredComments = comments.filter(c => 
        (c.content && c.content.toLowerCase().includes(commentSearch.toLowerCase())) ||
        (c.userName && c.userName.toLowerCase().includes(commentSearch.toLowerCase())) ||
        (c.postTitle && c.postTitle.toLowerCase().includes(commentSearch.toLowerCase()))
    );

    const filteredPosts = posts.filter(p => 
        (p.title && p.title.toLowerCase().includes(postSearch.toLowerCase())) ||
        (p.content && p.content.toLowerCase().includes(postSearch.toLowerCase())) ||
        (p.authorName && p.authorName.toLowerCase().includes(postSearch.toLowerCase())) ||
        (p.className && p.className.toLowerCase().includes(postSearch.toLowerCase()))
    );

    const filteredBannedKeywords = bannedKeywords.filter(k => 
        k.keyword && k.keyword.toLowerCase().includes(keywordSearch.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa ghi nhận';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="admin-dashboard-container">
            {/* Toast message notification */}
            {toast && (
                <div className={`admin-toast ${toast.type}`}>
                    <FontAwesomeIcon icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} />
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-box">
                        <div className="modal-header">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
                            <h3>{confirmModal.title}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{confirmModal.message}</p>
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeConfirmModal} className="btn-cancel" disabled={actionLoading}>Hủy</button>
                            <button onClick={confirmModal.onConfirm} className={`btn-confirm ${confirmModal.isDanger ? 'danger' : ''}`} disabled={actionLoading}>
                                {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar navigation */}
            <div className="admin-sidebar">
                <div className="admin-profile-section">
                    <img src={userData?.avatarUrl || userData?.avatar_url || 'https://via.placeholder.com/150'} alt="Admin Avatar" className="admin-avatar" />
                    <div className="admin-info">
                        <h4>{userData?.fullName || 'Administrator'}</h4>
                        <span className="admin-badge">Hệ Thống Admin</span>
                    </div>
                </div>

                <ul className="admin-nav-list">
                    <li className={activeSubTab === 'overview' ? 'active' : ''} onClick={() => setActiveSubTab('overview')}>
                        <FontAwesomeIcon icon={faUserShield} className="nav-icon" />
                        <span>Tổng quan hệ thống</span>
                    </li>
                    <li className={activeSubTab === 'users' ? 'active' : ''} onClick={() => setActiveSubTab('users')}>
                        <FontAwesomeIcon icon={faUsers} className="nav-icon" />
                        <span>Quản lý thành viên</span>
                    </li>
                    <li className={activeSubTab === 'classes' ? 'active' : ''} onClick={() => setActiveSubTab('classes')}>
                        <FontAwesomeIcon icon={faLayerGroup} className="nav-icon" />
                        <span>Quản lý lớp học</span>
                    </li>
                    <li className={activeSubTab === 'banned-keywords' ? 'active' : ''} onClick={() => setActiveSubTab('banned-keywords')}>
                        <FontAwesomeIcon icon={faBan} className="nav-icon" />
                        <span>Từ khóa cấm</span>
                    </li>
                </ul>
            </div>

            {/* Main content area */}
            <div className="admin-content">
                {activeSubTab === 'overview' && (
                    <div className="admin-overview-tab">
                        <div className="welcome-banner">
                            <h2>Chào mừng trở lại quản trị viên, {userData?.fullName}!</h2>
                            <p>Đây là khu vực quản trị tối cao của hệ thống. Bạn có toàn quyền theo dõi số liệu, quản lý thành viên, kiểm duyệt các bài viết và bình luận trên hệ thống.</p>
                        </div>

                        {loadingStats ? (
                            <div className="admin-loading-spinner">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                <p>Đang tải dữ liệu thống kê...</p>
                            </div>
                        ) : (
                            <div className="admin-stats-grid">
                                <div className="stat-card blue" onClick={() => setActiveSubTab('users')}>
                                    <div className="stat-icon">
                                        <FontAwesomeIcon icon={faUsers} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats.totalUsers}</h3>
                                        <p>Tổng thành viên</p>
                                    </div>
                                </div>

                                <div className="stat-card green" onClick={() => setActiveSubTab('classes')}>
                                    <div className="stat-icon">
                                        <FontAwesomeIcon icon={faLayerGroup} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats.totalClasses}</h3>
                                        <p>Lớp học hoạt động</p>
                                    </div>
                                </div>

                                <div className="stat-card purple" onClick={() => {
                                    setOverviewLogTab('posts');
                                    document.getElementById('admin-logs-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}>
                                    <div className="stat-icon">
                                        <FontAwesomeIcon icon={faFileAlt} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats.totalPosts}</h3>
                                        <p>Tổng bài viết đăng</p>
                                    </div>
                                </div>

                                <div className="stat-card orange" onClick={() => {
                                    setOverviewLogTab('comments');
                                    document.getElementById('admin-logs-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}>
                                    <div className="stat-icon">
                                        <FontAwesomeIcon icon={faComments} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats.totalComments}</h3>
                                        <p>Bình luận đã gửi</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="admin-quick-links-section">
                            <h3>Lưu ý quan trọng dành cho quản trị viên</h3>
                            <div className="alert-box-info">
                                <FontAwesomeIcon icon={faInfoCircle} className="alert-icon" />
                                <p><strong>Lưu ý về cascading:</strong> Khi thực hiện hành động xóa Lớp học hoặc xóa Người dùng, hệ thống sẽ thực hiện dọn dẹp liên kết sâu ở mức cao nhất (deep cascade deletion) để tránh lỗi dữ liệu khóa ngoại. Vui lòng cân nhắc kỹ trước khi xóa.</p>
                            </div>
                        </div>

                        {/* Nhật ký hoạt động hệ thống */}
                        <div id="admin-logs-section" className="admin-logs-container">
                            <div className="logs-header-section">
                                <h3 className="logs-section-title">
                                    <FontAwesomeIcon icon={faClock} className="icon-margin" />
                                    Nhật ký hoạt động hệ thống
                                </h3>
                                <div className="logs-tab-buttons">
                                    <button 
                                        className={`log-btn ${overviewLogTab === 'posts' ? 'active' : ''}`}
                                        onClick={() => setOverviewLogTab('posts')}
                                    >
                                        <FontAwesomeIcon icon={faFileAlt} /> Bài viết
                                    </button>
                                    <button 
                                        className={`log-btn ${overviewLogTab === 'comments' ? 'active' : ''}`}
                                        onClick={() => setOverviewLogTab('comments')}
                                    >
                                        <FontAwesomeIcon icon={faComments} /> Bình luận
                                    </button>
                                </div>
                            </div>

                            {overviewLogTab === 'posts' ? (
                                <div className="admin-data-tab logs-embedded">
                                    <div className="tab-header">
                                        <h2>Nhật ký bài viết trong lớp học</h2>
                                        <div className="search-box">
                                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Tìm theo tiêu đề, tác giả, tên lớp..." 
                                                value={postSearch} 
                                                onChange={(e) => setPostSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {loadingData ? (
                                        <div className="admin-loading-spinner">
                                            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                            <p>Đang tải danh sách bài viết...</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive-container">
                                            <table className="admin-data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Bài viết</th>
                                                        <th>Loại</th>
                                                        <th>Lớp học</th>
                                                        <th>Người đăng</th>
                                                        <th>Ngày tạo</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredPosts.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="no-data-cell">Không tìm thấy bài đăng nào</td>
                                                        </tr>
                                                    ) : (
                                                        filteredPosts.map(post => (
                                                            <tr key={post.id}>
                                                                <td className="post-content-cell">
                                                                    <div className="post-title-text">{post.title || 'Không có tiêu đề'}</div>
                                                                    <div className="post-body-snippet">{post.content ? (post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content) : '(Không có nội dung)'}</div>
                                                                </td>
                                                                <td>
                                                                    <span className={`post-type-badge ${post.type}`}>
                                                                        {post.type === 'announcement' ? 'Thông báo' : post.type === 'material' ? 'Tài liệu' : 'Bài tập'}
                                                                    </span>
                                                                </td>
                                                                <td className="bold-cell">{post.className || 'Lớp đã bị xóa'}</td>
                                                                <td>
                                                                    <div className="author-name">{post.authorName || 'Chưa rõ'}</div>
                                                                    <div className="sub-info">{post.authorEmail}</div>
                                                                </td>
                                                                <td>{formatDate(post.createdAt)}</td>
                                                                <td>
                                                                    <button 
                                                                        className="btn-action-delete"
                                                                        onClick={() => triggerDelete(post.id, 'post', post.title || 'Không có tiêu đề')}
                                                                        title="Xóa bài viết"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="admin-data-tab logs-embedded">
                                    <div className="tab-header">
                                        <h2>Nhật ký bình luận trên hệ thống</h2>
                                        <div className="search-box">
                                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Tìm theo nội dung, người viết, tên bài đăng..." 
                                                value={commentSearch} 
                                                onChange={(e) => setCommentSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {loadingData ? (
                                        <div className="admin-loading-spinner">
                                            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                            <p>Đang tải danh sách bình luận...</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive-container">
                                            <table className="admin-data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Bình luận</th>
                                                        <th>Người viết</th>
                                                        <th>Bài đăng thuộc về</th>
                                                        <th>Lớp học</th>
                                                        <th>Ngày đăng</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredComments.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="no-data-cell">Không tìm thấy bình luận nào</td>
                                                        </tr>
                                                    ) : (
                                                        filteredComments.map(comment => (
                                                            <tr key={comment.id}>
                                                                <td className="comment-content-cell">{comment.content}</td>
                                                                <td>
                                                                    <div className="comment-author-name">{comment.userName || 'Không rõ'}</div>
                                                                    <div className="sub-info">{comment.userEmail}</div>
                                                                </td>
                                                                <td className="post-ref-cell">{comment.postTitle || 'Bài đăng đã bị xóa'}</td>
                                                                <td className="bold-cell">{comment.className || 'Lớp đã bị xóa'}</td>
                                                                <td>{formatDate(comment.createdAt)}</td>
                                                                <td>
                                                                    <button 
                                                                        className="btn-action-delete"
                                                                        onClick={() => triggerDelete(comment.id, 'comment', comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content)}
                                                                        title="Xóa bình luận"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSubTab === 'users' && (
                    <div className="admin-data-tab">
                        <div className="tab-header">
                            <h2>Quản lý thành viên hệ thống</h2>
                            <div className="search-box">
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm theo tên, email, trường học..." 
                                    value={userSearch} 
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {loadingData ? (
                            <div className="admin-loading-spinner">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                <p>Đang tải danh sách thành viên...</p>
                            </div>
                        ) : (
                            <div className="table-responsive-container">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Thành viên</th>
                                            <th>Email</th>
                                            <th>Trường học</th>
                                            <th>Vai trò</th>
                                            <th>Đăng nhập cuối</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="no-data-cell">Không tìm thấy thành viên phù hợp</td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td className="user-profile-cell">
                                                        <img src={user.avatarUrl || 'https://via.placeholder.com/150'} alt={user.fullName} className="table-avatar" />
                                                        <span className="user-name-text">{user.fullName || 'Chưa cập nhật'}</span>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td className="school-cell">
                                                        <FontAwesomeIcon icon={faUniversity} className="icon-sub" />
                                                        {user.school || 'Chưa cập nhật'}
                                                    </td>
                                                    <td>
                                                        <select 
                                                            className={`role-select role-${user.role}`}
                                                            value={user.role} 
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                            disabled={actionLoading || user.id === session.user.id}
                                                        >
                                                            <option value="0">Học sinh</option>
                                                            <option value="1">Giảng viên</option>
                                                            <option value="2">Quản trị viên</option>
                                                        </select>
                                                    </td>
                                                    <td>{formatDate(user.lastSignInAt)}</td>
                                                    <td>
                                                        <button 
                                                            className="btn-action-delete"
                                                            onClick={() => triggerDelete(user.id, 'user', user.fullName || user.email)}
                                                            disabled={user.id === session.user.id}
                                                            title={user.id === session.user.id ? "Không thể tự xóa chính mình" : "Xóa người dùng khỏi hệ thống"}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeSubTab === 'classes' && (
                    <div className="admin-data-tab">
                        <div className="tab-header">
                            <h2>Quản lý danh sách lớp học</h2>
                            <div className="search-box">
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm lớp học, mã code, tên giáo viên..." 
                                    value={classSearch} 
                                    onChange={(e) => setClassSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {loadingData ? (
                            <div className="admin-loading-spinner">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                <p>Đang tải danh sách lớp học...</p>
                            </div>
                        ) : (
                            <div className="table-responsive-container">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Tên lớp học</th>
                                            <th>Mã tham gia</th>
                                            <th>Giảng viên</th>
                                            <th>Sĩ số</th>
                                            <th>Ngày tạo</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClasses.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="no-data-cell">Không tìm thấy lớp học nào</td>
                                            </tr>
                                        ) : (
                                            filteredClasses.map(cls => (
                                                <tr key={cls.id}>
                                                    <td className="bold-cell">{cls.name}</td>
                                                    <td><span className="join-code-badge">{cls.joinCode}</span></td>
                                                    <td>
                                                        <div>
                                                            <div className="teacher-name">{cls.teacherName || 'Không tìm thấy'}</div>
                                                            <div className="sub-info">{cls.teacherEmail}</div>
                                                        </div>
                                                    </td>
                                                    <td className="student-count-cell">{cls.studentCount} học sinh</td>
                                                    <td>
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="icon-sub" />
                                                        {formatDate(cls.createdAt)}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn-action-delete"
                                                            onClick={() => triggerDelete(cls.id, 'class', cls.name)}
                                                            title="Xóa lớp học khỏi hệ thống"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeSubTab === 'banned-keywords' && (
                    <div className="admin-data-tab">
                        <div className="tab-header">
                            <h2>Quản lý từ khóa cấm</h2>
                            <div className="search-box">
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm từ khóa..." 
                                    value={keywordSearch} 
                                    onChange={(e) => setKeywordSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="add-keyword-container">
                            <form onSubmit={handleAddKeyword} className="add-keyword-form">
                                <input 
                                    type="text" 
                                    placeholder="Nhập từ khóa cấm mới..." 
                                    value={newKeyword} 
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    disabled={actionLoading}
                                    className="keyword-input"
                                />
                                <button type="submit" className="btn-add-keyword" disabled={actionLoading}>
                                    {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Thêm từ khóa'}
                                </button>
                            </form>
                        </div>

                        {loadingData ? (
                            <div className="admin-loading-spinner">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                <p>Đang tải danh sách từ khóa cấm...</p>
                            </div>
                        ) : (
                            <div className="table-responsive-container">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Từ khóa cấm</th>
                                            <th>Ngày tạo</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBannedKeywords.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="no-data-cell">Không tìm thấy từ khóa nào</td>
                                            </tr>
                                        ) : (
                                            filteredBannedKeywords.map(item => (
                                                <tr key={item.id}>
                                                    <td className="bold-cell font-monospace">{item.keyword}</td>
                                                    <td>
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="icon-sub" />
                                                        {formatDate(item.createdAt)}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn-action-delete"
                                                            onClick={() => triggerDelete(item.id, 'banned-keyword', item.keyword)}
                                                            title="Xóa từ khóa khỏi danh sách cấm"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
