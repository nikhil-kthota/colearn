import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = ({ isDark, toggleTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'how-we-work', 'features'];
            const scrollPosition = window.scrollY + 100; // Offset for navbar height

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const handleScrollTo = (id) => {
        navigate('/');
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(id);
            }
        }, 100);
    };

    return (
        <nav className={`navbar ${isDark ? 'dark' : 'light'}`}>
            <div className="navbar-container">
                {/* 1. Left: Brand */}
                <div className="nav-brand" onClick={() => handleScrollTo('home')}>
                    <img
                        src={isDark ? "public/logo-dark.png" : "public/logo-dark.png"}
                        alt="CoLearn Logo"
                        style={{ height: '28px', width: 'auto' }}
                    />
                    <span>CoLearn</span>
                </div>

                {/* 2. Center: Mobile Menu Toggle (Hamburger) - Visible only on mobile */}
                <div className="mobile-center-controls">
                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>


                {/* 3. Desktop View: Normal Links + Auth Buttons */}
                <div className="desktop-actions">
                    <div className="nav-links">
                        <button
                            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                            onClick={() => handleScrollTo('home')}
                        >
                            Home
                        </button>
                        <button
                            className={`nav-link ${activeSection === 'how-we-work' ? 'active' : ''}`}
                            onClick={() => handleScrollTo('how-we-work')}
                        >
                            How We Work
                        </button>
                        <button
                            className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
                            onClick={() => handleScrollTo('features')}
                        >
                            Features
                        </button>
                    </div>

                    <div className="nav-actions">
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            className="btn-login"
                            onClick={handleLoginClick}
                        >
                            Login
                        </button>
                        <button className="btn-signup" onClick={handleSignupClick}>
                            Signup
                        </button>
                    </div>
                </div>

                {/* 4. Mobile Right Controls: Theme + User Icon */}
                <div className="mobile-right-controls">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle mobile-only-theme"
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={22} /> : <Moon size={22} />}
                    </button>

                    <div
                        className="mobile-user-container"
                        onMouseEnter={() => setIsMobileUserMenuOpen(true)}
                        onMouseLeave={() => setIsMobileUserMenuOpen(false)}
                    >
                        <button
                            className="mobile-user-toggle"
                            onClick={toggleMobileUserMenu}
                        >
                            <User size={24} />
                        </button>

                        {isMobileUserMenuOpen && (
                            <div className="mobile-user-dropdown" style={{ backgroundColor: '#101e33', border: `1px solid var(--color-neon-blue)` }}>
                                <button onClick={handleLoginClick}>Login</button>
                                <button onClick={handleSignupClick}>Signup</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Main Menu Overlay (Links + Theme Toggle) */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} style={{ backgroundColor: 'rgba(16, 30, 51, 0.98)' }}>
                <div className="mobile-nav-links">
                    <button onClick={() => { setIsMenuOpen(false); handleScrollTo('home'); }}>Home</button>
                    <button onClick={() => { setIsMenuOpen(false); handleScrollTo('how-we-work'); }}>How We Work</button>
                    <button onClick={() => { setIsMenuOpen(false); handleScrollTo('features'); }}>Features</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
