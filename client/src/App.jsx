import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase'
import LandingPage from './pages/LandingPage'
import Signup from './pages/Signup'
import Login from './pages/Login'
import UserHome from './pages/UserHome'
import Profile from './pages/Profile'
import Group from './pages/Group'
import Chat from './pages/Chat'

function App() {
  const [isDark, setIsDark] = useState(true);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user?.user_metadata?.full_name) {
        localStorage.setItem('userName', initialSession.user.user_metadata.full_name);
      }
      setLoading(false);
    });

    // 2. Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user?.user_metadata?.full_name) {
        localStorage.setItem('userName', currentSession.user.user_metadata.full_name);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  // Protected Route: Only accessible when logged in
  const ProtectedRoute = ({ children }) => {
    if (loading) return null;
    if (!session) return <Navigate to="/login" replace />;
    return children;
  };

  // Public Route: Only accessible when NOT logged in (Login/Signup)
  const PublicRoute = ({ children }) => {
    if (loading) return null;
    if (session) return <Navigate to="/" replace />;
    return children;
  };

  // The professional basename for GitHub Pages
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <div className="app-wrapper">
        <Routes>
          {/* 
            DYNAMIC HOME: 
            One route, two different personalities depending on auth.
          */}
          <Route path="/" element={
            loading ? null : (
              session ? 
                <UserHome isDark={isDark} toggleTheme={toggleTheme} /> : 
                <LandingPage isDark={isDark} toggleTheme={toggleTheme} />
            )
          } />

          {/* Auth Routes */}
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
          
          {/* Legacy Redirect */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile isDark={isDark} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          } />
          <Route path="/group/:id" element={
            <ProtectedRoute>
              <Group isDark={isDark} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          } />
          <Route path="/group/:id/chat" element={
            <ProtectedRoute>
              <Chat isDark={isDark} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          } />
          
          {/* Standard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
