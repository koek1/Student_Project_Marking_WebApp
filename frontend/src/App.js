import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Login from './components/auth/Login';
import MainLayout from './components/common/MainLayout';
import ProtectedRoute, { AdminRoute, JudgeRoute } from './components/auth/ProtectedRoute';

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
                <Route path="dashboard" element={<div>Admin Dashboard</div>} />
                <Route path="teams" element={<div>Teams Management</div>} />
                <Route path="criteria" element={<div>Criteria Management</div>} />
                <Route path="rounds" element={<div>Rounds Management</div>} />
                <Route path="assignment" element={<div>Judge Assignment</div>} />
                <Route path="users" element={<div>Users Management</div>} />
                <Route path="results" element={<div>Results</div>} />
                <Route path="analytics" element={<div>Analytics</div>} />
              </Route>
              
              {/* Judge routes */}
              <Route path="/judge/*" element={<JudgeRoute />}>
                <Route path="dashboard" element={<div>Judge Dashboard</div>} />
                <Route path="teams" element={<div>My Teams</div>} />
                <Route path="scoring" element={<div>Score Teams</div>} />
                <Route path="history" element={<div>Score History</div>} />
              </Route>
              
              {/* Common routes */}
              <Route path="/dashboard" element={<MainLayout />}>
                <Route index element={<div>Dashboard</div>} />
              </Route>
              
              <Route path="/profile" element={<div>Profile</div>} />
              <Route path="/settings" element={<div>Settings</div>} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;