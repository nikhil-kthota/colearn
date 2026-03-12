import React from 'react';
import { Plus, LogIn, Code2, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';

const COLLAB_CODING_URL = import.meta.env.VITE_COLLAB_CODING_URL || 'http://localhost:5174';

const ActionCard = ({ activeTab, actionType, setActionType, setIsPaused, formData, onInputChange }) => {
    const [loading, setLoading] = React.useState(false);

    const handleCodingCreate = async () => {
        const { roomId, roomName, roomKey } = formData.create;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('collab_rooms')
                .insert([{ 
                    room_id: roomId, 
                    room_name: roomName, 
                    room_key: roomKey,
                    type: 'coding'
                }]);

            if (error) {
                if (error.code === '23505') {
                    alert('Room ID already exists. Please choose a unique ID.');
                } else {
                    console.error('Supabase Error:', error);
                    alert('Error creating room. Make sure the "collab_rooms" table exists in your Supabase project.');
                }
                return;
            }

            const url = `${COLLAB_CODING_URL}?roomId=${encodeURIComponent(roomId)}&userName=${encodeURIComponent(roomName)}&creating=true`;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCodingJoin = async () => {
        const { roomId, roomKey } = formData.join;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collab_rooms')
                .select('*')
                .eq('room_id', roomId)
                .single();

            if (error || !data) {
                alert('Room not found. Please check the Room ID.');
                return;
            }

            if (data.room_key !== roomKey) {
                alert('Incorrect Room Key (PIN).');
                return;
            }

            const savedName = localStorage.getItem('userName') || 'User';
            const url = `${COLLAB_CODING_URL}?roomId=${encodeURIComponent(roomId)}&userName=${encodeURIComponent(savedName)}&creating=false`;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="main-action-card">
            <div className="card-left">
                <h2 className="card-title">
                    {activeTab === 'coding' ? 'Collaborative Coding' : 'Collaborative Learning'}
                </h2>
                <p className="card-subtitle">
                    {activeTab === 'coding'
                        ? "Spin up a shared development environment and code together in real-time."
                        : "Join a learning session with shared files, real-time editing, AI-assistance, and chat with co-learners."
                    }
                </p>

                <div className="action-toggle-container">
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
                </div>

                <form className="action-form" onSubmit={(e) => e.preventDefault()}>
                    {actionType === 'create' ? (
                        <>
                            <div className="form-row">
                                <input
                                    name="roomName"
                                    type="text"
                                    placeholder="Room Name"
                                    className="action-input"
                                    value={formData.create.roomName}
                                    onChange={(e) => onInputChange(e, 'create')}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    name="roomId"
                                    type="text"
                                    placeholder="Room ID"
                                    className="action-input"
                                    value={formData.create.roomId}
                                    onChange={(e) => onInputChange(e, 'create')}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    name="roomKey"
                                    type="text"
                                    maxLength={5}
                                    placeholder="Room Key (4 or 5 digit PIN)"
                                    className={`action-input ${formData.create.roomKey && !/^\d{4,5}$/.test(formData.create.roomKey) ? 'error' : ''}`}
                                    value={formData.create.roomKey}
                                    onChange={(e) => {
                                        if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                            onInputChange(e, 'create');
                                        }
                                    }}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                                {formData.create.roomKey && !/^\d{4,5}$/.test(formData.create.roomKey) && (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        <span>Key must be a 4 or 5 digit numeric PIN</span>
                                    </div>
                                )}
                                {(formData.create.roomName || formData.create.roomId || formData.create.roomKey) &&
                                    (!formData.create.roomName.trim() || !formData.create.roomId.trim() || !/^\d{4,5}$/.test(formData.create.roomKey)) && (
                                        <div className="error-message" style={{ justifyContent: 'center', marginBottom: '0.8rem', opacity: 0.9 }}>
                                            <AlertCircle size={14} />
                                            <span>
                                                {(() => {
                                                    const missing = [];
                                                    if (!formData.create.roomName.trim()) missing.push('Name');
                                                    if (!formData.create.roomId.trim()) missing.push('ID');
                                                    if (!formData.create.roomKey) missing.push('Key');

                                                    if (missing.length === 3) return 'Please enter all fields';
                                                    if (missing.length === 2) return `Please enter Room ${missing[0]} and ${missing[1]}`;
                                                    if (missing.length === 1) return `Please enter Room ${missing[0]}`;

                                                    if (!/^\d{4,5}$/.test(formData.create.roomKey)) return 'Invalid PIN format';
                                                    return '';
                                                })()}
                                            </span>
                                        </div>
                                    )}
                            </div>
                            <button
                                className="submit-action-btn"
                                onClick={activeTab === 'coding' ? handleCodingCreate : undefined}
                                disabled={loading || !formData.create.roomName.trim() || !formData.create.roomId.trim() || !/^\d{4,5}$/.test(formData.create.roomKey)}
                                style={{
                                    opacity: (loading || !formData.create.roomName.trim() || !formData.create.roomId.trim() || !/^\d{4,5}$/.test(formData.create.roomKey)) ? 0.4 : 1,
                                    cursor: (loading || !formData.create.roomName.trim() || !formData.create.roomId.trim() || !/^\d{4,5}$/.test(formData.create.roomKey)) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Please Wait...
                                    </>
                                ) : (
                                    activeTab === 'coding' ? 'Initialize Workspace' : 'Create Learning Space'
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="form-row">
                                <input
                                    name="roomId"
                                    type="text"
                                    placeholder="Room ID"
                                    className="action-input"
                                    value={formData.join.roomId}
                                    onChange={(e) => onInputChange(e, 'join')}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    name="roomKey"
                                    type="text"
                                    maxLength={5}
                                    placeholder="Room Key (PIN)"
                                    className={`action-input ${formData.join.roomKey && !/^\d{4,5}$/.test(formData.join.roomKey) ? 'error' : ''}`}
                                    value={formData.join.roomKey}
                                    onChange={(e) => {
                                        if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                            onInputChange(e, 'join');
                                        }
                                    }}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                                {formData.join.roomKey && !/^\d{4,5}$/.test(formData.join.roomKey) && (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        <span>Key must be a 4 or 5 digit numeric PIN</span>
                                    </div>
                                )}
                            </div>
                            {(formData.join.roomId || formData.join.roomKey) &&
                                (!formData.join.roomId.trim() || !/^\d{4,5}$/.test(formData.join.roomKey)) && (
                                    <div className="error-message" style={{ justifyContent: 'center', marginBottom: '0.8rem', opacity: 0.9 }}>
                                        <AlertCircle size={14} />
                                        <span>
                                            {(() => {
                                                const missing = [];
                                                if (!formData.join.roomId.trim()) missing.push('ID');
                                                if (!formData.join.roomKey) missing.push('Key');

                                                if (missing.length === 2) return 'Please enter Room ID and Key';
                                                if (missing.length === 1) return `Please enter Room ${missing[0]}`;
                                                if (!/^\d{4,5}$/.test(formData.join.roomKey)) return 'Invalid PIN format';
                                                return '';
                                            })()}
                                        </span>
                                    </div>
                                )}
                            <button
                                className="submit-action-btn"
                                disabled={loading || !formData.join.roomId.trim() || !/^\d{4,5}$/.test(formData.join.roomKey)}
                                onClick={activeTab === 'coding' ? handleCodingJoin : undefined}
                                style={{
                                    opacity: (loading || !formData.join.roomId.trim() || !/^\d{4,5}$/.test(formData.join.roomKey)) ? 0.4 : 1,
                                    cursor: (loading || !formData.join.roomId.trim() || !/^\d{4,5}$/.test(formData.join.roomKey)) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Checking Room...
                                    </>
                                ) : (
                                    'Enter Room'
                                )}
                            </button>
                        </>
                    )}
                </form>
            </div>

        </div>
    );
};

export default ActionCard;
