import React from 'react';
import { Plus, LogIn, Code2, BookOpen } from 'lucide-react';

const ActionCard = ({ activeTab, actionType, setActionType }) => {
    return (
        <div className="main-action-card">
            <div className="card-left">
                <h2 className="card-title">
                    {activeTab === 'coding' ? 'Collaborative Coding' : 'Collaborative Learning'}
                </h2>
                <p className="card-subtitle">
                    {activeTab === 'coding'
                        ? "Spin up a shared development environment and code together in real-time."
                        : "Join a learning session with shared whiteboards, resources, and live discussion."
                    }
                </p>

                <div className="action-toggle-container">
                    {activeTab === 'coding' && (
                        <>
                            <button
                                className={`toggle-btn ${actionType === 'create' ? 'active' : ''}`}
                                onClick={() => setActionType('create')}
                            >
                                <Plus size={18} />
                                Create Room
                            </button>
                            <button
                                className={`toggle-btn ${actionType === 'join' ? 'active' : ''}`}
                                onClick={() => setActionType('join')}
                            >
                                <LogIn size={18} />
                                Join Room
                            </button>
                        </>
                    )}
                    {activeTab === 'learning' && (
                        <button className="toggle-btn active">
                            <LogIn size={18} />
                            Join Room
                        </button>
                    )}
                </div>

                <form className="action-form" onSubmit={(e) => e.preventDefault()}>
                    {activeTab === 'coding' && actionType === 'create' ? (
                        <>
                            <div className="form-row">
                                <input type="text" placeholder="Room Name" className="action-input" />
                            </div>
                            <div className="form-row">
                                <input type="text" placeholder="Room ID" className="action-input" />
                            </div>
                            <div className="form-row">
                                <input type="password" placeholder="Room Key" className="action-input" />
                            </div>
                            <button className="submit-action-btn">Initialize Workspace</button>
                        </>
                    ) : (
                        <>
                            <div className="form-row">
                                <input type="text" placeholder="Room ID" className="action-input" />
                            </div>
                            <div className="form-row">
                                <input type="password" placeholder="Room Key" className="action-input" />
                            </div>
                            <button className="submit-action-btn">Enter Room</button>
                        </>
                    )}
                </form>
            </div>

        </div>
    );
};

export default ActionCard;
