import React, { useState } from 'react';
import {
    Leaf,
    Sun,
    Moon,
    User,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardNavbar = ({ isDark, toggleTheme }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className={`navbar dashboard-nav-container ${isDark ? 'dark' : 'light'}`}>
            <div className="navbar-container">
                {/* Brand */}
                <div className="nav-brand" onClick={() => navigate('/dashboard')}>
                    <Leaf size={28} color="var(--color-neon-blue)" fill="var(--color-neon-blue)" strokeWidth={0} />
                    <span>CoLearn</span>
                </div>

                {/* Center: Desktop Links */}
                <div className="desktop-actions">
                    <div className="nav-links">
                        <button className="nav-link active">Collaborate</button>
                        <button className="nav-link">My Rooms</button>
                    </div>

                    {/* Actions: Theme Toggle + Profile Dropdown */}
                    <div className="nav-actions">
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div
                            className="user-profile-dropdown"
                            onMouseEnter={() => setIsProfileOpen(true)}
                            onMouseLeave={() => setIsProfileOpen(false)}
                        >
                            <div className="user-avatar-circle">
                                JD
                            </div>

                            {isProfileOpen && (
                                <div className="profile-menu">
                                    <button className="menu-item">
                                        <User size={16} />
                                        <span>Profile</span>
                                    </button>
                                    <div className="menu-divider"></div>
                                    <button className="menu-item logout" onClick={() => navigate('/')}>
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
