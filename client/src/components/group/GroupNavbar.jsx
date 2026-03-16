import React, { useState, useEffect } from 'react';
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

    const [members, setMembers] = useState([]);

    useEffect(() => {
        let channel;

        const setupPresence = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if current user is admin
            const { data: groupData } = await supabase
                .from('collab_groups')
                .select('created_by')
                .eq('group_id', id)
                .single();

            const isCreator = groupData?.created_by === user.id;
            const userName = localStorage.getItem('userName') || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

            // Setup Realtime Presence Channel
            channel = supabase.channel(`group_presence:${id}`, {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const presenceState = channel.presenceState();
                    const activeMembers = [];

                    for (const userId in presenceState) {
                        const userPresences = presenceState[userId];
                        if (userPresences.length > 0) {
                            activeMembers.push(userPresences[0]);
                        }
                    }

                    // Sort so current user is always top
                    activeMembers.sort((a, b) => {
                        if (a.id === user.id) return -1;
                        if (b.id === user.id) return 1;
                        // Admins next
                        if (a.role === 'Admin' && b.role !== 'Admin') return -1;
                        if (b.role === 'Admin' && a.role !== 'Admin') return 1;
                        return 0;
                    });

                    // Update display names to include (You)
                    const formattedMembers = activeMembers.map(m => ({
                        id: m.id,
                        name: m.id === user.id ? `${m.name} (You)` : m.name,
                        role: m.role
                    }));

                    setMembers(formattedMembers);
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({
                            id: user.id,
                            name: userName,
                            role: isCreator ? 'Admin' : 'Member'
                        });
                    }
                });
        };

        setupPresence();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [id]);

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
