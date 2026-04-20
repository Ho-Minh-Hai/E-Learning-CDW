import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './dashboard/Dashboard';
import CourseManagement from './courses/CourseManagement';
import AdminDashboard from './admin/AdminDashboard';
import RealtimeChat from './realtime/RealtimeChat';
import EvaluationStats from './evaluation/EvaluationStats';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

// Student Components
import StudentDashboard from './student/StudentDashboard';
import StudentCourses from './student/StudentCourses';
import StudentAssignments from './student/StudentAssignments';
import StudentProgress from './student/StudentProgress';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Instructor/Admin Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireRole="instructor">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute requireRole="instructor">
                <CourseManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/evaluation" 
            element={
              <ProtectedRoute requireRole="instructor">
                <EvaluationStats />
              </ProtectedRoute>
            } 
          />

          {/* Shared Routes */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <RealtimeChat />
              </ProtectedRoute>
            } 
          />

          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute requireRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/courses" 
            element={
              <ProtectedRoute requireRole="student">
                <StudentCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/assignments" 
            element={
              <ProtectedRoute requireRole="student">
                <StudentAssignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/progress" 
            element={
              <ProtectedRoute requireRole="student">
                <StudentProgress />
              </ProtectedRoute>
            } 
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
