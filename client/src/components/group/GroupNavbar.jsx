import React, { useState } from 'react';
import {
    User,
    Sun,
    Moon,
    LogOut
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

const GroupNavbar = ({ groupName = "REACT PROJECT", isDark, toggleTheme }) => {
    const { id } = useParams();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('userName');
        navigate('/');
    };

    const members = [
        { id: 1, name: "John Doe (You)", role: "Admin" },
        { id: 2, name: "Alice Smith", role: "Editor" },
        { id: 3, name: "Bob Wilson", role: "Viewer" }
    ];

    return (
        <nav className="group-navbar">
            <div className="group-nav-section-brand" onClick={() => navigate('/')}>
                <img
                    src={`${import.meta.env.BASE_URL}${isDark ? "logo-dark.png" : "logo-light.png"}`}
                    alt="CoLearn Logo"
                    style={{ height: '24px', width: 'auto' }}
                />
                <span>CoLearn</span>
            </div>

            <div className="group-nav-section-links">
                <div
                    className="group-nav-item-container group-nav-section-members"
                    onMouseEnter={() => setIsMembersOpen(true)}
                    onMouseLeave={() => setIsMembersOpen(false)}
                >
                    <div className="group-nav-item flex-center">
                        Members
                    </div>

                    {isMembersOpen && (
                        <div className="group-dropdown members-dropdown">
                            <div className="dropdown-header">Group Members</div>
                            {members.map(member => (
                                <div key={member.id} className="member-item">
                                    <div className="member-avatar">{member.name.charAt(0)}</div>
                                    <div className="member-info">
                                        <div className="member-name">{member.name}</div>
                                        <div className="member-role">{member.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="group-nav-section-chat">
                    <div
                        className="group-nav-item"
                        onClick={() => navigate(`/group/${id}/chat`)}
                    >
                        Chat
                    </div>
                </div>
            </div>

            <div className="group-name-display">
                {groupName.toUpperCase()}
            </div>

            <div className="group-nav-section-actions">
                <button className="theme-toggle group-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div
                    className="group-user-container"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                >
                    <div className="group-user-avatar" onClick={() => navigate('/profile')}>
                        JD
                    </div>

                    {isProfileOpen && (
                        <div className="group-dropdown profile-dropdown">
                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                <User size={16} />
                                <span>Profile</span>
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default GroupNavbar;
