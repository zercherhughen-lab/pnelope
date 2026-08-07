import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ServiceProvider } from './context/ServiceContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StatsPage from './pages/StatsPage';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Licenses from './pages/Licenses';
import Docs from './pages/Docs';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, demoLogin } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      demoLogin();
    }
  }, [loading, user, demoLogin]);

  if (loading || !user) {
    return (
      <div data-testid="auth-loading" className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        Abriendo panel de Vape...
      </div>
    );
  }

  return <Layout>{children}</Layout>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div data-testid="auth-loading" className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        Autenticando...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  React.useEffect(() => {
    // 1. Bloqueo de click derecho
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Bloqueo de teclas de inspección y herramientas de desarrollo
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Bloquear Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools Inspect & Console)
      if (isCtrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Bloquear Ctrl+U (Ver código fuente)
      if (isCtrlOrCmd && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Bloquear Ctrl+S (Guardar página)
      if (isCtrlOrCmd && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Bloqueo de arrastre de imágenes y elementos
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ServiceProvider>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#0b0b0a',
                color: '#EEEEEC',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
          <Routes>
            {/* Always land on Dashboard when opening app */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <StatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services/:id"
              element={
                <ProtectedRoute>
                  <ServiceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/licenses"
              element={
                <ProtectedRoute>
                  <Licenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docs"
              element={
                <ProtectedRoute>
                  <Docs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ServiceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
