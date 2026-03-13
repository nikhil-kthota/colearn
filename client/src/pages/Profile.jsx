import React, { useState, useEffect } from 'react';
import { Edit2, Shield, Settings, Trash2, ArrowLeft, Sun, Moon, Check, X, Eye, EyeOff, Plus, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../styles/Profile.css';

const Profile = ({ isDark, toggleTheme }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showMainPassword, setShowMainPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Model editing states
    const [editingModelId, setEditingModelId] = useState(null);
    const [editingModelData, setEditingModelData] = useState({ name: '', key: '' });
    const [isAddingModel, setIsAddingModel] = useState(false);
    const [newModelData, setNewModelData] = useState({ name: '', key: '' });
    const [visibleModelIds, setVisibleModelIds] = useState(new Set());
    const [showNewModelKey, setShowNewModelKey] = useState(false);

    // User data state
    const [user, setUser] = useState({
        name: 'User',
        email: '',
        joinedDate: '',
        groupsCreated: 0,
        groupsJoined: 0,
        models: []
    });

    const [formData, setFormData] = useState({ ...user });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authUser) {
                navigate('/login');
                return;
            }

            // Fetch groups created by this user
            const { count: groupsCreated } = await supabase
                .from('collab_groups')
                .select('*', { count: 'exact', head: true })
                .eq('created_by', authUser.id);

            // Fetch AI models for this user
            const { data: aiModels, error: modelsError } = await supabase
                .from('user_ai_models')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false });

            if (modelsError) console.error('Error fetching AI models:', modelsError);

            const userData = {
                name: authUser.user_metadata?.full_name || 'User',
                email: authUser.email,
                joinedDate: new Date(authUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                groupsCreated: groupsCreated || 0,
                groupsJoined: 0, // This would require a junction table like 'group_members'
                models: aiModels || []
            };

            setUser(userData);
            setFormData(userData);
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('userName');
        navigate('/');
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setFormData({ ...user });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: formData.name }
            });

            if (error) throw error;

            setUser({ ...formData });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Model handlers
    const toggleModelVisibility = (id) => {
        const newVisible = new Set(visibleModelIds);
        if (newVisible.has(id)) newVisible.delete(id);
        else newVisible.add(id);
        setVisibleModelIds(newVisible);
    };

    const startEditingModel = (model) => {
        setEditingModelId(model.id);
        setEditingModelData({ name: model.name, key: model.key });
    };

    const cancelEditingModel = () => {
        setEditingModelId(null);
        setEditingModelData({ name: '', key: '' });
    };

    const saveModelEdit = async (id) => {
        try {
            const { error } = await supabase
                .from('user_ai_models')
                .update({ 
                    name: editingModelData.name, 
                    key: editingModelData.key 
                })
                .eq('id', id);

            if (error) throw error;

            setUser(prev => ({
                ...prev,
                models: prev.models.map(m =>
                    m.id === id ? { ...m, name: editingModelData.name, key: editingModelData.key } : m
                )
            }));
            setEditingModelId(null);
        } catch (err) {
            console.error('Error updating model:', err);
            alert('Failed to update model.');
        }
    };

    const handleAddModel = async () => {
        if (!newModelData.name.trim() || !newModelData.key.trim()) return;

        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('user_ai_models')
                .insert([{
                    user_id: authUser.id,
                    name: newModelData.name,
                    key: newModelData.key
                }])
                .select()
                .single();

            if (error) throw error;

            setUser(prev => ({
                ...prev,
                models: [data, ...prev.models]
            }));

            setNewModelData({ name: '', key: '' });
            setIsAddingModel(false);
            setShowNewModelKey(false);
        } catch (err) {
            console.error('Error adding model:', err);
            alert('Failed to add model.');
        }
    };

    const handleDeleteModel = async (id) => {
        if (window.confirm("Are you sure you want to delete this model?")) {
            try {
                const { error } = await supabase
                    .from('user_ai_models')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setUser(prev => ({
                    ...prev,
                    models: prev.models.filter(m => m.id !== id)
                }));
            } catch (err) {
                console.error('Error deleting model:', err);
                alert('Failed to delete model.');
            }
        }
    };

    const handleAvatarEdit = () => {
        alert("Avatar upload feature coming soon!");
    };

    const handleDeleteClick = () => setShowDeleteConfirm(true);
    const handleCancelDelete = () => setShowDeleteConfirm(false);
    const handleConfirmDelete = async () => {
        try {
            // In a real app, you might want to delete all user data first
            // or use a Supabase Edge Function to handle account deletion securely.
            // Directly deleting from auth.users requires admin privileges,
            // so we typically handle this by calling a database function or edge function.
            
            // For now, let's assume we have a way to trigger deletion or just sign out for demo.
            const { error } = await supabase.rpc('delete_user_account'); // Custom RPC function
            
            if (error) {
                // If RPC doesn't exist, fallback to warning the user
                console.warn('RPC delete_user_account not found. Using client-side sign out as placeholder.');
                await supabase.auth.signOut();
                navigate('/');
                return;
            }

            await supabase.auth.signOut();
            setShowDeleteConfirm(false);
            navigate('/');
        } catch (err) {
            console.error('Error deleting account:', err);
            alert('An error occurred. Please contact support to delete your account.');
        }
    };

    return (
        <div className="profile-page-wrapper">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <div className="profile-header-actions">
                <button className="profile-action-icon" onClick={handleLogout} title="Logout">
                    <LogOut size={20} />
                </button>
                <button className="profile-action-icon" onClick={toggleTheme} aria-label="Toggle Theme">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {loading ? (
                <div className="profile-loading">
                    <Loader2 className="animate-spin" size={48} />
                    <p>Loading your profile...</p>
                </div>
            ) : (
                <main className="profile-content">
                {/* Row 1: Profile Image and Details */}
                <div className="profile-row profile-main-row">
                    <div className="profile-avatar-column">
                        <div className="profile-main-avatar">
                            {user.name.split(' ').map(n => n[0]).join('')}
                            <button className="avatar-edit-overlay" onClick={handleAvatarEdit}>
                                <Edit2 size={24} />
                            </button>
                        </div>
                    </div>

                    <div className={`profile-card info-card ${isEditing ? 'editing-active' : ''}`}>
                        <div className="card-header">
                            <h2>Profile Details</h2>
                            {!isEditing ? (
                                <button className="icon-btn-small" onClick={handleEditToggle}>
                                    <Edit2 size={16} />
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button className="icon-btn-small cancel" onClick={handleEditToggle}>
                                        <X size={16} />
                                    </button>
                                    <button className="icon-btn-small save" onClick={handleSave}>
                                        <Check size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="info-grid">
                            <div className="info-group">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input name="name" value={formData.name} onChange={handleChange} className="profile-input" />
                                ) : (
                                    <span>{user.name}</span>
                                )}
                            </div>
                            <div className="info-group">
                                <label>Email Address</label>
                                <span>{user.email}</span>
                            </div>
                            <div className="info-group">
                                <label>Joined Date</label>
                                <span>{user.joinedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Activity and Models */}
                <div className="profile-row profile-secondary-row">
                    <div className="profile-card stats-card">
                        <div className="card-header">
                            <Settings size={20} className="header-icon" />
                            <h2>Your Activity</h2>
                        </div>
                        <div className="stats-list">
                            <div className="stat-entry">
                                <span className="stat-label">Groups Created</span>
                                <span className="stat-value">{user.groupsCreated}</span>
                            </div>
                            <div className="stat-entry">
                                <span className="stat-label">Groups Joined</span>
                                <span className="stat-value">{user.groupsJoined}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card models-card">
                        <div className="card-header">
                            <Shield size={20} className="header-icon" />
                            <h2>My Models</h2>
                            <button className="add-model-btn" onClick={() => setIsAddingModel(true)} title="Add New Model">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="models-list">
                            {isAddingModel && (
                                <div className="model-entry adding">
                                    <div className="model-edit-fields">
                                        <input
                                            className="model-edit-input"
                                            value={newModelData.name}
                                            onChange={e => setNewModelData({ ...newModelData, name: e.target.value })}
                                            placeholder="Model Name (e.g. Gemini 1.5 Pro)"
                                            autoFocus
                                        />
                                        <div className="model-key-edit-wrapper">
                                            <input
                                                className="model-edit-input"
                                                type={showNewModelKey ? "text" : "password"}
                                                value={newModelData.key}
                                                onChange={e => setNewModelData({ ...newModelData, key: e.target.value })}
                                                placeholder="API Key"
                                            />
                                            <button
                                                className="visibility-btn small"
                                                onClick={() => setShowNewModelKey(!showNewModelKey)}
                                            >
                                                {showNewModelKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="model-actions">
                                        <button className="model-action-btn save" onClick={handleAddModel}>
                                            <Check size={14} />
                                        </button>
                                        <button className="model-action-btn cancel" onClick={() => setIsAddingModel(false)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {user.models.length > 0 ? (
                                user.models.map(model => (
                                    <div key={model.id} className={`model-entry ${editingModelId === model.id ? 'editing' : ''}`}>
                                        <div className="model-info">
                                            {editingModelId === model.id ? (
                                                <div className="model-edit-fields">
                                                    <input
                                                        className="model-edit-input"
                                                        value={editingModelData.name}
                                                        onChange={e => setEditingModelData({ ...editingModelData, name: e.target.value })}
                                                        placeholder="Model Name"
                                                    />
                                                    <div className="model-key-edit-wrapper">
                                                        <input
                                                            className="model-edit-input"
                                                            type={visibleModelIds.has(model.id) ? "text" : "password"}
                                                            value={editingModelData.key}
                                                            onChange={e => setEditingModelData({ ...editingModelData, key: e.target.value })}
                                                            placeholder="API Key"
                                                        />
                                                        <button
                                                            className="visibility-btn small"
                                                            onClick={() => toggleModelVisibility(model.id)}
                                                        >
                                                            {visibleModelIds.has(model.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="model-name">{model.name}</span>
                                                    <div className="model-key-row">
                                                        <code className="model-key">
                                                            {visibleModelIds.has(model.id) ? model.key : '••••••••••••••••'}
                                                        </code>
                                                        <button
                                                            className="visibility-btn small"
                                                            onClick={() => toggleModelVisibility(model.id)}
                                                        >
                                                            {visibleModelIds.has(model.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="model-actions">
                                            {editingModelId === model.id ? (
                                                <>
                                                    <button className="model-action-btn save" onClick={() => saveModelEdit(model.id)}>
                                                        <Check size={14} />
                                                    </button>
                                                    <button className="model-action-btn cancel" onClick={cancelEditingModel}>
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="model-static-actions">
                                                    <button className="model-settings-icon" onClick={() => startEditingModel(model)} title="Edit Model">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="model-settings-icon delete" onClick={() => handleDeleteModel(model.id)} title="Delete Model">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-models">No models added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 3: Account Actions */}
                <div className="profile-row profile-actions-row">
                    {!showDeleteConfirm ? (
                        <button className="delete-account-btn" onClick={handleDeleteClick}>
                            <Trash2 size={18} />
                            <span>Delete My Account</span>
                        </button>
                    ) : (
                        <div className="delete-full-width-box">
                            <div className="delete-content">
                                <h3>This action is permanent. Do you wish to continue?</h3>
                                <div className="confirm-btns">
                                    <button className="confirm-btn cancel" onClick={handleCancelDelete}>No, Keep it</button>
                                    <button className="confirm-btn confirm" onClick={handleConfirmDelete}>Yes, Delete Account</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </main>
            )}
        </div>
    );
};

export default Profile;
