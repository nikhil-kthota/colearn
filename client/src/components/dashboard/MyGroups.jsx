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

                const { data, error } = await supabase
                    .from('collab_groups')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setGroups(data.map(g => ({
                        id: g.group_id,
                        name: g.group_name,
                        type: g.type,
                        members: 1, // Placeholder for now
                        lastUsed: new Date(g.created_at).toLocaleDateString()
                    })));
                }
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
                    <div className="loading-state">Loading your groups...</div>
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
                                    <span className="meta-item">
                                        <Users size={14} />
                                        {group.members} members
                                    </span>
                                    <span className="meta-item">
                                        <Calendar size={14} />
                                        Created {group.lastUsed}
                                    </span>
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
