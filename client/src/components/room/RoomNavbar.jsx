import React, { useState } from 'react';
import {
    User,
    Sun,
    Moon,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoomNavbar = ({ roomName = "REACT PROJECT", isDark, toggleTheme }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const navigate = useNavigate();


    const members = [
        { id: 1, name: "John Doe (You)", role: "Admin" },
        { id: 2, name: "Alice Smith", role: "Editor" },
        { id: 3, name: "Bob Wilson", role: "Viewer" }
    ];

    return (
        <nav className="room-navbar">
            <div className="room-nav-section-brand" onClick={() => navigate('/dashboard')}>
                <img
                    src={isDark ? "public/logo-dark.png" : "public/logo-light.png"}
                    alt="CoLearn Logo"
                    style={{ height: '24px', width: 'auto' }}
                />
                <span>CoLearn</span>
            </div>

            <div className="room-nav-section-links">
                <div
                    className="room-nav-item-container room-nav-section-members"
                    onMouseEnter={() => setIsMembersOpen(true)}
                    onMouseLeave={() => setIsMembersOpen(false)}
                >
                    <div className="room-nav-item flex-center">
                        Members
                    </div>

                    {isMembersOpen && (
                        <div className="room-dropdown members-dropdown">
                            <div className="dropdown-header">Room Members</div>
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

                <div className="room-nav-section-chat">
                    <div className="room-nav-item">Chat</div>
                </div>
            </div>

            <div className="room-name-display">
                {roomName.toUpperCase()}
            </div>

            <div className="room-nav-section-actions">
                <button className="theme-toggle room-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div
                    className="room-user-container"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                >
                    <div className="room-user-avatar" onClick={() => navigate('/profile')}>
                        JD
                    </div>

                    {isProfileOpen && (
                        <div className="room-dropdown profile-dropdown">
                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                <User size={16} />
                                <span>Profile</span>
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout" onClick={() => navigate('/')}>
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

export default RoomNavbar;
