import React, { useState, useEffect } from 'react';
import logoImg from '../assets/img/logo.jpg';
import userAvatar from '../assets/img/user.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faThLarge, 
    faChartLine, 
    faQuestionCircle, 
    faEnvelope, 
    faCog,
    faLayerGroup,
    faFire,
    faSun,
    faMoon
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';

const TopNavbar = ({ userRole, activeTab, setActiveTab, unreadCount, session, userData, onLoginClick, theme, toggleTheme }) => {
    // role "0" là Student, "1" là Teacher, "2" là Admin
    const isTeacher = userRole === "1";
    const isAdmin = userRole === "2";
    const userDefaultAvatar = userData?.avatarUrl || userData?.avatar_url || session?.user?.user_metadata?.avatar_url || userAvatar;
    const userName = userData?.fullName || session?.user?.user_metadata?.full_name || 'Bạn';
    
    const [streak, setStreak] = useState(0);
    const [isActiveToday, setIsActiveToday] = useState(false);

    const checkIsToday = (dateData) => {
        if (!dateData) return false;
        if (Array.isArray(dateData)) {
            const d = new Date(dateData[0], dateData[1] - 1, dateData[2]);
            return d.toDateString() === new Date().toDateString();
        }
        return new Date(dateData).toDateString() === new Date().toDateString();
    };

    useEffect(() => {
        if (!session?.user?.id) return;

        const userId = session.user.id;

        const fetchStreak = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/streaks/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setStreak(data.streak);
                    setIsActiveToday(checkIsToday(data.lastActiveDate));
                }
            } catch (error) {
                console.error("Error fetching streak:", error);
            }
        };

        fetchStreak();

        // Tracker logic
        let activeTime = parseInt(localStorage.getItem(`activeTime_${userId}`)) || 0;
        const lastDate = localStorage.getItem(`lastActiveDate_${userId}`);
        const todayStr = new Date().toDateString();

        if (lastDate !== todayStr || activeTime >= 10000) {
            activeTime = 0;
            localStorage.setItem(`activeTime_${userId}`, 0);
            localStorage.setItem(`lastActiveDate_${userId}`, todayStr);
        }

        const interval = setInterval(() => {
            if (activeTime >= 10 * 1000) {
                clearInterval(interval);
                return;
            }

            activeTime += 1000; 
            localStorage.setItem(`activeTime_${userId}`, activeTime);

            if (activeTime === 10 * 1000) {
                updateStreak();
            }
        }, 1000); 

        const updateStreak = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/streaks/${userId}/update`, {
                    method: 'POST'
                });
                if (res.ok) {
                    const data = await res.json();
                    setStreak(data.streak);
                    setIsActiveToday(checkIsToday(data.lastActiveDate));
                }
            } catch (error) {
                console.error("Lỗi khi update streak:", error);
            }
        };

        return () => clearInterval(interval);

    }, [session]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="top-navbar">
            {/* Left branding */}
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('Dashboard')}>
                <img 
                    src={logoImg} 
                    alt="Logo" 
                    style={{ width: '34px', height: '34px', borderRadius: '8px' }} 
                />
                <span className="logo-text">E-Learning</span>
            </div>

            {/* Middle navigation menu */}
            {session && (
                <nav className="nav-menu">
                    {isAdmin ? (
                        <div 
                            className={`nav-menu-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Dashboard')}
                        >
                            <span className="icon"><FontAwesomeIcon icon={faThLarge} /></span>
                            <span className="label">Admin Panel</span>
                        </div>
                    ) : (
                        <>
                            <div 
                                className={`nav-menu-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Dashboard')}
                            >
                                <span className="icon"><FontAwesomeIcon icon={faThLarge} /></span>
                                <span className="label">Dashboard</span>
                            </div>
                            <div 
                                className={`nav-menu-item ${activeTab === 'Classes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Classes')}
                            >
                                <span className="icon"><FontAwesomeIcon icon={faLayerGroup} /></span>
                                <span className="label">Classes</span>
                            </div>
                            <div 
                                className={`nav-menu-item ${activeTab === 'Quizzes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Quizzes')}
                            >
                                <span className="icon"><FontAwesomeIcon icon={faQuestionCircle} /></span>
                                <span className="label">Quizzes</span>
                            </div>
                            {isTeacher && (
                                <div 
                                    className={`nav-menu-item ${activeTab === 'Statistics' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Statistics')}
                                >
                                    <span className="icon"><FontAwesomeIcon icon={faChartLine} /></span>
                                    <span className="label">Statistics</span>
                                </div>
                            )}
                            <div 
                                className={`nav-menu-item ${activeTab === 'Messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Messages')}
                            >
                                <span className="icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                                <span className="label">Messages</span>
                                {unreadCount > 0 && (
                                    <span className="unread-badge-inline">{unreadCount}</span>
                                )}
                            </div>
                        </>
                    )}
                </nav>
            )}

            {/* Right widgets */}
            <div className="navbar-right">
                {session && !isAdmin && (
                    <span 
                        className="streak-widget" 
                        title="Streak học tập của bạn" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            color: isActiveToday ? '#ff9800' : '#a8a29e', 
                            fontWeight: '800' 
                        }}
                    >
                        <span>{streak}</span> 
                        <FontAwesomeIcon icon={faFire} className={isActiveToday ? "fire-active" : ""} />
                    </span>
                )}
                
                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme} 
                    className="theme-toggle-btn"
                    title={theme === 'dark' ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
                >
                    <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                </button>

                {session ? (
                    <div className="user-avatar-wrapper">
                        <div className="avatar-dropdown-trigger">
                            <img 
                                src={userDefaultAvatar}
                                alt="User Avatar"
                                className="navbar-avatar"
                            />
                            <div className="avatar-dropdown-content">
                                <div className="dropdown-username">{userName}</div>
                                <div className="dropdown-divider"></div>
                                <button onClick={handleLogout} className="logout-button-custom">
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={onLoginClick}
                        className="navbar-login-btn"
                    >
                        Đăng nhập
                    </button>
                )}
            </div>
        </header>
    );
};

export default TopNavbar;
