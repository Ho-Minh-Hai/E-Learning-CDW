import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import logoImg from '../assets/img/logo.jpg';
import './ResetPassword.css';

const ResetPassword = ({ onBackToLogin }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkRecoverySession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setIsReady(true);
                return;
            }

            const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            const hasRecoveryData = hashParams.get('access_token') || hashParams.get('refresh_token') || hashParams.get('type') === 'recovery';

            if (hasRecoveryData) {
                setIsReady(true);
                return;
            }

            setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu email mới.');
        };

        checkRecoverySession();
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!password || password.length < 6) {
            setError('Mật khẩu phải có ít least 6 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setMessage('Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.');
            setTimeout(() => {
                if (typeof onBackToLogin === 'function') {
                    onBackToLogin();
                } else {
                    window.location.assign('/');
                }
            }, 1400);
        } catch (err) {
            setError(err.message || 'Không thể đổi mật khẩu lúc này.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container reset-password-page">
            <div className="ambient-orb orb-1"></div>
            <div className="ambient-orb orb-2"></div>

            <div className="login-card-premium reset-password-card">
                <button
                    type="button"
                    className="back-link"
                    onClick={() => {
                        if (typeof onBackToLogin === 'function') {
                            onBackToLogin();
                        } else {
                            window.location.assign('/');
                        }
                    }}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Quay lại đăng nhập</span>
                </button>

                <div className="login-brand-header">
                    <div className="brand-logo-icon">
                        <img src={logoImg} alt="E-Learning Logo" className="brand-logo" />
                    </div>
                    <h1 className="brand-title">Đặt lại mật khẩu</h1>
                    <p className="brand-subtitle">Nhập mật khẩu mới để hoàn tất quy trình khôi phục.</p>
                </div>

                {message && (
                    <div className="success-message">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>{message}</span>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleResetPassword} className="login-form-body">
                    <div className="input-group-premium">
                        <span className="input-icon-wrapper">
                            <FontAwesomeIcon icon={faLock} />
                        </span>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || !isReady}
                        />
                    </div>

                    <div className="input-group-premium">
                        <span className="input-icon-wrapper">
                            <FontAwesomeIcon icon={faLock} />
                        </span>
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading || !isReady}
                        />
                    </div>

                    <button type="submit" disabled={loading || !isReady} className="submit-btn-premium">
                        {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
