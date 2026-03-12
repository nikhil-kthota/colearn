import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase'
import LandingPage from './pages/LandingPage'
import Signup from './pages/Signup'
import Login from './pages/Login'
import UserHome from './pages/UserHome'
import Profile from './pages/Profile'
import Room from './pages/Room'
import Chat from './pages/Chat'

function App() {
  const [isDark, setIsDark] = useState(true);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.full_name) {
        localStorage.setItem('userName', session.user.user_metadata.full_name);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.full_name) {
        localStorage.setItem('userName', session.user.user_metadata.full_name);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const ProtectedRoute = ({ children }) => {
    if (loading) return null;
    if (!session) return <Navigate to="/login" replace />;
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (loading) return null;
    if (session) return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <LandingPage isDark={isDark} toggleTheme={toggleTheme} />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserHome isDark={isDark} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile isDark={isDark} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          } />
          <Route path="/room/:id" element={
            <ProtectedRoute>
              <Room isDark={isDark} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          } />
          <Route path="/room/:id/chat" element={
            <ProtectedRoute>
              <Chat isDark={isDark} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          } />
          
          {/* Catch Supabase OAuth tokens and errors that confuse HashRouter */}
          <Route path="/access_token=*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/error_description=*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
