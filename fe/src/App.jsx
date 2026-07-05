import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import TopNavbar from './components/TopNavbar';
import ClassPage from './components/Class';
import Login from './auth/Login';
import Chat from './components/Chat';
import EQuizz from './components/EQuizz';
import Analytics from './components/Analytics';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './supabaseClient';

const getUrlNavigation = () => {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const allowedTabs = ['Dashboard', 'Classes', 'Messages', 'Quizzes', 'Statistics'];

  return {
    tab: allowedTabs.includes(tab) ? tab : null,
    id: params.get('id')
  };
};

const hasAuthCallbackParams = () => {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  return (
    params.has('code') ||
    params.has('error') ||
    params.has('error_description') ||
    hashParams.has('access_token') ||
    hashParams.has('refresh_token') ||
    hashParams.has('error') ||
    hashParams.has('error_description')
  );
};

const clearAuthCallbackUrl = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

function App() {
  const currentUserIdRef = useRef(null);
  const isFetchingRef = useRef(false);
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState(() => getUrlNavigation().tab || 'Dashboard');
  const [targetQuizId, setTargetQuizId] = useState(() => {
    const navigation = getUrlNavigation();
    return navigation.tab === 'Quizzes' ? navigation.id : null;
  });
  const [pendingConversation, setPendingConversation] = useState(null);

  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Áp dụng theme lên document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Kiểm tra session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        if (hasAuthCallbackParams()) {
          clearAuthCallbackUrl();
          setActiveTab('Dashboard');
          setTargetQuizId(null);
        }
        if (currentUserIdRef.current !== session.user.id) {
          fetchUserData(session.user);
          fetchUnreadCount(session.user.id);
        }
      } else {
        setLoadingUser(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        if (hasAuthCallbackParams()) {
          clearAuthCallbackUrl();
          setActiveTab('Dashboard');
          setTargetQuizId(null);
        }
        if (currentUserIdRef.current !== session.user.id) {
          fetchUserData(session.user);
          fetchUnreadCount(session.user.id);
        }
      } else {
        setUserRole(null);
        setUserData(null);
        setUnreadCount(0);
        setLoadingUser(false);
        currentUserIdRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch unread count periodically
  useEffect(() => {
    let interval;
    if (session) {
      interval = setInterval(() => {
        fetchUnreadCount(session.user.id);
      }, 10000); // Mỗi 10 giây
    }
    return () => clearInterval(interval);
  }, [session]);

  const fetchUnreadCount = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/unread-count/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const fetchUserData = async (user) => {
    if (isFetchingRef.current) return;
    if (currentUserIdRef.current === user.id && userData) {
      setLoadingUser(false);
      return;
    }
    isFetchingRef.current = true;
    currentUserIdRef.current = user.id;
    setLoadingUser(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          fullName: user.user_metadata.full_name || user.user_metadata.name,
          avatarUrl: user.user_metadata.avatar_url,
          lastSignInAt: user.last_sign_in_at,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role ? String(data.role) : null); 
        setUserData(data); // Lưu thông tin trả về từ supabase
        fetchClasses(user.id, data.role);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend login failed:", errorData.message || response.statusText);
        currentUserIdRef.current = null;
      }
    } catch (error) {
      console.error("Error syncing Supabase user with backend:", error);
      currentUserIdRef.current = null;
    } finally {
      setLoadingUser(false);
      isFetchingRef.current = false;
    }
  };

  const fetchClasses = async (userId, role) => {
    if (!userId) return;
    setIsLoadingClasses(true);
    try {
      const roleParam = role ? `?role=${role}` : '';
      const response = await fetch(`http://localhost:8080/api/classes/user/${userId}${roleParam}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching classes:", errorData.message || response.statusText);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleSwitchToMessages = (conversationId, otherUser) => {
    setPendingConversation({ conversationId, otherUser });
    setActiveTab('Messages');
  };

  const handleSetActiveTab = (tab) => {
    if (!session && tab !== 'Dashboard') {
      setActiveTab('Dashboard');
      return;
    }

    if (tab !== 'Quizzes') {
      setTargetQuizId(null);
    }

    setActiveTab(tab);
  };

  // Kiểm tra và buộc redirect về Dashboard nếu chưa đăng nhập
  useEffect(() => {
    if (!session) return;

    const navigation = getUrlNavigation();
    if (navigation.tab) {
      setActiveTab(navigation.tab);
      setTargetQuizId(navigation.tab === 'Quizzes' ? navigation.id : null);
    }
  }, [session]);

  return (
    <div className={`dashboard-container ${!session ? 'landing-mode-active' : ''}`}>
      {session ? (
        loadingUser ? (
          <div className="full-page-loading">
            <div className="loading-spinner-container"></div>
            <p>Đang tải thông tin tài khoản...</p>
          </div>
        ) : (
          <>
            <TopNavbar 
              userRole={userRole} 
              activeTab={activeTab} 
              unreadCount={unreadCount} 
              session={session}
              userData={userData}
            onLoginClick={() => setShowLogin(true)}
            theme={theme}
            toggleTheme={toggleTheme}
            setActiveTab={handleSetActiveTab} 
          />

          <div className={`main-wrapper ${activeTab === 'Messages' || activeTab === 'Classes' || activeTab === 'Quizzes' || activeTab === 'Statistics' ? 'no-padding' : ''}`}>
            {activeTab === 'Dashboard' ? (
              userRole === "2" ? (
                <AdminDashboard 
                  session={session} 
                  userData={userData} 
                  setActiveTab={handleSetActiveTab} 
                />
              ) : userRole === "1" ? (
                <TeacherDashboard 
                  session={session} 
                  classes={classes} 
                  setActiveTab={handleSetActiveTab} 
                  setSelectedClass={setSelectedClass}
                  userData={userData}
                  onProfileUpdate={() => fetchUserData(session.user)}
                />
              ) : (
                <StudentDashboard 
                  session={session} 
                  classes={classes} 
                  setActiveTab={handleSetActiveTab} 
                  setSelectedClass={setSelectedClass}
                  userData={userData}
                  onProfileUpdate={() => fetchUserData(session.user)}
                />
              )
            ) : activeTab === 'Classes' ? (
              <ClassPage 
                session={session} 
                userRole={userRole} 
                userData={userData}
                classes={classes}
                setClasses={setClasses}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                onSwitchToMessages={handleSwitchToMessages}
              />
            ) : activeTab === 'Messages' ? (
              <Chat 
                session={session} 
                userData={userData} 
                pendingConversation={pendingConversation} 
                refreshUnreadCount={() => fetchUnreadCount(session.user.id)} 
              />
            ) : activeTab === 'Quizzes' ? (
              <EQuizz 
                session={session} 
                userRole={userRole} 
                classes={classes}
                isLoadingClasses={isLoadingClasses}
                targetQuizId={targetQuizId}
              />
            ) : activeTab === 'Statistics' ? (
              <Analytics 
                session={session}
                classes={classes}
                onSwitchToMessages={handleSwitchToMessages}
              />
            ) : (
              userRole === "2" ? (
                <AdminDashboard 
                  session={session} 
                  userData={userData} 
                  setActiveTab={handleSetActiveTab} 
                />
              ) : userRole === "1" ? (
                <TeacherDashboard 
                  session={session} 
                  classes={classes} 
                  setActiveTab={handleSetActiveTab} 
                  setSelectedClass={setSelectedClass}
                  userData={userData}
                  onProfileUpdate={() => fetchUserData(session.user)}
                />
              ) : (
                <StudentDashboard 
                  session={session} 
                  classes={classes} 
                  setActiveTab={handleSetActiveTab} 
                  setSelectedClass={setSelectedClass}
                  userData={userData}
                  onProfileUpdate={() => fetchUserData(session.user)}
                />
              )
            )}
          </div>
        </>
      )) : (
        <Login theme={theme} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

export default App;
