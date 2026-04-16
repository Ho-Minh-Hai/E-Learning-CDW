import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
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
          <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="mt-2 text-slate-500">Join our community of lifelong learners</p>
        </div>

        <form className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="py-3 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition">Student</button>
            <button type="button" className="py-3 px-4 bg-indigo-50 border-2 border-indigo-600 rounded-2xl text-sm font-bold text-indigo-600">Instructor</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
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

          <Link to="/dashboard" className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 group">
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account? {' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
