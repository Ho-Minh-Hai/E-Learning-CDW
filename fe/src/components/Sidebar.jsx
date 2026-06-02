import React from 'react';
import logoImg from '../assets/img/logo.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faThLarge, 
    faChartLine, 
    faQuestionCircle, 
    faEnvelope, 
    faCog,
    faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ userRole, activeTab, setActiveTab, unreadCount }) => {
    // role "0" là Student, "1" là Teacher (dựa trên backend model User.java)
    const isTeacher = userRole === "1";

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="logo" onClick={() => setActiveTab('Dashboard')}>
                <img 
                    src={logoImg} 
                    alt="Logo" 
                    style={{ width: '34px', height: '34px', borderRadius: '8px' }} 
                />
                <span className="logo-text">E-Learning</span>
            </div>
            
            {/* Sidebar Menu */}
            <div className="sidebar-menu">
                <div 
                    className={`sidebar-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Dashboard')}
                >
                    <span className="icon"><FontAwesomeIcon icon={faThLarge} /></span>
                    <span className="label">Dashboard</span>
                </div>

                <div 
                    className={`sidebar-item ${activeTab === 'Classes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Classes')}
                >
                    <span className="icon"><FontAwesomeIcon icon={faLayerGroup} /></span>
                    <span className="label">Classes</span>
                </div>

                <div 
                    className={`sidebar-item ${activeTab === 'Quizzes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Quizzes')}
                >
                    <span className="icon"><FontAwesomeIcon icon={faQuestionCircle} /></span>
                    <span className="label">Quizzes</span>
                </div>

                {isTeacher && (
                    <div 
                        className={`sidebar-item ${activeTab === 'Statistics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Statistics')}
                    >
                        <span className="icon"><FontAwesomeIcon icon={faChartLine} /></span>
                        <span className="label">Statistics</span>
                    </div>
                )}

                <div 
                    className={`sidebar-item ${activeTab === 'Messages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Messages')}
                >
                    <span className="icon"><FontAwesomeIcon icon={faEnvelope} /></span> 
                    <span className="label">Messages</span>
                    {unreadCount > 0 && (
                        <span className="unread-badge-sidebar">{unreadCount}</span>
                    )}
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-item" style={{ cursor: 'pointer' }}>
                    <span className="icon"><FontAwesomeIcon icon={faCog} /></span>
                    <span className="label">Settings</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
