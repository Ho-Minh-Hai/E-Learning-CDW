import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthBackground from './AuthBackground';

const Register = () => {
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password, { 
        full_name: fullName,
        role: role 
      });
      if (signUpError) throw signUpError;
      
      if (data?.user?.identities?.length === 0) {
        setError('This email is already registered.');
      } else {
        alert('Registration successful! Please check your email for confirmation (if enabled) or log in now.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />
      
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-white/50 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">EduFlow</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 font-serif">Create Account</h2>
          <p className="mt-2 text-slate-500">Join our community of lifelong learners</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => setRole('student')}
              className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                role === 'student' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.05]' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-[1.02]'
              }`}
            >
              Student
            </button>
            <button 
              type="button" 
              onClick={() => setRole('instructor')}
              className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                role === 'instructor' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.05]' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-[1.02]'
              }`}
            >
              Instructor
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe" 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-indigo-100 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account? {' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 decoration-2 underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
