import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBookOpen, 
    faGraduationCap, 
    faClipboardList,
    faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import { UNIVERSITIES } from '../constants/universities';

const TeacherDashboard = ({ session, classes, setActiveTab, setSelectedClass, userData, onProfileUpdate }) => {
    const [teacherStats, setTeacherStats] = useState({
        totalClasses: 0,
        totalExercises: 0,
        ungradedAssignments: 0,
        todaySubmissions: 0
    });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editData, setEditData] = useState({
        full_name: userData?.full_name || userData?.fullName || '',
        school: userData?.school || ''
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetchTeacherStats();
        }
    }, [session, classes]);

    useEffect(() => {
        setEditData({
            full_name: userData?.full_name || userData?.fullName || '',
            school: userData?.school || ''
        });
    }, [userData]);

    const fetchTeacherStats = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/stats/teacher/${session.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setTeacherStats(data);
            }
        } catch (error) {
            console.error('Error fetching teacher stats:', error);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'E-Learning');

            const res = await fetch(`https://api.cloudinary.com/v1_1/dye7dfp5s/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
            
            const imageUrl = data.secure_url;

            const updateResponse = await fetch(`http://localhost:8080/api/auth/users/${session.user.id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarUrl: imageUrl })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Update avatar failed');
            }

            await supabase.auth.updateUser({
                data: { avatar_url: imageUrl }
            });

            if (onProfileUpdate) onProfileUpdate();
        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const updateResponse = await fetch(`http://localhost:8080/api/auth/users/${session.user.id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: editData.full_name,
                    school: editData.school
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Update profile failed');
            }

            await supabase.auth.updateUser({
                data: { full_name: editData.full_name }
            });

            setIsEditing(false);
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Calendar logic
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startDay = (firstDayOfMonth(y, m) + 6) % 7;

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<span key={`empty-${i}`} className="day-cell empty"></span>);
    for (let i = 1; i <= daysInMonth(y, m); i++) {
        const dateObj = new Date(y, m, i);
        const isActive = selectedDate.toDateString() === dateObj.toDateString();
        days.push(
            <span 
                key={i} 
                className={`day-cell ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedDate(dateObj)}
            >
                {i}
            </span>
        );
    }

    return (
        <div className="app-dashboard-grid">
            {/* ROW 1: Hero & Profile */}
            <div className="dashboard-row-split">
                {/* Hero Banner (2/3 width) */}
                <div className="dashboard-col-2-3">
                    <div className="welcome-hero-card">
                        <h2>Chào mừng trở lại, thầy/cô {userData?.full_name || userData?.fullName || 'giảng viên'}!</h2>
                        <p>Chào mừng thầy cô quay lại bục giảng trực tuyến. Hãy kiểm tra các bài nộp mới hôm nay để phản hồi kịp thời cho học sinh nhé!</p>
                    </div>
                </div>

                {/* Profile Hub (1/3 width) */}
                <div className="dashboard-col-1-3">
                    <div className="profile-hub-card">
                        <div className="profile-hub-avatar-wrapper">
                            <img src={userData?.avatar_url || userData?.avatarUrl} alt="Avatar" className="profile-hub-avatar" />
                            <input type="file" id="teacher-profile-hub-avatar-upload" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                        </div>
                        <div className="profile-hub-details">
                            <div className="profile-hub-role-badge">Giảng viên</div>
                            {isEditing ? (
                                <input className="edit-input" style={{ padding: '6px 10px', fontSize: '13px', marginTop: '4px' }} value={editData.full_name} onChange={(e) => setEditData({...editData, full_name: e.target.value})} />
                            ) : (
                                <h3 className="profile-hub-name">{userData?.full_name || userData?.fullName || 'Giảng viên'}</h3>
                            )}
                            <p className="profile-hub-email">{userData?.email}</p>
                            
                            {isEditing ? (
                                <select className="edit-input" style={{ padding: '6px 10px', fontSize: '13px', marginTop: '4px' }} value={editData.school} onChange={(e) => setEditData({...editData, school: e.target.value})}>
                                    <option value="">Chọn trường đại học</option>
                                    {UNIVERSITIES.map((uni, idx) => <option key={idx} value={uni}>{uni}</option>)}
                                </select>
                            ) : (
                                <p className="profile-hub-school">🏫 {userData?.school || 'Chưa cập nhật trường'}</p>
                            )}

                            <div className="profile-hub-actions">
                                <button onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true); }} disabled={isSaving} className="profile-hub-btn edit">
                                    {isSaving ? 'Đang lưu...' : (isEditing ? 'Lưu' : 'Chỉnh sửa')}
                                </button>
                                {isEditing && <button onClick={() => setIsEditing(false)} className="profile-hub-btn cancel">Hủy</button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: Overview Metrics */}
            <section className="overview">
                <div className="section-header"><h2>Chỉ số giảng dạy</h2></div>
                <div className="overview-cards">
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faBookOpen} /></div>
                        <div className="overview-card-info">
                            <h3>{teacherStats.totalClasses}</h3>
                            <p>Lớp học</p>
                        </div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faGraduationCap} /></div>
                        <div className="overview-card-info">
                            <h3>{teacherStats.totalExercises}</h3>
                            <p>Bài tập đã tạo</p>
                        </div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faClipboardList} /></div>
                        <div className="overview-card-info">
                            <h3>{teacherStats.ungradedAssignments}</h3>
                            <p>Bài chưa chấm</p>
                        </div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faCalendarCheck} /></div>
                        <div className="overview-card-info">
                            <h3>{teacherStats.todaySubmissions}</h3>
                            <p>Nộp hôm nay</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROW 3: Calendar & Actions */}
            <div className="dashboard-row-split">
                {/* Academic Calendar (1/2 width) */}
                <div className="dashboard-col-1-2">
                    <div className="calendar-planner-card" style={{ height: '100%' }}>
                        <div className="planner-calendar-side">
                            <div className="calendar-header">
                                <button onClick={handlePrevMonth}>&lt;</button>
                                <span>{monthNames[m]} {y}</span>
                                <button onClick={handleNextMonth}>&gt;</button>
                            </div>
                            <div className="calendar-grid">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                                {days}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Toolkit (1/2 width) */}
                <div className="dashboard-col-1-2">
                    <div className="calendar-planner-card" style={{ height: '100%', justifyContent: 'center' }}>
                        <h4 style={{ margin: '0 0 16px', fontFamily: 'var(--font-title)', fontWeight: '800', fontSize: '16px' }}>Hộp công cụ Giảng viên (Teacher Toolkit)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            <div 
                                onClick={() => setActiveTab('Classes')}
                                style={{ background: 'var(--border-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '8px' }}><FontAwesomeIcon icon={faBookOpen} /></div>
                                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>Tạo lớp học mới</h5>
                            </div>
                            
                            <div 
                                onClick={() => setActiveTab('Quizzes')}
                                style={{ background: 'var(--border-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ fontSize: '24px', color: 'var(--accent)', marginBottom: '8px' }}><FontAwesomeIcon icon={faClipboardList} /></div>
                                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>Thiết kế đề thi (Quiz)</h5>
                            </div>

                            <div 
                                onClick={() => setActiveTab('Statistics')}
                                style={{ background: 'var(--border-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ fontSize: '24px', color: 'var(--success)', marginBottom: '8px' }}><FontAwesomeIcon icon={faCalendarCheck} /></div>
                                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>Báo cáo phân tích</h5>
                            </div>

                            <div 
                                onClick={() => setActiveTab('Messages')}
                                style={{ background: 'var(--border-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ fontSize: '24px', color: '#8b5cf6', marginBottom: '8px' }}><FontAwesomeIcon icon={faClipboardList} /></div>
                                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>Gửi thông báo nhanh</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
