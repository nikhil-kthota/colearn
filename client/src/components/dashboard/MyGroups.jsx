import React from 'react';
import { ChevronDown, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import '../../styles/MyGroups.css';

const MyGroups = () => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = React.useState(false);
    const [groups, setGroups] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Fetch groups created by the user
                const { data: createdGroups, error: createdError } = await supabase
                    .from('collab_groups')
                    .select('*')
                    .eq('created_by', user.id);

                // 2. Fetch IDs of groups the user has joined
                const { data: joinedMemberships, error: joinedError } = await supabase
                    .from('group_members')
                    .select('group_id')
                    .eq('user_id', user.id);

                let allGroupsMap = new Map();

                if (!createdError && createdGroups) {
                    createdGroups.forEach(g => {
                        allGroupsMap.set(g.group_id, g);
                    });
                }

                if (!joinedError && joinedMemberships && joinedMemberships.length > 0) {
                    const joinedIds = joinedMemberships.map(m => m.group_id);
                    const { data: joinedGroups } = await supabase
                        .from('collab_groups')
                        .select('*')
                        .in('group_id', joinedIds);
                    
                    if (joinedGroups) {
                        joinedGroups.forEach(g => {
                            allGroupsMap.set(g.group_id, g);
                        });
                    }
                }

                const mergedGroups = Array.from(allGroupsMap.values())
                    .sort((a, b) => {
                        const dateA = new Date(a.last_activity_at || a.created_at);
                        const dateB = new Date(b.last_activity_at || b.created_at);
                        return dateB - dateA; // Most recently used first
                    });

                // 3. Fetch member counts for each group
                const groupsWithCounts = await Promise.all(mergedGroups.map(async (g) => {
                    const { count } = await supabase
                        .from('group_members')
                        .select('*', { count: 'exact', head: true })
                        .eq('group_id', g.group_id);
                    
                    // Simple relative time formatter
                    const getTimeAgo = (dateStr) => {
                        if (!dateStr) return 'never';
                        const now = new Date();
                        const past = new Date(dateStr);
                        const diffInMs = now - past;
                        const diffInMins = Math.floor(diffInMs / (1000 * 60));
                        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

                        if (diffInMins < 1) return 'just now';
                        if (diffInMins < 60) return `${diffInMins}m ago`;
                        if (diffInHours < 24) return `${diffInHours}h ago`;
                        if (diffInDays < 7) return `${diffInDays}d ago`;
                        return past.toLocaleDateString();
                    };

                    return {
                        id: g.group_id,
                        name: g.group_name,
                        type: g.type,
                        members: count || 0,
                        lastUsed: getTimeAgo(g.last_activity_at || g.created_at)
                    };
                }));

                setGroups(groupsWithCounts);
            } catch (err) {
                console.error('Error fetching groups:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const displayedGroups = showAll ? groups : groups.slice(0, 4);

    const handleGroupClick = (group) => {
        navigate(`/group/${group.id}`);
    };

    return (
        <section className="my-groups-section" id="my-groups-section">
            <div className="section-header">
                <h2 className="section-title-small">My Groups</h2>
                {groups.length > 4 && (
                    <button className="view-all-btn" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'View All'}
                        <ChevronDown
                            size={16}
                            style={{
                                transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                        />
                    </button>
                )}
            </div>

            <div className="groups-grid">
                {loading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="group-card skeleton" style={{ minHeight: '160px', opacity: 0.5 }}></div>
                        ))}
                    </>
                ) : groups.length === 0 ? (
                    <div className="empty-state">No groups found. Create one to get started!</div>
                ) : (
                    displayedGroups.map((group) => (
                        <div
                            key={group.id}
                            className={`group-card ${group.type} fade-in`}
                            onClick={() => handleGroupClick(group)}
                        >
                            <div className="group-type-badge">
                                {group.type === 'coding' ? 'Code' : 'Learning'}
                            </div>
                            <div className="group-overlay"></div>

                            <div className="group-content-wrapper">
                                <h3 className="group-name">{group.name}</h3>
                                <div className="group-details">
                                    <span className="meta-item">{group.members} members</span>
                                    <span className="meta-item">Used {group.lastUsed}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default MyGroups;
