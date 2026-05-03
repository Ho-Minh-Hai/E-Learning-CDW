import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, ArrowRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthBackground from './AuthBackground';

const getRoleFromEmail = (email) => {
  if (email.toLowerCase().endsWith('@st.hcmuaf.edu.vn')) {
    return 'teacher';
  }
  return 'user';
};

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const detectedRole = getRoleFromEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const role = getRoleFromEmail(email);

    try {
      const { data, error: signUpError } = await signUp(email, password, {
        full_name: fullName,
        role: role
      });
      if (signUpError) throw signUpError;

      if (data?.user?.identities?.length === 0) {
        setError('Email này đã được đăng ký.');
      } else {
        if (data?.user && !data?.session) {
          alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
          navigate('/login');
        } else {
          if (role === 'teacher') {
            navigate('/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Tạo tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />

      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">EduFlow</span>
          </Link>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Tạo tài khoản
          </h2>
          <p className="mt-3 text-slate-500 text-base">Tham gia cộng đồng học tập của chúng tôi</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300 placeholder:text-slate-400"
                />
              </div>
              {email && (
                <div className={`mt-2 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl w-fit transition-all duration-300 ${
                  detectedRole === 'teacher'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Info className="w-3.5 h-3.5" />
                  {detectedRole === 'teacher' ? 'Tài khoản Giảng viên (HCMUAF)' : 'Tài khoản Học viên'}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-indigo-200 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Đăng ký
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
