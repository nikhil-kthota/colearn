import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase'
import LandingPage from './pages/LandingPage'
import Signup from './pages/Signup'
import Login from './pages/Login'
import UserHome from './pages/UserHome'
import Profile from './pages/Profile'
import Group from './pages/Group'
import Chat from './pages/Chat'
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    // 1. Initial robust session check
    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          setSession(initialSession);
          if (initialSession.user?.user_metadata?.full_name) {
            localStorage.setItem('userName', initialSession.user.user_metadata.full_name);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Supabase Auth Event:", event);
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('userName');
        setSession(null);
        toast.success('Logged out successfully!');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || currentSession) {
        setSession(currentSession);
        if (currentSession?.user?.user_metadata?.full_name) {
          localStorage.setItem('userName', currentSession.user.user_metadata.full_name);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  // Protected Route: Only accessible when logged in
  const ProtectedRoute = ({ children }) => {
    if (loading) return null;
    if (!session) return <Navigate to="/" replace />;
    return children;
  };

  // Public Route: Redirect to home if already logged in
  const PublicRoute = ({ children }) => {
    if (loading) return null;
    if (session) return <Navigate to="/" replace />;
    return children;
  };

  // The professional basename for GitHub Pages
  const basename = import.meta.env.BASE_URL;

  return (
    <Router>
      <div className="app-wrapper">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: isDark ? '#101e33' : '#ffffff',
              color: isDark ? '#ffffff' : '#101e33',
              borderRadius: '1rem',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(0,0,0,0.05)',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
          }}
        />
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
