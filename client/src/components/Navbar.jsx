import React, { useState, useEffect } from 'react';
import { Leaf, Moon, Sun, Menu, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ isDark, toggleTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMobileUserMenuOpen) setIsMobileUserMenuOpen(false); // Close user menu if main menu opens
    };

    const toggleMobileUserMenu = () => {
        setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
        if (isMenuOpen) setIsMenuOpen(false); // Close main menu if user menu toggles
    };

    const handleSignupClick = () => {
        navigate('/signup');
        setIsMenuOpen(false);
        setIsMobileUserMenuOpen(false);
    }

    const handleLoginClick = () => {
        navigate('/login');
        setIsMenuOpen(false);
        setIsMobileUserMenuOpen(false);
    }

    return (
        <nav className={`navbar ${isDark ? 'dark' : 'light'}`}>
            <div className="navbar-container">
                {/* 1. Left: Brand */}
                <div className="nav-brand">
                    <Leaf size={28} color="var(--color-neon-blue)" fill="var(--color-neon-blue)" strokeWidth={0} />
                    <span style={{ color: 'var(--color-white)' }}>CoLearn</span>
                </div>

                {/* 2. Center: Mobile Menu Toggle (Hamburger) - Visible only on mobile */}
                <div className="mobile-center-controls">
                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMenu}
                        style={{ color: 'var(--color-white)' }}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>


                {/* 3. Right: Desktop Links & Actions OR Mobile Theme + User Icon */}

                {/* Desktop View: Normal Links + Auth Buttons */}
                <div className="desktop-actions">
                    <div className="nav-links">
                        <button
                            className="nav-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem 1rem' }}
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }}
                        >
                            Home
                        </button>
                        <button
                            className="nav-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem 1rem' }}
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => document.getElementById('how-we-work')?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }}
                        >
                            How We Work
                        </button>
                        <button
                            className="nav-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem 1rem' }}
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }}
                        >
                            Features
                        </button>
                    </div>

                    <div className="nav-actions">
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            style={{ color: 'var(--color-white)' }}
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            className="btn-login"
                            style={{ color: 'var(--color-white)', borderColor: 'var(--color-white)' }}
                            onClick={handleLoginClick}
                        >
                            Login
                        </button>
                        <button className="btn-signup" onClick={handleSignupClick}>
                            Signup
                        </button>
                    </div>
                </div>

                {/* Mobile Right Controls: Theme + User Icon */}
                <div className="mobile-right-controls">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        style={{ color: 'var(--color-white)' }}
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={24} /> : <Moon size={24} />}
                    </button>

                    <button
                        className="mobile-user-toggle"
                        onClick={toggleMobileUserMenu}
                        style={{ color: 'var(--color-white)' }}
                    >
                        <User size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Main Menu Overlay (Links only) */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} style={{ backgroundColor: 'rgba(16, 30, 51, 0.98)' }}>
                <div className="mobile-nav-links">
                    <button onClick={() => { navigate('/'); setIsMenuOpen(false); setTimeout(() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ color: 'var(--color-white)' }}>Home</button>
                    <button onClick={() => { navigate('/'); setIsMenuOpen(false); setTimeout(() => document.getElementById('how-we-work')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ color: 'var(--color-white)' }}>How We Work</button>
                    <button onClick={() => { navigate('/'); setIsMenuOpen(false); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ color: 'var(--color-white)' }}>Features</button>
                </div>
            </div>

            {/* Mobile User Menu Overlay (Auth options) */}
            {isMobileUserMenuOpen && (
                <div className="mobile-user-dropdown" style={{ backgroundColor: '#101e33', border: `1px solid var(--color-neon-blue)` }}>
                    <button onClick={handleLoginClick} style={{ color: 'var(--color-white)' }}>Login</button>
                    <button onClick={handleSignupClick} style={{ color: 'var(--color-white)' }}>Signup</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
