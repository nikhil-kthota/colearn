import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogIn, Code2, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';
import toast from 'react-hot-toast';

const COLLAB_CODING_URL = import.meta.env.VITE_COLLAB_CODING_URL || 'http://localhost:5174';

const ActionCard = ({ activeTab, actionType, setActionType, setIsPaused, formData, onInputChange }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const handleCodingCreate = async () => {
        const { groupId, groupName, groupKey } = formData.create;
        setLoading(true);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                toast.error('You must be logged in to create a group.');
                return;
            }

            const { error } = await supabase
                .from('collab_groups')
                .insert([{ 
                    group_id: groupId, 
                    group_name: groupName, 
                    group_key: groupKey,
                    type: 'coding',
                    created_by: authUser.id
                }]);

            if (error) {
                if (error.code === '23505') {
                    toast.error('Group ID already exists. Please choose a unique ID.');
                } else {
                    console.error('Supabase Error:', error);
                    toast.error('Error creating group. Make sure the "collab_groups" table exists in your Supabase project.');
                }
                return;
            }
            
            // Add creator to group_members
            const creatorName = localStorage.getItem('userName') || authUser.user_metadata?.full_name || 'Admin';
            await supabase.from('group_members').insert([{
                group_id: groupId,
                user_id: authUser.id,
                user_name: creatorName,
                role: 'Admin'
            }]);

            toast.success('Coding Space created!');
            const url = `${COLLAB_CODING_URL}?groupId=${encodeURIComponent(groupId)}&userName=${encodeURIComponent(creatorName)}&creating=true`;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error('Failed to create coding space.');
        } finally {
            setLoading(false);
        }
    };

    const handleCodingJoin = async () => {
        const { groupId, groupKey } = formData.join;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collab_groups')
                .select('*')
                .eq('group_id', groupId)
                .single();

            if (error || !data) {
                toast.error('Group not found. Please check the Group ID.');
                return;
            }

            if (data.group_key !== groupKey) {
                toast.error('Incorrect Group Key (PIN).');
                return;
            }

            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const joinerName = localStorage.getItem('userName') || authUser.user_metadata?.full_name || 'User';
                const { error: joinError } = await supabase.from('group_members').insert([{
                    group_id: groupId,
                    user_id: authUser.id,
                    user_name: joinerName,
                    role: 'Member'
                }]);
                if (joinError && joinError.code !== '23505') {
                    console.warn('Error joining group_members:', joinError);
                }
            }

            toast.success('Joined Coding Space!');
            const savedName = localStorage.getItem('userName') || 'User';
            const url = `${COLLAB_CODING_URL}?groupId=${encodeURIComponent(groupId)}&userName=${encodeURIComponent(savedName)}&creating=false`;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error('Failed to join coding space.');
        } finally {
            setLoading(false);
        }
    };
    const handleLearningCreate = async () => {
        const { groupId, groupName, groupKey } = formData.create;
        setLoading(true);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                toast.error('You must be logged in to create a group.');
                return;
            }

            const { error } = await supabase
                .from('collab_groups')
                .insert([{ 
                    group_id: groupId, 
                    group_name: groupName, 
                    group_key: groupKey,
                    type: 'learning',
                    created_by: authUser.id
                }]);

            if (error) {
                if (error.code === '23505') {
                    toast.error('Group ID already exists. Please choose a unique ID.');
                } else {
                    console.error('Supabase Error:', error);
                    toast.error('Error creating group.');
                }
                return;
            }

            // Add creator to group_members
            const creatorName = localStorage.getItem('userName') || authUser.user_metadata?.full_name || 'Admin';
            await supabase.from('group_members').insert([{
                group_id: groupId,
                user_id: authUser.id,
                user_name: creatorName,
                role: 'Admin'
            }]);

            toast.success('Learning Path created!');
            navigate(`/group/${groupId}`);
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error('Failed to create learning path.');
        } finally {
            setLoading(false);
        }
    };

    const handleLearningJoin = async () => {
        const { groupId, groupKey } = formData.join;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collab_groups')
                .select('*')
                .eq('group_id', groupId)
                .single();

            if (error || !data) {
                toast.error('Group not found. Please check the Group ID.');
                return;
            }

            if (data.group_key !== groupKey) {
                toast.error('Incorrect Group Key (PIN).');
                return;
            }

            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const joinerName = localStorage.getItem('userName') || authUser.user_metadata?.full_name || 'User';
                const { error: joinError } = await supabase.from('group_members').insert([{
                    group_id: groupId,
                    user_id: authUser.id,
                    user_name: joinerName,
                    role: 'Member'
                }]);
                if (joinError && joinError.code !== '23505') {
                    console.warn('Error joining group_members:', joinError);
                }
            }

            toast.success('Joined Learning Path!');
            navigate(`/group/${groupId}`);
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error('Failed to join learning path.');
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
                        Create Group
                    </button>
                    <button
                        className={`toggle-btn ${actionType === 'join' ? 'active' : ''}`}
                        onClick={() => setActionType('join')}
                    >
                        <LogIn size={18} />
                        Join Group
                    </button>
                </div>

                <form className="action-form" onSubmit={(e) => e.preventDefault()}>
                    {actionType === 'create' ? (
                        <>
                            <div className="form-row">
                                <input
                                    name="groupName"
                                    type="text"
                                    placeholder="Group Name"
                                    className="action-input"
                                    value={formData.create.groupName}
                                    onChange={(e) => onInputChange(e, 'create')}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    name="groupId"
                                    type="text"
                                    placeholder="Group ID"
                                    className="action-input"
                                    value={formData.create.groupId}
                                    onChange={(e) => onInputChange(e, 'create')}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    name="groupKey"
                                    type="text"
                                    maxLength={5}
                                    placeholder="Group Key (4 or 5 digit PIN)"
                                    className={`action-input ${formData.create.groupKey && !/^\d{4,5}$/.test(formData.create.groupKey) ? 'error' : ''}`}
                                    value={formData.create.groupKey}
                                    onChange={(e) => {
                                        if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                            onInputChange(e, 'create');
                                        }
                                    }}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                                {formData.create.groupKey && !/^\d{4,5}$/.test(formData.create.groupKey) && (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        <span>Key must be a 4 or 5 digit numeric PIN</span>
                                    </div>
                                )}
                                {(formData.create.groupName || formData.create.groupId || formData.create.groupKey) &&
                                    (!formData.create.groupName.trim() || !formData.create.groupId.trim() || !/^\d{4,5}$/.test(formData.create.groupKey)) && (
                                        <div className="error-message" style={{ justifyContent: 'center', marginBottom: '0.8rem', opacity: 0.9 }}>
                                            <AlertCircle size={14} />
                                            <span>
                                                {(() => {
                                                    const missing = [];
                                                    if (!formData.create.groupName.trim()) missing.push('Name');
                                                    if (!formData.create.groupId.trim()) missing.push('ID');
                                                    if (!formData.create.groupKey) missing.push('Key');

                                                    if (missing.length === 3) return 'Please enter all fields';
                                                    if (missing.length === 2) return `Please enter Group ${missing[0]} and ${missing[1]}`;
                                                    if (missing.length === 1) return `Please enter Group ${missing[0]}`;

                                                    if (!/^\d{4,5}$/.test(formData.create.groupKey)) return 'Invalid PIN format';
                                                    return '';
                                                })()}
                                            </span>
                                        </div>
                                    )}
                            </div>
                            <button
                                className="submit-action-btn"
                                onClick={activeTab === 'coding' ? handleCodingCreate : handleLearningCreate}
                                disabled={loading || !formData.create.groupName.trim() || !formData.create.groupId.trim() || !/^\d{4,5}$/.test(formData.create.groupKey)}
                                style={{
                                    opacity: (loading || !formData.create.groupName.trim() || !formData.create.groupId.trim() || !/^\d{4,5}$/.test(formData.create.groupKey)) ? 0.4 : 1,
                                    cursor: (loading || !formData.create.groupName.trim() || !formData.create.groupId.trim() || !/^\d{4,5}$/.test(formData.create.groupKey)) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Creating...
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
                                    name="groupId"
                                    type="text"
                                    placeholder="Group ID"
                                    className="action-input"
                                    value={formData.join.groupId}
                                    onChange={(e) => onInputChange(e, 'join')}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    name="groupKey"
                                    type="text"
                                    maxLength={5}
                                    placeholder="Group Key (PIN)"
                                    className={`action-input ${formData.join.groupKey && !/^\d{4,5}$/.test(formData.join.groupKey) ? 'error' : ''}`}
                                    value={formData.join.groupKey}
                                    onChange={(e) => {
                                        if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                            onInputChange(e, 'join');
                                        }
                                    }}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                />
                                {formData.join.groupKey && !/^\d{4,5}$/.test(formData.join.groupKey) && (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        <span>Key must be a 4 or 5 digit numeric PIN</span>
                                    </div>
                                )}
                            </div>
                            {(formData.join.groupId || formData.join.groupKey) &&
                                (!formData.join.groupId.trim() || !/^\d{4,5}$/.test(formData.join.groupKey)) && (
                                    <div className="error-message" style={{ justifyContent: 'center', marginBottom: '0.8rem', opacity: 0.9 }}>
                                        <AlertCircle size={14} />
                                        <span>
                                            {(() => {
                                                const missing = [];
                                                if (!formData.join.groupId.trim()) missing.push('ID');
                                                if (!formData.join.groupKey) missing.push('Key');

                                                if (missing.length === 2) return 'Please enter Group ID and Key';
                                                if (missing.length === 1) return `Please enter Group ${missing[0]}`;
                                                if (!/^\d{4,5}$/.test(formData.join.groupKey)) return 'Invalid PIN format';
                                                return '';
                                            })()}
                                        </span>
                                    </div>
                                )}
                            <button
                                className="submit-action-btn"
                                disabled={loading || !formData.join.groupId.trim() || !/^\d{4,5}$/.test(formData.join.groupKey)}
                                onClick={activeTab === 'coding' ? handleCodingJoin : handleLearningJoin}
                                style={{
                                    opacity: (loading || !formData.join.groupId.trim() || !/^\d{4,5}$/.test(formData.join.groupKey)) ? 0.4 : 1,
                                    cursor: (loading || !formData.join.groupId.trim() || !/^\d{4,5}$/.test(formData.join.groupKey)) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Authenticating...
                                    </>
                                ) : (
                                    'Enter Group'
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
