import React, { useState } from 'react';
import {
    Leaf,
    User,
    Sun,
    Moon,
    LogOut,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoomNavbar = ({ roomName = "REACT PROJECT", isDark, toggleTheme }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const navigate = useNavigate();

    // Placeholder members
    const members = [
        { id: 1, name: "John Doe (You)", role: "Admin" },
        { id: 2, name: "Alice Smith", role: "Editor" },
        { id: 3, name: "Bob Wilson", role: "Viewer" }
    ];

    return (
        <nav className="room-navbar">
            <div className="room-nav-left">
                <div className="room-nav-brand" onClick={() => navigate('/dashboard')}>
                    <Leaf size={24} color="var(--color-neon-blue)" fill="var(--color-neon-blue)" strokeWidth={0} />
                    <span>CoLearn</span>
                </div>

                <div
                    className="room-nav-item-container"
                    onMouseEnter={() => setIsMembersOpen(true)}
                    onMouseLeave={() => setIsMembersOpen(false)}
                >
                    <div className="room-nav-item flex-center">
                        <Users size={16} className="mr-2" />
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
            </div>

            <div className="room-name-display">
                {roomName.toUpperCase()}
            </div>

            <div className="room-nav-right">
                <div className="room-nav-item">Chat</div>

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
