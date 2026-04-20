import React from 'react';
import StudentLayout from './StudentLayout';
import { TrendingUp, Award, Target, Clock, BookOpen, CheckCircle, Star, Calendar } from 'lucide-react';

const StudentProgress = () => {
  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Progress</h1>
              <p className="text-slate-500 mt-1">Track your learning journey and achievements.</p>
           </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProgressStatCard 
            title="Total Study Time"
            value="248 hours"
            change="+12h this week"
            icon={<Clock size={24} />}
            color="indigo"
          />
          <ProgressStatCard 
            title="Courses Completed"
            value="12"
            change="+2 this month"
            icon={<CheckCircle size={24} />}
            color="emerald"
          />
          <ProgressStatCard 
            title="Average Score"
            value="89%"
            change="+5% improvement"
            icon={<Star size={24} />}
            color="orange"
          />
          <ProgressStatCard 
            title="Achievements"
            value="24"
            change="+3 new badges"
            icon={<Award size={24} />}
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Activity Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Learning Activity</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Week</button>
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100">Month</button>
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100">Year</button>
                </div>
              </div>
              
              {/* Activity Chart */}
              <div className="space-y-4">
                <ActivityBar day="Mon" hours={3.5} maxHours={8} />
                <ActivityBar day="Tue" hours={5.2} maxHours={8} />
                <ActivityBar day="Wed" hours={2.8} maxHours={8} />
                <ActivityBar day="Thu" hours={6.5} maxHours={8} />
                <ActivityBar day="Fri" hours={4.0} maxHours={8} />
                <ActivityBar day="Sat" hours={7.2} maxHours={8} />
                <ActivityBar day="Sun" hours={3.0} maxHours={8} />
              </div>
            </div>

            {/* Course Performance */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Course Performance</h2>
              <div className="space-y-4">
                <CoursePerformanceRow 
                  course="Advanced Java Spring Boot"
                  progress={65}
                  grade={92}
                  assignments="12/15"
                  color="indigo"
                />
                <CoursePerformanceRow 
                  course="UI/UX Masterclass 2024"
                  progress={40}
                  grade={88}
                  assignments="8/20"
                  color="purple"
                />
                <CoursePerformanceRow 
                  course="Data Science Fundamentals"
                  progress={85}
                  grade={95}
                  assignments="17/18"
                  color="emerald"
                />
                <CoursePerformanceRow 
                  course="Mobile App Development"
                  progress={25}
                  grade={85}
                  assignments="4/16"
                  color="orange"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Overall Progress</h3>
                  <Target className="w-6 h-6 text-white/50" />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-extrabold">68</span>
                    <span className="text-2xl font-bold text-indigo-200 mb-2">%</span>
                  </div>
                  <p className="text-indigo-100 text-sm font-medium">Average completion rate</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-100 font-medium">Courses in progress</span>
                    <span className="font-bold">6</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-100 font-medium">Completed courses</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-100 font-medium">Total assignments</span>
                    <span className="font-bold">89</span>
                  </div>
                </div>
              </div>
              <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
            </div>

            {/* Recent Achievements */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                <AchievementItem 
                  emoji="🏆"
                  title="Top Performer"
                  desc="Scored 95% in Data Science"
                  date="2 days ago"
                />
                <AchievementItem 
                  emoji="⚡"
                  title="Speed Learner"
                  desc="Completed 3 lessons in 1 day"
                  date="5 days ago"
                />
                <AchievementItem 
                  emoji="🎯"
                  title="Perfect Score"
                  desc="100% on Java Quiz"
                  date="1 week ago"
                />
                <AchievementItem 
                  emoji="🔥"
                  title="7-Day Streak"
                  desc="Studied every day this week"
                  date="1 week ago"
                />
              </div>
            </div>

            {/* Study Goals */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Weekly Goals</h3>
              <div className="space-y-4">
                <GoalProgress 
                  title="Study 20 hours"
                  current={16}
                  target={20}
                  unit="hrs"
                />
                <GoalProgress 
                  title="Complete 5 lessons"
                  current={4}
                  target={5}
                  unit="lessons"
                />
                <GoalProgress 
                  title="Submit 3 assignments"
                  current={2}
                  target={3}
                  unit="tasks"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

const ProgressStatCard = ({ title, value, change, icon, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorStyles[color]} mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-3xl font-extrabold text-slate-900 mb-2">{value}</h4>
      <p className="text-xs text-emerald-600 font-bold">{change}</p>
    </div>
  );
};

const ActivityBar = ({ day, hours, maxHours }) => {
  const percentage = (hours / maxHours) * 100;
  
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold text-slate-600 w-12">{day}</span>
      <div className="flex-1 h-10 bg-slate-100 rounded-xl overflow-hidden relative">
        <div 
          className="h-full bg-indigo-600 rounded-xl transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">
          {hours}h
        </span>
      </div>
    </div>
  );
};

const CoursePerformanceRow = ({ course, progress, grade, assignments, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-900">{course}</h4>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase">Grade</p>
            <p className="text-lg font-extrabold text-slate-900">{grade}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase">Tasks</p>
            <p className="text-sm font-bold text-slate-600">{assignments}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Progress</span>
          <span className="font-bold text-slate-900">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${colorStyles[color]} transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const AchievementItem = ({ emoji, title, desc, date }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-all">
    <div className="text-2xl">{emoji}</div>
    <div className="flex-1 min-w-0">
      <h5 className="text-sm font-bold text-slate-900">{title}</h5>
      <p className="text-xs text-slate-500 font-medium">{desc}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{date}</p>
    </div>
  </div>
);

const GoalProgress = ({ title, current, target, unit }) => {
  const percentage = (current / target) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span className="text-sm font-bold text-slate-600">{current}/{target} {unit}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StudentProgress;
