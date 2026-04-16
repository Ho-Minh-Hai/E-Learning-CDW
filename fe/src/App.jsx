import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './dashboard/Dashboard';
import CourseManagement from './courses/CourseManagement';
import AdminDashboard from './admin/AdminDashboard';
import RealtimeChat from './realtime/RealtimeChat';
import EvaluationStats from './evaluation/EvaluationStats';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/chat" element={<RealtimeChat />} />
          <Route path="/evaluation" element={<EvaluationStats />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
