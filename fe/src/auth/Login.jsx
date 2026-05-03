import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthBackground from './AuthBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      
      // Redirect based on user role
      const userRole = data?.user?.user_metadata?.role;
      if (userRole === 'student') {
        navigate('/student/dashboard');
      } else if (userRole === 'instructor' || userRole === 'admin') {
        navigate('/dashboard');
      } else {
        // Default fallback
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="mt-3 text-slate-500 text-base">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Email Address</label>
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
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Password</label>
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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
              <span className="text-slate-600">Remember me</span>
            </div>
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-indigo-200 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? {' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Create one for free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
