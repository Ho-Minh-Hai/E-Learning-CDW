import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900">EduFlow</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-slate-500">Sign in to your account to continue</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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

          <Link to="/dashboard" className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 group">
            Sign In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don't have an account? {' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">Create one for free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
