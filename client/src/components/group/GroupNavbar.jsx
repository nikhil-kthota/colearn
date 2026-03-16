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
    const [onlineUserIds, setOnlineUserIds] = useState(new Set());

    // Fetch all registered members from DB
    useEffect(() => {
        if (!id) return;
        const fetchMembers = async () => {
            const { data, error } = await supabase
                .from('group_members')
                .select('user_id, role, display_name')
                .eq('group_id', id);
            if (!error && data) {
                setMembers(data.map(m => ({
                    id: m.user_id,
                    name: m.display_name || 'Member',
                    role: m.role || 'Member'
                })));
            }
        };
        fetchMembers();
    }, [id]);

    // Track who is currently online via Presence
    useEffect(() => {
        if (!id) return;
        let channel;

        const setupPresence = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: groupData } = await supabase
                .from('collab_groups')
                .select('created_by')
                .eq('group_id', id)
                .single();

            const isCreator = groupData?.created_by === user.id;
            const userName = localStorage.getItem('userName') || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

            channel = supabase.channel(`group_presence:${id}`, {
                config: { presence: { key: user.id } },
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const presenceState = channel.presenceState();
                    setOnlineUserIds(new Set(Object.keys(presenceState)));
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
            if (channel) supabase.removeChannel(channel);
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
                            <div className="dropdown-header">
                                Group Members
                                <span style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 400 }}>
                                    {' '}· {onlineUserIds.size} online
                                </span>
                            </div>
                            {members.length === 0 ? (
                                <div className="member-item" style={{ opacity: 0.5, fontSize: '0.8rem' }}>No members yet</div>
                            ) : members.map(member => {
                                const isOnline = onlineUserIds.has(member.id);
                                const firstName = member.name.split(' ')[0];
                                const isCurrentUser = [...onlineUserIds].length > 0 && isOnline && member.id === member.id;
                                return (
                                    <div key={member.id} className="member-item" title={member.name}>
                                        <div className="member-avatar-wrapper" style={{ position: 'relative' }}>
                                            <div className="member-avatar">{member.name.charAt(0)}</div>
                                            {isOnline && (
                                                <span style={{
                                                    position: 'absolute', bottom: 0, right: 0,
                                                    width: '9px', height: '9px',
                                                    background: '#22c55e', borderRadius: '50%',
                                                    border: '2px solid var(--color-surface, #1a1a2e)'
                                                }} />
                                            )}
                                        </div>
                                        <div className="member-info">
                                            <div className="member-name">{firstName}</div>
                                            <div className="member-role">{member.role}</div>
                                        </div>
                                    </div>
                                );
                            })}
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
