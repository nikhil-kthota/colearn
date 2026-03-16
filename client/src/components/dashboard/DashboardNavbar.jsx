import React, { useState } from 'react';
import {
    Sun,
    Moon,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

const DashboardNavbar = ({ isDark, toggleTheme }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('userName');
        navigate('/');
    };

    const handleScrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/');
            setTimeout(() => {
                const newElement = document.getElementById(id);
                if (newElement) {
                    newElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMobileProfileOpen) setIsMobileProfileOpen(false);
    };

    const toggleMobileProfile = () => {
        setIsMobileProfileOpen(!isMobileProfileOpen);
        if (isMenuOpen) setIsMenuOpen(false);
    };

    return (
        <nav className={`navbar dashboard-nav-container ${isDark ? 'dark' : 'light'}`}>
            <div className="navbar-container">
                {/* 1. Left: Brand */}
                <div className="nav-brand" onClick={() => handleScrollTo('dashboard-hero')}>
                    <img
                        src={`${import.meta.env.BASE_URL}${isDark ? "logo-dark.png" : "logo-light.png"}`}
                        alt="CoLearn Logo"
                        style={{ height: '28px', width: 'auto' }}
                    />
                    <span>CoLearn</span>
                </div>

                {/* 2. Center: Mobile Menu Toggle (Hamburger) */}
                <div className="mobile-center-controls">
                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* 3. Desktop Actions (Links + Actions) */}
                <div className="desktop-actions">
                    <div className="nav-links">
                        <button className="nav-link active" onClick={() => handleScrollTo('dashboard-hero')}>Collaborate</button>
                        <button className="nav-link" onClick={() => handleScrollTo('my-groups-section')}>My Groups</button>
                    </div>

                    <div className="nav-actions">
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div
                            className="user-profile-dropdown"
                            onMouseEnter={() => setIsProfileOpen(true)}
                            onMouseLeave={() => setIsProfileOpen(false)}
                        >
                            <div className="user-avatar-circle" onClick={() => navigate('/profile')}>
                                {(() => {
                                    const name = localStorage.getItem('userName') || 'User';
                                    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                })()}
                            </div>

                            {isProfileOpen && (
                                <div className="profile-menu">
                                    <button className="menu-item" onClick={() => navigate('/profile')}>
                                        <User size={16} />
                                        <span>Profile</span>
                                    </button>
                                    <div className="menu-divider"></div>
                                    <button className="menu-item logout" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Mobile Right Controls */}
                <div className="mobile-right-controls">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={22} /> : <Moon size={22} />}
                    </button>

                    <div
                        className="mobile-user-container"
                        onMouseEnter={() => setIsMobileProfileOpen(true)}
                        onMouseLeave={() => setIsMobileProfileOpen(false)}
                    >
                        <button
                            className="mobile-user-toggle"
                            onClick={toggleMobileProfile}
                        >
                            <div className="user-avatar-circle mini">
                                {(() => {
                                    const name = localStorage.getItem('userName') || 'User';
                                    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                })()}
                            </div>
                        </button>

                        {isMobileProfileOpen && (
                            <div className="mobile-user-dropdown">
                                <button onClick={() => navigate('/profile')}>
                                    <User size={16} style={{ marginRight: '8px' }} /> Profile
                                </button>
                                <button onClick={handleLogout} className="logout">
                                    <LogOut size={16} style={{ marginRight: '8px' }} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Main Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    <button onClick={() => handleScrollTo('dashboard-hero')}>Collaborate</button>
                    <button onClick={() => handleScrollTo('my-groups-section')}>My Groups</button>
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
