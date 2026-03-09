import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MyRooms.css';

const MyRooms = () => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = React.useState(false);

    // Placeholder data
    const rooms = [
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

    const displayedRooms = showAll ? rooms : rooms.slice(0, 4);

    const handleRoomClick = (room) => {
        navigate(`/room/${room.id}`);
    };

    return (
        <section className="my-rooms-section" id="my-rooms-section">
            <div className="section-header">
                <h2 className="section-title-small">My Rooms</h2>
                {rooms.length > 4 && (
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

            <div className="rooms-grid">
                {displayedRooms.map((room) => (
                    <div
                        key={room.id}
                        className={`room-card ${room.type} fade-in`}
                        onClick={() => handleRoomClick(room)}
                    >
                        <div className="room-type-badge">
                            {room.type === 'coding' ? 'Code' : 'Learning'}
                        </div>
                        <div className="room-overlay"></div>

                        <div className="room-content-wrapper">
                            <h3 className="room-name">{room.name}</h3>
                            <div className="room-details">
                                <span className="meta-item">{room.members} members</span>
                                <span className="meta-item">Used {room.lastUsed}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MyRooms;
