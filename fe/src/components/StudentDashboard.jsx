import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBookOpen, 
    faGraduationCap,  
    faChartBar,
    faFont,
    faEllipsisH,
    faBullseye as faBullseyeIcon
} from '@fortawesome/free-solid-svg-icons';
import { UNIVERSITIES } from '../constants/universities';

const StudentDashboard = ({ session, classes, setActiveTab, setSelectedClass, userData, onProfileUpdate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [submissions, setSubmissions] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]);
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editData, setEditData] = useState({
        full_name: userData?.full_name || userData?.fullName || '',
        school: userData?.school || ''
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetchStudentStats();
        }
    }, [session]);

    useEffect(() => {
        setEditData({
            full_name: userData?.full_name || userData?.fullName || '',
            school: userData?.school || ''
        });
    }, [userData]);

    useEffect(() => {
        const fetchClassData = async () => {
            if (!classes || classes.length === 0) return;
            try {
                const assignmentPromises = classes.map(cls => 
                    fetch(`http://localhost:8080/api/posts/class/${cls.id}`).then(res => res.json())
                );
                const quizPromises = classes.map(cls => 
                    fetch(`http://localhost:8080/api/quizzes/class/${cls.id}`).then(res => res.json())
                );

                const assignmentsResults = await Promise.all(assignmentPromises);
                const quizzesResults = await Promise.all(quizPromises);

                let assignments = [];
                assignmentsResults.forEach((res, index) => {
                    if (Array.isArray(res)) {
                        assignments = assignments.concat(res.filter(p => p.type === 'assignment').map(p => ({
                            ...p,
                            classId: classes[index].id,
                            className: classes[index].name
                        })));
                    }
                });

                let quizzes = [];
                quizzesResults.forEach((res, index) => {
                    if (Array.isArray(res)) {
                        quizzes = quizzes.concat(res.map(q => ({
                            ...q,
                            classId: classes[index].id,
                            className: classes[index].name
                        })));
                    }
                });

                setAllAssignments(assignments);
                setAllQuizzes(quizzes);
            } catch (error) {
                console.error('Error fetching class data:', error);
            }
        };
        fetchClassData();
    }, [classes]);

    const fetchStudentStats = async () => {
        try {
            const [subRes, quizRes] = await Promise.all([
                fetch(`http://localhost:8080/api/submissions/user/${session.user.id}`),
                fetch(`http://localhost:8080/api/quiz-attempts/user/${session.user.id}`)
            ]);

            if (subRes.ok) setSubmissions(await subRes.json());
            if (quizRes.ok) setQuizAttempts(await quizRes.json());
        } catch (error) {
            console.error('Error fetching student stats:', error);
        }
    };

    const calculateStats = () => {
        const uniqueAssignments = new Set(submissions.map(s => s.postId));
        const uniqueQuizzes = new Set(quizAttempts.map(a => a.quizId));
        const totalCompleted = uniqueAssignments.size + uniqueQuizzes.size;

        const bestAssignmentScores = {};
        submissions.forEach(s => {
            if (s.score != null) {
                const score = parseFloat(s.score);
                if (!bestAssignmentScores[s.postId] || score > bestAssignmentScores[s.postId]) {
                    bestAssignmentScores[s.postId] = score;
                }
            }
        });

        const bestQuizScores = {};
        quizAttempts.forEach(a => {
            if (a.score != null) {
                const score = parseFloat(a.score);
                if (!bestQuizScores[a.quizId] || score > bestQuizScores[a.quizId]) {
                    bestQuizScores[a.quizId] = score;
                }
            }
        });

        const totalItems = allAssignments.length + allQuizzes.length;
        const sumScores = Object.values(bestAssignmentScores).reduce((a, b) => a + b, 0) + 
                          Object.values(bestQuizScores).reduce((a, b) => a + b, 0);
        
        const finalAvg = totalItems > 0 ? sumScores / totalItems : 0;
        const classification = finalAvg >= 8 ? 'Giỏi' : (finalAvg >= 5 ? 'Khá' : 'Trung bình');

        return {
            totalClasses: classes?.length || 0,
            totalCompleted,
            avgScore: finalAvg.toFixed(2),
            classification
        };
    };

    const stats = calculateStats();

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'E-Learning');
            const res = await fetch(`https://api.cloudinary.com/v1_1/dye7dfp5s/image/upload`, { method: 'POST', body: formData });
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

            await supabase.auth.updateUser({ data: { avatar_url: imageUrl } });
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) { console.error(error); } finally { setUploading(false); }
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

            await supabase.auth.updateUser({ data: { full_name: editData.full_name } });

            setIsEditing(false);
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) { console.error(error); } finally { setIsSaving(false); }
    };

    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startDay = (firstDayOfMonth(y, m) + 6) % 7;

    const isSameDay = (d1, d2) => d1 && d2 && new Date(d1).toDateString() === new Date(d2).toDateString();
    
    const hasDeadlineOnDate = (date) => {
        return allAssignments.some(a => isSameDay(a.dueAt, date)) || 
               allQuizzes.some(q => isSameDay(q.deadline, date));
    };

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<span key={`empty-${i}`} className="day-cell empty"></span>);
    for (let i = 1; i <= daysInMonth(y, m); i++) {
        const dateObj = new Date(y, m, i);
        const isActive = selectedDate.toDateString() === dateObj.toDateString();
        const hasDeadline = hasDeadlineOnDate(dateObj);
        days.push(<span key={i} className={`day-cell ${isActive ? 'active' : ''} ${hasDeadline ? 'has-deadline' : ''}`} onClick={() => setSelectedDate(dateObj)} style={{ cursor: 'pointer' }}>{i}</span>);
    }
    const scheduleItems = [];
    allAssignments.forEach(a => { if (isSameDay(a.dueAt, selectedDate)) scheduleItems.push({ id: a.id, title: a.title, time: new Date(a.dueAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), color: 'blue' }); });
    allQuizzes.forEach(q => { if (isSameDay(q.deadline, selectedDate)) scheduleItems.push({ id: q.id, title: q.title, time: new Date(q.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), color: 'purple' }); });

    const pendingAssignments = allAssignments.filter(a => !submissions.some(s => s.postId === a.id));

    return (
        <div className="app-dashboard-grid">
            {/* ROW 1: Hero & Profile */}
            <div className="dashboard-row-split">
                {/* Hero Banner (2/3 width) */}
                <div className="dashboard-col-2-3">
                    <div className="welcome-hero-card">
                        <h2>Chào mừng trở lại, {userData?.full_name || userData?.fullName || 'học viên'}!</h2>
                        <p>Hôm nay là một ngày tuyệt vời để tiếp thu kiến thức mới. Hãy tiếp tục duy trì tiến độ học tập và rèn luyện của bạn nhé!</p>
                    </div>
                </div>

                {/* Profile Hub (1/3 width) */}
                <div className="dashboard-col-1-3">
                    <div className="profile-hub-card">
                        <div className="profile-hub-avatar-wrapper">
                            <img src={userData?.avatar_url || userData?.avatarUrl} alt="A" className="profile-hub-avatar" />
                            <input type="file" id="profile-hub-avatar-upload" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                        </div>
                        <div className="profile-hub-details">
                            <div className="profile-hub-role-badge">Sinh viên</div>
                            {isEditing ? (
                                <input className="edit-input" style={{ padding: '6px 10px', fontSize: '13px', marginTop: '4px' }} value={editData.full_name} onChange={(e) => setEditData({...editData, full_name: e.target.value})} />
                            ) : (
                                <h3 className="profile-hub-name">{userData?.full_name || userData?.fullName || 'User Name'}</h3>
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
                <div className="section-header"><h2>Tổng quan chỉ số</h2></div>
                <div className="overview-cards">
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faBookOpen} /></div>
                        <div className="overview-card-info">
                            <h3>{stats.totalClasses}</h3>
                            <p>Lớp học</p>
                        </div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faGraduationCap} /></div>
                        <div className="overview-card-info">
                            <h3>{stats.totalCompleted}</h3>
                            <p>Bài nộp</p>
                        </div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faBullseyeIcon} /></div>
                        <div className="overview-card-info">
                            <h3>{stats.avgScore}</h3>
                            <p>ĐTB học tập</p>
                        </div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-card-icon"><FontAwesomeIcon icon={faChartBar} /></div>
                        <div className="overview-card-info">
                            <h3>{stats.classification}</h3>
                            <p>Xếp loại học</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROW 3: Assignments List & Planner */}
            <div className="dashboard-row-split">
                {/* Assignments Tracker (1/2 width) */}
                <div className="dashboard-col-1-2">
                    <section className="assignments" style={{ height: '100%' }}>
                        <div className="section-header"><h2>Danh sách Bài tập (Assignments)</h2></div>
                        <div className="assignments-list">
                            {pendingAssignments.length > 0 ? pendingAssignments.map(a => (
                                <div className="assignment-item" key={a.id}><div className="assignment-info"><div className="assignment-icon"><FontAwesomeIcon icon={faFont} /></div><div className="assignment-text"><h5>{a.title}</h5><p>{a.className}</p></div></div><div className="assignment-grade">--/10</div><div className="assignment-status">Sắp đến hạn</div></div>
                            )) : <p style={{ color: '#666', padding: '16px 0' }}>Không có bài tập nào chưa làm.</p>}
                        </div>
                    </section>
                </div>

                {/* Calendar & Schedule Planner (1/2 width) */}
                <div className="dashboard-col-1-2">
                    <div className="calendar-planner-card">
                        <div className="planner-calendar-side">
                            <div className="calendar-header"><button onClick={handlePrevMonth}>&lt;</button><span>{monthNames[m]} {y}</span><button onClick={handleNextMonth}>&gt;</button></div>
                            <div className="calendar-grid"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>{days}</div>
                        </div>
                        
                        <div className="planner-schedule-side">
                            <div className="schedule-container">
                                <h4>Kế hoạch thời gian (Schedule)</h4>
                                {scheduleItems.length > 0 ? scheduleItems.map((item, idx) => (
                                    <div className={`schedule-item ${item.color}`} key={`${item.id}-${idx}`}><div className="schedule-header"><h5>{item.title}</h5><FontAwesomeIcon icon={faEllipsisH} className="more-options" /></div><p>{item.time}</p></div>
                                )) : <p style={{ color: '#666', marginTop: '10px' }}>Không có sự kiện hoặc deadline trong ngày được chọn</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
