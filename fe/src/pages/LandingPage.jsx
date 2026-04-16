import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, BarChart3, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="relative">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EduFlow
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
              <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
              <Zap className="w-4 h-4 fill-indigo-600" />
              <span>Next Generation Learning</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
              Elevate Your <br />
              <span className="text-indigo-600">Potential</span> with <br />
              Smart Learning.
            </h1>
            <p className="text-xl text-slate-600 max-w-xl">
              An all-in-one platform for modern education. Real-time interaction, 
              advanced analytics, and seamless course management.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl">
                Start Teaching
              </Link>
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition">
                Explore Courses
              </button>
            </div>
            <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Joined by <span className="text-slate-900 font-bold">10k+</span> students worldwide
              </p>
            </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-600 blur-[120px] opacity-20 rounded-full" />
             <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
               <img 
                 src="/elearning_hero_1776349120377.png" 
                 alt="Hero" 
                 className="w-full h-auto"
               />
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Key Features</h2>
            <h3 className="text-4xl font-bold text-slate-900">Everything you need to succeed</h3>
            <p className="text-slate-600">Empowering educators and students with cutting-edge tools for a superior learning experience.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
              title="Course Management"
              desc="Easy-to-use tools for creating classes, uploading lectures, and setting assignments with deadlines."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
              title="Tracking & Evaluation"
              desc="Automated submission tracking, online contests, and deep performance analysis for every student."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8 text-blue-600" />}
              title="Real-time Interaction"
              desc="Direct messaging, instant support, and automated deadline reminders to keep everyone on track."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-emerald-600" />}
              title="System Administration"
              desc="Complete control over users, class monitoring, and detailed system-wide activity statistics."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-orange-600" />}
              title="Community Groups"
              desc="Interact with peers in subject-specific groups to foster collaborative learning and discussions."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-600" />}
              title="Smart Reminders"
              desc="AI-powered notifications for upcoming deadlines and personalized study recommendations."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition duration-300 group">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
