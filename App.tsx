import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { BrandLogo } from './components/BrandLogo';
import { AuthScreen } from './components/AuthScreen';
import { DashboardView } from './components/DashboardView';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine if authenticated (mock logic for now, could be localStorage)
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthWrapper />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardView
                onNewBooking={() => { }}
                onLogout={() => {
                  localStorage.removeItem('isAuthenticated');
                  // Force refresh or navigation handled by component usage
                }}
                onBook={() => { }}
              />
            </PrivateRoute>
          }
        />
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/shop" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
