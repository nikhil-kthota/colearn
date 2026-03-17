import React, { useState, useEffect } from 'react';
import {
    User,
    Sun,
    Moon,
    LogOut
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

const GroupNavbar = ({ groupName = "REACT PROJECT", isDark, toggleTheme, currentUser }) => {
    const { id } = useParams();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('userName');
        navigate('/');
    };

    const [allMembers, setAllMembers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [currentUserId, setCurrentUserId] = useState(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchAllMembers = async () => {
            if (!currentUser) return;
            setCurrentUserId(currentUser.id);

            const { data, error } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', id);

            if (!error && data) {
                setAllMembers(data);
            }
        };

        if (id && currentUser) {
            fetchAllMembers();
        }
    }, [id, currentUser]);

    useEffect(() => {
        let channel;

        const setupPresence = async () => {
            if (!currentUser) return;

            const { data: groupData } = await supabase
                .from('collab_groups')
                .select('created_by')
                .eq('group_id', id)
                .single();

            const isCreator = groupData?.created_by === currentUser.id;
            const userName = localStorage.getItem('userName') || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User';

            channel = supabase.channel(`group_presence:${id}`, {
                config: {
                    presence: {
                        key: currentUser.id,
                    },
                },
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const presenceState = channel.presenceState();
                    const currentlyOnline = new Set();
                    for (const userId in presenceState) {
                        currentlyOnline.add(userId);
                    }
                    setOnlineUsers(currentlyOnline);
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({
                            id: currentUser.id,
                            name: userName,
                            role: isCreator ? 'Admin' : 'Member'
                        });
                    }
                });
        };

        if (id && currentUser) {
            setupPresence();
        }

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [id, currentUser]);

    // Combine allMembers with online status
    useEffect(() => {
        const formattedMembers = allMembers.map(m => ({
            id: m.user_id,
            name: m.user_name || 'Unknown User',
            role: m.role,
            isOnline: onlineUsers.has(m.user_id)
        })).sort((a, b) => {
            // Online first
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            // Admins next
            if (a.role === 'Admin' && b.role !== 'Admin') return -1;
            if (b.role === 'Admin' && a.role !== 'Admin') return 1;
            return 0;
        });

        setMembers(formattedMembers);
    }, [allMembers, onlineUsers]);

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
                                    <div className="member-avatar-wrapper">
                                        <div className="member-avatar">{member.name.charAt(0)}</div>
                                        <div className={`status-indicator ${member.isOnline ? 'online' : 'offline'}`}></div>
                                    </div>
                                    <div className="member-info">
                                        <div className="member-name">
                                            {member.name} 
                                            {member.id === currentUserId && ' (You)'}
                                        </div>
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
                        {(() => {
                            const name = localStorage.getItem('userName') || 'User';
                            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                        })()}
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
