import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthScreen } from './components/AuthScreen';
import { DashboardView } from './components/DashboardView';
import { LandingPage } from './components/LandingPage';

// Check if user is authenticated
const isAuthenticated = () => localStorage.getItem('isAuthenticated') === 'true';

// Protected route - redirects to /login if not authenticated
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route - redirects to /shop if already authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/shop" replace /> : <>{children}</>;
};

// Auth wrapper with login handler
const AuthWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuthScreen
      onLogin={() => {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/shop');
      }}
    />
  );
};

// Dashboard wrapper with logout handler
const DashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <DashboardView
      onNewBooking={() => { }}
      onLogout={() => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
      }}
      onBook={() => { }}
    />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage - Landing Page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthWrapper />
            </PublicRoute>
          }
        />

        {/* All protected routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardWrapper />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
