import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MyRooms.css';

const MyRooms = () => {
    const navigate = useNavigate();
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
        }
    ];

    const handleRoomClick = (room) => {
        navigate(`/room/${room.id}`);
    };

    return (
        <section className="my-rooms-section" id="my-rooms-section">
            <div className="section-header">
                <h2 className="section-title-small">My Rooms</h2>
                <button className="view-all-btn">
                    View All <ArrowRight size={16} />
                </button>
            </div>

            <div className="rooms-grid">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className={`room-card ${room.type}`}
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
