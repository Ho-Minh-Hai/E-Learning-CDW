import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-600 blur-[120px] opacity-20 rounded-full" />
          <div className="relative">
            <h1 className="text-[12rem] font-extrabold text-slate-200 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-24 h-24 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold text-slate-900">
            Page Not Found
          </h2>
          <p className="text-xl text-slate-600 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl"
          >
            <Home size={20} />
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-slate-200">
          <p className="text-sm font-bold text-slate-500 mb-4">Quick Links</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Login
            </Link>
            <Link to="/register" className="text-indigo-600 hover:underline font-medium">
              Register
            </Link>
            <Link to="/student/dashboard" className="text-indigo-600 hover:underline font-medium">
              Student Dashboard
            </Link>
            <Link to="/dashboard" className="text-indigo-600 hover:underline font-medium">
              Instructor Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
