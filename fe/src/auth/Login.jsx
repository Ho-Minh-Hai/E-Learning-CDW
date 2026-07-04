import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import logoImg from '../assets/img/logo.jpg';
import './Login.css';

const getAppRedirectUrl = () => `${window.location.origin}${window.location.pathname}`;

const Login = ({ theme, toggleTheme }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const redirectUrl = getAppRedirectUrl();

    const resetViewState = () => {
        setError('');
        setSuccessMessage('');
    };

    const handleAuthentication = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: redirectUrl,
                    }
                });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccessMessage('Vui lòng kiểm tra hộp thư email của bạn để tiếp tục đặt lại mật khẩu.');
            setForgotEmail('');
        } catch (error) {
            setError(error.message || 'Không thể gửi email đặt lại mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: redirectUrl
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with Google:', error.message);
            alert('Đăng nhập thất bại: ' + error.message);
        }
    };

    return (
        <div className="login-page-container">
            <div className="ambient-orb orb-1"></div>
            <div className="ambient-orb orb-2"></div>

            <div className="login-page-widgets">
                <button
                    onClick={toggleTheme}
                    className="login-theme-toggle"
                    title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
                >
                    <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                </button>
            </div>

            <div className="login-card-premium">
                <div className="login-brand-header">
                    <div className="brand-logo-icon">
                        <img src={logoImg} alt="E-Learning Logo" className="brand-logo" />
                    </div>
                    <h1 className="brand-title">E-Learning</h1>
                    <p className="brand-subtitle">Hệ thống quản lý học tập thông minh thế hệ mới</p>
                </div>

                {!isForgotPassword && (
                    <div className="login-tabs-container">
                        <button
                            className={`tab-btn ${isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(true); resetViewState(); }}
                        >
                            Đăng Nhập
                        </button>
                        <button
                            className={`tab-btn ${!isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(false); resetViewState(); }}
                        >
                            Đăng Ký
                        </button>
                        <div className={`tab-slider-bar ${isLogin ? 'left' : 'right'}`}></div>
                    </div>
                )}

                <div className="login-form-body">
                    {isForgotPassword ? (
                        <form onSubmit={handleForgotPassword}>
                            <div className="input-group-premium">
                                <span className="input-icon-wrapper">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </span>
                                <input
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && <p className="error-message">{error}</p>}
                            {successMessage && <p className="success-message-inline">{successMessage}</p>}

                            <button type="submit" disabled={loading} className="submit-btn-premium">
                                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
                            </button>
                            <button
                                type="button"
                                className="forgot-password-link"
                                onClick={() => { setIsForgotPassword(false); resetViewState(); }}
                            >
                                Quay lại đăng nhập
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleAuthentication}>
                            <div className="input-group-premium">
                                <span className="input-icon-wrapper">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </span>
                                <input
                                    type="email"
                                    placeholder="Địa chỉ email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group-premium">
                                <span className="input-icon-wrapper">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && <p className="error-message">{error}</p>}
                            {successMessage && <p className="success-message-inline">{successMessage}</p>}

                            {isLogin && (
                                <button
                                    type="button"
                                    className="forgot-password-link"
                                    onClick={() => { setIsForgotPassword(true); resetViewState(); }}
                                >
                                    Quên mật khẩu?
                                </button>
                            )}

                            <button type="submit" disabled={loading} className="submit-btn-premium">
                                {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
                            </button>
                        </form>
                    )}
                </div>

                {!isForgotPassword && (
                    <>
                        <div className="login-divider-premium">
                            <span>Hoặc tiếp tục với</span>
                        </div>

                        <div className="login-social-actions">
                            <button className="google-signin-btn-premium" onClick={handleGoogleLogin}>
                                <svg className="google-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                                </svg>
                                <span>Google</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
