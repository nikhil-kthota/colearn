import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MyGroups.css';

const MyGroups = () => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = React.useState(false);

    // Placeholder data
    const groups = [
        {
            id: '1',
            name: 'React Micro-Frontend',
            type: 'coding',
            members: 5,
            lastUsed: '2 hours ago'
        },
        {
            id: '2',
            name: 'System Design Patterns',
            type: 'learning',
            members: 12,
            lastUsed: 'Yesterday'
        },
        {
            id: '3',
            name: 'Python for Data Science',
            type: 'coding',
            members: 8,
            lastUsed: '3 days ago'
        },
        {
            id: '4',
            name: 'Advanced Machine Learning',
            type: 'learning',
            members: 15,
            lastUsed: 'Just now'
        },
        {
            id: '5',
            name: 'Full Stack Development',
            type: 'coding',
            members: 20,
            lastUsed: 'Yesterday'
        }
    ];

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
                {displayedGroups.map((group) => (
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
                ))}
            </div>
        </section>
    );
};

export default MyGroups;
