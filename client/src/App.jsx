import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; // Using HashRouter for seamless GitHub Pages deployment
import LandingPage from './pages/LandingPage'
import Signup from './pages/Signup'
import Login from './pages/Login'
import UserHome from './pages/UserHome'
import Profile from './pages/Profile'
import Room from './pages/Room'

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<LandingPage isDark={isDark} toggleTheme={toggleTheme} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<UserHome isDark={isDark} toggleTheme={toggleTheme} />} />
          <Route path="/profile" element={<Profile isDark={isDark} toggleTheme={toggleTheme} />} />
          <Route path="/room/:id" element={<Room isDark={isDark} toggleTheme={toggleTheme} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
