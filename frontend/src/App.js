import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Login from './components/auth/Login';
import MainLayout from './components/common/MainLayout';
import ProtectedRoute, { AdminRoute, JudgeRoute } from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';

// Admin Components
import AdminDashboard from './components/admin/Dashboard';
import TeamManagement from './components/admin/TeamManagement';
import CriteriaManagement from './components/admin/CriteriaManagement';
import UserManagement from './components/admin/UserManagement';
import RoundManagement from './components/admin/RoundManagement';
import JudgeAssignment from './components/admin/JudgeAssignment';

// Judge Components
import JudgeDashboard from './components/judge/JudgeDashboard';
import TeamScoring from './components/judge/TeamScoring';
import ScoreHistory from './components/judge/ScoreHistory';

// Results Components
import WinnerDisplay from './components/results/WinnerDisplay';
import Analytics from './components/results/Analytics';

// Import styles
import './styles/globals.css';
import './styles/akademia-theme.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Main App component - Sets up routing, authentication, and global providers

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
          {/* Toast notifications - Displays success and error messages */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#28a745',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#dc3545',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="teams" element={<TeamManagement />} />
                <Route path="criteria" element={<CriteriaManagement />} />
                <Route path="rounds" element={<RoundManagement />} />
                <Route path="assignment" element={<JudgeAssignment />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="results" element={<WinnerDisplay />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>
              
              {/* Judge routes */}
              <Route path="/judge/*" element={<JudgeRoute />}>
                <Route path="dashboard" element={<JudgeDashboard />} />
                <Route path="teams" element={<JudgeDashboard />} />
                <Route path="scoring" element={<TeamScoring />} />
                <Route path="history" element={<ScoreHistory />} />
              </Route>
              
              {/* Common routes */}
              <Route path="/dashboard" element={<MainLayout />}>
                <Route index element={<div>Dashboard</div>} />
              </Route>
              
              <Route path="/profile" element={<div>Profile</div>} />
              <Route path="/settings" element={<div>Settings</div>} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;