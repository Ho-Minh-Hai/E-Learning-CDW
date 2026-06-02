import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faGraduationCap, 
    faSave,
    faCheckCircle,
    faBolt,
    faPencilAlt,
    faFileAlt,
    faTrashAlt,
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faClock,
    faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import './EQuizz.css';
import { supabase } from '../supabaseClient';

const EQuizz = ({ session, userRole, classes, isLoadingClasses, targetQuizId }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(15);
    const [deadline, setDeadline] = useState('');
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [prevClassId, setPrevClassId] = useState(null);
    
    // Class select dropdown
    const [showClassDropdown, setShowClassDropdown] = useState(false);

    // Questions State for Builder
    const [questions, setQuestions] = useState([
        {
            id: Date.now(),
            content: '',
            answers: [
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: true }
            ],
            isExpanded: true
        }
    ]);

    // Student Quiz Taking State
    const [isTakingQuiz, setIsTakingQuiz] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [attempts, setAttempts] = useState([]);
    const [isReviewing, setIsReviewing] = useState(false);

    // Active Slide Index for taking/reviewing quiz
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Active Question Index for builder
    const [activeBuilderIndex, setActiveBuilderIndex] = useState(0);

    const isTeacher = userRole === "1";

    useEffect(() => {
        if (session?.user?.id) {
            fetchAttempts();
        }
    }, [session]);

    useEffect(() => {
        if (selectedClass) {
            fetchQuizzes(selectedClass.id);
            
            if (prevClassId !== selectedClass.id) {
                stopQuiz();
                setIsCreating(false);
                setEditingQuizId(null);
                setPrevClassId(selectedClass.id);
            }
            
            const channel = supabase
                .channel(`class-quizzes-${selectedClass.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'quizzes',
                        filter: `class_id=eq.${selectedClass.id}`
                    },
                    () => {
                        fetchQuizzes(selectedClass.id);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else if (classes && classes.length > 0 && !selectedClass) {
            setSelectedClass(classes[0]);
            setPrevClassId(classes[0].id);
        }
    }, [selectedClass, classes]);

    useEffect(() => {
        if (!targetQuizId || !classes || classes.length === 0) return;

        let isCancelled = false;

        const selectClassByQuizId = async () => {
            for (const cls of classes) {
                try {
                    const response = await fetch(`http://localhost:8080/api/quizzes/class/${cls.id}`);
                    if (!response.ok) continue;

                    const data = await response.json();
                    const hasTargetQuiz = data.some(quiz => quiz.id === targetQuizId);

                    if (hasTargetQuiz && !isCancelled) {
                        setSelectedClass(cls);
                        setQuizzes(data);
                        setPrevClassId(cls.id);
                        return;
                    }
                } catch (err) {
                    console.error("Error finding quiz from email link:", err);
                }
            }
        };

        selectClassByQuizId();

        return () => {
            isCancelled = true;
        };
    }, [targetQuizId, classes]);

    useEffect(() => {
        if (!targetQuizId || quizzes.length === 0) return;

        const quizCard = document.querySelector(`[data-quiz-id="${targetQuizId}"]`);
        if (quizCard) {
            quizCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [targetQuizId, quizzes]);

    useEffect(() => {
        let timer;
        if (isTakingQuiz && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTakingQuiz, timeLeft]);

    const stopQuiz = () => {
        setIsTakingQuiz(false);
        setIsReviewing(false);
        setActiveQuiz(null);
        setStudentAnswers({});
        setTimeLeft(0);
        setCurrentQuestionIndex(0);
    };

    const handleBackToDashboard = () => {
        if (isReviewing) {
            stopQuiz();
            return;
        }
        
        const confirmBack = window.confirm("Bạn đang trong quá trình làm bài thi. Nếu quay lại, tiến trình làm bài hiện tại sẽ không được lưu. Bạn có chắc chắn muốn quay lại?");
        if (confirmBack) {
            stopQuiz();
        }
    };

    const handleResetForm = () => {
        setQuizTitle('');
        setDurationMinutes(15);
        setDeadline('');
        setEditingQuizId(null);
        setQuestions([
            {
                id: Date.now(),
                content: '',
                answers: [
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: true }
                ],
                isExpanded: true
            }
        ]);
        setActiveBuilderIndex(0);
        setIsCreating(true);
    };

    const fetchAttempts = async () => {
        if (!session?.user?.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/quiz-attempts/user/${session.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setAttempts(data);
            }
        } catch (err) {
            console.error("Error fetching attempts:", err);
        }
    };

    const fetchQuizzes = async (classId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/quizzes/class/${classId}`);
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data);
            }
        } catch (err) {
            console.error("Error fetching quizzes:", err);
        }
    };

    const handleEditQuiz = (quiz) => {
        setQuizTitle(quiz.title);
        setDurationMinutes(quiz.durationMinutes || 15);
        setDeadline(quiz.deadline ? quiz.deadline.substring(0, 16) : '');
        setEditingQuizId(quiz.id);
        setQuestions(quiz.questions.map(q => ({
            id: q.id,
            content: q.content,
            answers: q.answers.map(a => ({
                id: a.id,
                content: a.content,
                isCorrect: a.isCorrect
            })),
            isExpanded: true
        })));
        setActiveBuilderIndex(0);
        setIsCreating(true);
    };

    const handleStartQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setIsTakingQuiz(true);
        setIsReviewing(false);
        setTimeLeft((quiz.durationMinutes || 15) * 60);
        setStudentAnswers({});
        setCurrentQuestionIndex(0);
    };

    const handleReviewQuiz = async (quiz, attempt) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/quiz-attempts/attempt/${attempt.id}/answers`);
            if (!response.ok) throw new Error("Failed to fetch answers");
            const savedAnswers = await response.json();

            const answersMap = {};
            savedAnswers.forEach(ans => {
                answersMap[ans.questionId] = ans.selectedAnswerId;
            });

            setStudentAnswers(answersMap);
            setActiveQuiz(quiz);
            setIsTakingQuiz(true);
            setIsReviewing(true);
            setTimeLeft(0);
            setCurrentQuestionIndex(0);
        } catch (err) {
            console.error("Error fetching saved answers:", err);
            alert("Lỗi khi tải bài làm cũ: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            content: '',
            answers: [
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: true }
            ],
            isExpanded: true
        };
        setQuestions([...questions, newQuestion]);
        setActiveBuilderIndex(questions.length); // switch to newly created question
    };

    const handleDeleteQuestion = (id, index) => {
        if (questions.length === 1) {
            alert("Phải có ít nhất một câu hỏi!");
            return;
        }
        const updated = questions.filter(q => q.id !== id);
        setQuestions(updated);
        
        // Adjust active index
        if (activeBuilderIndex >= updated.length) {
            setActiveBuilderIndex(updated.length - 1);
        }
    };

    const handleQuestionChange = (id, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, content: value } : q));
    };

    const handleAnswerChange = (qId, ansIndex, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newAnswers = q.answers.map((ans, idx) => 
                    idx === ansIndex ? { ...ans, content: value } : ans
                );
                return { ...q, answers: newAnswers };
            }
            return q;
        }));
    };

    const handleToggleCorrect = (qId, ansIndex) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newAnswers = q.answers.map((ans, idx) => ({
                    ...ans,
                    isCorrect: idx === ansIndex
                }));
                return { ...q, answers: newAnswers };
            }
            return q;
        }));
    };

    const handleAddOption = (qId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                if (q.answers.length >= 5) return q;
                const newAnswers = [...q.answers];
                newAnswers[3] = { ...newAnswers[3], content: 'Tùy chọn 4', isCorrect: false };
                newAnswers.push({ content: 'nhập đáp án đúng', isCorrect: true });
                return { ...q, answers: newAnswers };
            }
            return q;
        }));
    };

    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    const validateForm = () => {
        if (!quizTitle.trim()) {
            alert("Vui lòng nhập tiêu đề bộ câu hỏi!");
            return false;
        }

        if (!editingQuizId) {
            if (questions.length === 0) {
                alert("Vui lòng thêm ít nhất một câu hỏi!");
                return false;
            }
            
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.content.trim()) {
                    alert(`Câu hỏi #${i + 1} chưa có nội dung!`);
                    return false;
                }
                if (!q.answers.some(a => a.isCorrect && a.content.trim())) {
                    alert(`Câu hỏi #${i + 1} chưa có đáp án đúng!`);
                    return false;
                }
            }
        }
        
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const quizData = {
                title: quizTitle,
                durationMinutes: durationMinutes,
                deadline: deadline || null,
                classId: selectedClass.id,
                createdBy: session.user.id
            };

            const url = editingQuizId ? `http://localhost:8080/api/quizzes/${editingQuizId}` : 'http://localhost:8080/api/quizzes';
            const method = editingQuizId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz: quizData,
                    questions: questions.map((q, idx) => ({
                        content: q.content,
                        questionOrder: idx + 1,
                        answers: (editingQuizId ? q.answers : shuffleArray(q.answers)).map((ans, aIdx) => ({
                            content: ans.content,
                            isCorrect: ans.isCorrect,
                            answerOrder: aIdx + 1
                        }))
                    }))
                })
            });

            if (response.ok) {
                alert(editingQuizId ? "Đã cập nhật bộ câu hỏi thành công!" : "Đã lưu bộ câu hỏi thành công!");
                handleResetForm();
                setIsCreating(false);
                fetchQuizzes(selectedClass.id);
            } else {
                const errorData = await response.json();
                alert("Lỗi khi lưu: " + (errorData.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error saving quiz:", err);
            alert("Đã xảy ra lỗi kết nối!");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bộ câu hỏi này không?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/quizzes/${quizId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Đã xóa bộ câu hỏi thành công!");
                fetchQuizzes(selectedClass.id);
            } else {
                const errorData = await response.json();
                alert("Lỗi khi xóa: " + (errorData.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error deleting quiz:", err);
            alert("Đã xảy ra lỗi khi xóa!");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (isReviewing) {
            stopQuiz();
            return;
        }

        const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài?");
        if (!confirmSubmit) return;

        setLoading(true);
        try {
            let correctCount = 0;
            const totalQuestions = activeQuiz.questions.length;
            const studentChoices = [];

            activeQuiz.questions.forEach(q => {
                const selectedAnsId = studentAnswers[q.id];
                const correctAnswer = q.answers.find(a => a.isCorrect);
                const isCorrect = selectedAnsId === correctAnswer?.id;
                
                if (isCorrect) correctCount++;
                
                studentChoices.push({
                    question_id: q.id,
                    selected_answer_id: selectedAnsId,
                    is_correct: isCorrect
                });
            });

            const rawScore = (correctCount / totalQuestions) * 10;
            const scoreValue = Math.ceil(rawScore * 100) / 100;

            const submissionData = {
                quizId: activeQuiz.id,
                userId: session.user.id,
                score: scoreValue,
                answers: studentChoices.map(choice => ({
                    questionId: choice.question_id,
                    selectedAnswerId: choice.selected_answer_id,
                    isCorrect: choice.is_correct
                }))
            };

            const response = await fetch('http://localhost:8080/api/quiz-attempts/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Lỗi khi lưu bài làm");
            }

            const savedAttempt = await response.json();
            const savedScore = Number(savedAttempt.score ?? scoreValue);
            alert(`Bạn đã hoàn thành bài thi! Điểm của bạn: ${savedScore.toFixed(2)}/10`);
            await fetchAttempts();
            stopQuiz();
        } catch (err) {
            console.error("Error submitting quiz:", err);
            alert("Lỗi khi nộp bài: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="equizz-container">
            {selectedClass ? (
                isTakingQuiz ? (
                    /* ==========================================================
                       STUDENT QUIZ TAKING INTERACTIVE SLIDE-CARD MODE
                       ========================================================== */
                    <div className="equizz-taking-view">
                        <div className="taking-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <button className="taking-back-btn" onClick={handleBackToDashboard}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                    <span>Quay lại</span>
                                </button>
                                <div className="quiz-info-main">
                                    <h2>{activeQuiz.title}</h2>
                                    <div className="quiz-meta-pills">
                                        <span className="quiz-meta-pill bg-primary">{activeQuiz.questions.length} Câu hỏi</span>
                                        {timeLeft > 0 && <span className="quiz-meta-pill bg-accent">Thời gian làm bài</span>}
                                    </div>
                                </div>
                            </div>
                            {timeLeft > 0 && (
                                <div className={`countdown-timer-box ${timeLeft <= 60 ? 'warning-blink' : ''}`}>
                                    <FontAwesomeIcon icon={faClock} className="timer-icon" />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Slide layout */}
                        <div className="taking-slide-layout">
                            
                            {/* Slide-Card: Show single question at a time */}
                            <div className="taking-question-slide-card">
                                <div className="slide-progress-bar-wrapper">
                                    <div className="slide-progress-text">
                                        Câu {currentQuestionIndex + 1} trên {activeQuiz.questions.length}
                                    </div>
                                    <div className="slide-progress-bar">
                                        <div 
                                            className="slide-progress-fill" 
                                            style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="taking-q-content-box">
                                    <p className="q-slide-content">
                                        {activeQuiz.questions[currentQuestionIndex].content}
                                    </p>
                                </div>

                                <div className="taking-answers-grid">
                                    {activeQuiz.questions[currentQuestionIndex].answers.map((ans) => {
                                        const qId = activeQuiz.questions[currentQuestionIndex].id;
                                        const isSelected = studentAnswers[qId] === ans.id;
                                        const isCorrect = ans.isCorrect;
                                        
                                        let statusClass = '';
                                        if (isReviewing) {
                                            if (isCorrect) statusClass = 'correct-choice';
                                            else if (isSelected && !isCorrect) statusClass = 'wrong-choice';
                                        }

                                        return (
                                            <label 
                                                key={ans.id} 
                                                className={`taking-ans-item-card ${isSelected ? 'selected' : ''} ${statusClass}`}
                                            >
                                                <input 
                                                    type="radio"
                                                    name={`question-${qId}`}
                                                    checked={isSelected}
                                                    onChange={() => !isReviewing && setStudentAnswers({...studentAnswers, [qId]: ans.id})}
                                                    disabled={isReviewing}
                                                />
                                                <span className="ans-text-content">{ans.content}</span>
                                                {isReviewing && isCorrect && (
                                                    <span className="ans-status-indicator correct">Đúng</span>
                                                )}
                                                {isReviewing && isSelected && !isCorrect && (
                                                    <span className="ans-status-indicator wrong">Sai</span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>

                                <div className="taking-card-navigation-actions">
                                    <button 
                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestionIndex === 0}
                                        className="slide-nav-btn prev"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                        <span>Câu trước</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(activeQuiz.questions.length - 1, prev + 1))}
                                        disabled={currentQuestionIndex === activeQuiz.questions.length - 1}
                                        className="slide-nav-btn next"
                                    >
                                        <span>Câu sau</span>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar: Question Status Navigator Grid */}
                            <div className="taking-questions-navigator-sidebar">
                                <h5>Bản đồ câu hỏi</h5>
                                <div className="questions-grid-navigator">
                                    {activeQuiz.questions.map((q, idx) => {
                                        const isAnswered = studentAnswers[q.id] !== undefined;
                                        const isCurrent = currentQuestionIndex === idx;
                                        
                                        let reviewClass = '';
                                        if (isReviewing) {
                                            const selectedId = studentAnswers[q.id];
                                            const correctAns = q.answers.find(a => a.isCorrect);
                                            reviewClass = selectedId === correctAns?.id ? 'review-correct' : 'review-wrong';
                                        }

                                        return (
                                            <button 
                                                key={q.id}
                                                onClick={() => setCurrentQuestionIndex(idx)}
                                                className={`nav-grid-btn ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''} ${reviewClass}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="taking-submit-section">
                                    <button className="taking-submit-btn" onClick={handleSubmitQuiz}>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>{isReviewing ? "Hoàn tất xem điểm" : "Nộp bài thi"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isCreating ? (
                    /* ==========================================================
                       TEACHER QUIZ BUILDER SPLIT SIDEBAR COLUMN MODE
                       ========================================================== */
                    <div className="equizz-builder-view">
                        <div className="builder-header-bar">
                            <div className="header-left">
                                <button className="builder-back-btn" onClick={() => { setIsCreating(false); setEditingQuizId(null); }}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                    <span>Trở lại danh sách</span>
                                </button>
                                <h3>{editingQuizId ? "Biên tập bộ câu hỏi" : "Tạo bộ đề thi trắc nghiệm mới"}</h3>
                            </div>
                            <button className="builder-save-btn" onClick={handleSave} disabled={loading}>
                                <FontAwesomeIcon icon={faSave} />
                                <span>{loading ? 'Đang lưu...' : 'Lưu bộ đề'}</span>
                            </button>
                        </div>

                        {/* Split layout */}
                        <div className="builder-split-workspace">
                            
                            {/* Left Side: Question Slides Navigator */}
                            <div className="builder-slides-navigator-sidebar">
                                <div className="navigator-sidebar-header">
                                    <span>Mục lục câu hỏi</span>
                                    <button onClick={handleAddQuestion} className="navigator-add-btn">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>

                                <div className="builder-slides-list">
                                    {questions.map((q, idx) => (
                                        <div 
                                            key={q.id} 
                                            onClick={() => setActiveBuilderIndex(idx)}
                                            className={`builder-slide-item ${activeBuilderIndex === idx ? 'active' : ''}`}
                                        >
                                            <span className="slide-num">Câu {idx + 1}</span>
                                            <p className="slide-preview-text">
                                                {q.content ? q.content : "(Câu hỏi trống)"}
                                            </p>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id, idx); }}
                                                className="slide-delete-btn"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Detailed Question Editor Panel */}
                            <div className="builder-detailed-editor-panel">
                                <div className="editor-general-settings-card">
                                    <h4>Cài đặt tổng quan bộ đề</h4>
                                    <div className="settings-fields-row">
                                        <div className="field-group flex-2">
                                            <label>Tiêu đề đề thi</label>
                                            <input 
                                                type="text" 
                                                placeholder="Nhập tiêu đề, ví dụ: Kiểm tra giữa kỳ 1" 
                                                value={quizTitle}
                                                onChange={(e) => setQuizTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="field-group flex-1">
                                            <label>Thời gian làm bài (Phút)</label>
                                            <div className="input-with-suffix">
                                                <input 
                                                    type="number" 
                                                    value={durationMinutes} 
                                                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                                                    min="1"
                                                />
                                                <span>Phút</span>
                                            </div>
                                        </div>
                                        <div className="field-group flex-1">
                                            <label>Hạn cuối nộp bài</label>
                                            <input 
                                                type="datetime-local" 
                                                value={deadline}
                                                onChange={(e) => setDeadline(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {questions.length > 0 && (
                                    <div className="editor-question-card">
                                        <div className="editor-question-header">
                                            <span className="question-counter-label">Biên tập Câu hỏi {activeBuilderIndex + 1}</span>
                                        </div>

                                        <div className="editor-field-group">
                                            <label>Nội dung câu hỏi</label>
                                            <textarea 
                                                placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                                                value={questions[activeBuilderIndex].content}
                                                onChange={(e) => handleQuestionChange(questions[activeBuilderIndex].id, e.target.value)}
                                                rows="3"
                                            ></textarea>
                                        </div>

                                        <div className="editor-answers-section">
                                            <div className="answers-section-header">
                                                <label>Các tùy chọn đáp án (Chọn vòng tròn để tích đáp án ĐÚNG)</label>
                                                {questions[activeBuilderIndex].answers.length < 5 && (
                                                    <button 
                                                        onClick={() => handleAddOption(questions[activeBuilderIndex].id)}
                                                        className="add-option-btn-link"
                                                    >
                                                        <FontAwesomeIcon icon={faPlusCircle} /> Thêm tùy chọn đáp án
                                                    </button>
                                                )}
                                            </div>

                                            <div className="editor-answers-list">
                                                {questions[activeBuilderIndex].answers.map((ans, aIdx) => (
                                                    <div 
                                                        key={aIdx} 
                                                        className={`editor-answer-item-row ${ans.isCorrect ? 'correct-style' : ''}`}
                                                    >
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleToggleCorrect(questions[activeBuilderIndex].id, aIdx)}
                                                            className={`radio-check-btn ${ans.isCorrect ? 'checked' : ''}`}
                                                            title="Đánh dấu đáp án đúng"
                                                        >
                                                            <FontAwesomeIcon icon={faCheckCircle} />
                                                        </button>
                                                        <input 
                                                            type="text" 
                                                            placeholder={`Tùy chọn ${String.fromCharCode(65 + aIdx)}`}
                                                            value={ans.content}
                                                            onChange={(e) => handleAnswerChange(questions[activeBuilderIndex].id, aIdx, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ==========================================================
                       QUIZ DASHBOARD GRID MODE (NO LEFT SIDEBAR)
                       ========================================================== */
                    <div className="equizz-dashboard-view">
                        
                        <div className="equizz-dashboard-header">
                            <div className="dashboard-header-left">
                                <h2>Đề thi & Đánh giá</h2>
                                <div className="class-selector-interactive-wrapper">
                                    <span className="selector-prefix">Lớp học:</span>
                                    <div 
                                        className="class-interactive-dropdown-btn"
                                        onClick={() => setShowClassDropdown(!showClassDropdown)}
                                    >
                                        <span>{selectedClass ? selectedClass.name : "Chọn lớp học"}</span>
                                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-arrow-icon" />
                                    </div>

                                    {showClassDropdown && (
                                        <div className="class-dropdown-menu-list">
                                            {classes.map((cls) => (
                                                <div 
                                                    key={cls.id} 
                                                    onClick={() => { setSelectedClass(cls); setShowClassDropdown(false); }}
                                                    className={`dropdown-menu-item ${selectedClass?.id === cls.id ? 'active' : ''}`}
                                                >
                                                    {cls.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isTeacher && (
                                <button className="equizz-action-btn-primary" onClick={handleResetForm}>
                                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                                    Tạo bộ đề trắc nghiệm
                                </button>
                            )}
                        </div>

                        {/* Dashboard content split: Left = Quizzes list */}
                        <div className="equizz-dashboard-layout-grid-full">
                            
                            {/* Quizzes List Cards */}
                            <div className="quizzes-grid-list-area-full">
                                <h4>Danh sách đề thi</h4>
                                {quizzes.length === 0 ? (
                                    <div className="quizzes-empty-feed-card">
                                        <FontAwesomeIcon icon={faFileAlt} className="empty-feed-icon-large" />
                                        <h5>Lớp chưa có đề thi trắc nghiệm nào</h5>
                                        <p>Mọi bài tập đánh giá trắc nghiệm cho lớp học này sẽ xuất hiện tại đây.</p>
                                    </div>
                                ) : (
                                    <div className="quizzes-modern-cards-grid">
                                        {quizzes.map((quiz) => {
                                            const studentAttempts = attempts.filter(a => a.quizId === quiz.id);
                                            const isAttempted = studentAttempts.length > 0;
                                            const bestAttempt = isAttempted 
                                                ? studentAttempts.reduce((prev, current) => (prev.score > current.score) ? prev : current)
                                                : null;

                                            return (
                                                <div
                                                    key={quiz.id}
                                                    data-quiz-id={quiz.id}
                                                    className={`quiz-modern-card-item ${targetQuizId === quiz.id ? 'target-quiz-card' : ''}`}
                                                >
                                                    <div className="quiz-card-top-glow"></div>
                                                    <div className="quiz-card-header-meta">
                                                        <span className="q-count-badge">
                                                            {quiz.questions ? quiz.questions.length : 0} Câu hỏi
                                                        </span>
                                                        <span className="duration-badge">
                                                            <FontAwesomeIcon icon={faClock} style={{ marginRight: '6px' }} />
                                                            {quiz.durationMinutes || 15} Phút
                                                        </span>
                                                    </div>

                                                    <h3 className="quiz-card-title-text">{quiz.title}</h3>
                                                    
                                                    {quiz.deadline && (
                                                        <p className="quiz-card-deadline-text">
                                                            🕒 Hạn nộp: {new Date(quiz.deadline).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    )}

                                                    <div className="quiz-card-action-footer">
                                                        {isTeacher ? (
                                                            <div className="teacher-action-controls-row">
                                                                <button 
                                                                    onClick={() => handleEditQuiz(quiz)}
                                                                    className="teacher-ctrl-btn edit"
                                                                >
                                                                    <FontAwesomeIcon icon={faPencilAlt} /> Sửa đề
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                                                    className="teacher-ctrl-btn delete"
                                                                >
                                                                    <FontAwesomeIcon icon={faTrashAlt} /> Xóa đề
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            isAttempted ? (
                                                                <div className="student-quiz-result-row">
                                                                    <div className="result-score-badge">
                                                                        Điểm đạt: <strong>{bestAttempt.score.toFixed(2)}/10</strong>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => handleReviewQuiz(quiz, bestAttempt)}
                                                                        className="student-ctrl-btn review"
                                                                    >
                                                                        <FontAwesomeIcon icon={faFileAlt} /> Xem lại bài
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleStartQuiz(quiz)}
                                                                    className="student-ctrl-btn start-interactive"
                                                                >
                                                                    <FontAwesomeIcon icon={faBolt} /> Làm bài ngay ➔
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="equizz-empty-state-no-class">
                    <FontAwesomeIcon icon={faGraduationCap} className="no-class-icon" />
                    <h3>Chưa chọn lớp học</h3>
                    <p>Hãy tạo hoặc tham gia lớp học trước để sử dụng hệ thống đề thi trắc nghiệm E-Quizz.</p>
                </div>
            )}
        </div>
    );
};

export default EQuizz;
