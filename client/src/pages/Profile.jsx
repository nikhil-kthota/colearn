import React, { useState } from 'react';
import { Edit2, Shield, Settings, Trash2, ArrowLeft, Sun, Moon, Check, X, Eye, EyeOff, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = ({ isDark, toggleTheme }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showMainPassword, setShowMainPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Model editing states
    const [editingModelId, setEditingModelId] = useState(null);
    const [editingModelData, setEditingModelData] = useState({ name: '', key: '' });
    const [isAddingModel, setIsAddingModel] = useState(false);
    const [newModelData, setNewModelData] = useState({ name: '', key: '' });
    const [visibleModelIds, setVisibleModelIds] = useState(new Set());
    const [showNewModelKey, setShowNewModelKey] = useState(false);

    // Placeholder user data
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123',
        joinedDate: 'January 2024',
        roomsCreated: 12,
        roomsJoined: 45,
        role: 'Full Stack Developer',
        models: [
            { id: 1, name: 'Gemini 3 Flash', key: 'AIzaSyBw-x8Y2z9A7v5u4t3x9Z' },
            { id: 2, name: 'GPT-4o', key: 'sk-proj-r2v8c9d0f1g2h3j4k5l6m9Xq' }
        ]
    });

    const [formData, setFormData] = useState({ ...user });

    const handleEditToggle = () => {
        if (isEditing) {
            setFormData({ ...user });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        setUser({ ...formData });
        setIsEditing(false);
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

    const saveModelEdit = (id) => {
        setUser(prev => ({
            ...prev,
            models: prev.models.map(m =>
                m.id === id ? { ...m, name: editingModelData.name, key: editingModelData.key } : m
            )
        }));
        setEditingModelId(null);
    };

    const handleAddModel = () => {
        if (!newModelData.name.trim() || !newModelData.key.trim()) return;

        const newModel = {
            id: Date.now(),
            name: newModelData.name,
            key: newModelData.key
        };

        setUser(prev => ({
            ...prev,
            models: [newModel, ...prev.models]
        }));

        setNewModelData({ name: '', key: '' });
        setIsAddingModel(false);
        setShowNewModelKey(false);
    };

    const handleDeleteModel = (id) => {
        if (window.confirm("Are you sure you want to delete this model?")) {
            setUser(prev => ({
                ...prev,
                models: prev.models.filter(m => m.id !== id)
            }));
        }
    };

    const handleAvatarEdit = () => {
        alert("Avatar upload feature coming soon!");
    };

    const handleDeleteClick = () => setShowDeleteConfirm(true);
    const handleCancelDelete = () => setShowDeleteConfirm(false);
    const handleConfirmDelete = () => {
        alert("Account deletion logic goes here");
        setShowDeleteConfirm(false);
    };

    return (
        <div className="profile-page-wrapper">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <button className="profile-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

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
                            <div className="info-group">
                                <label>Password</label>
                                <div className="password-row">
                                    {isEditing ? (
                                        <div className="password-edit-wrapper">
                                            <input
                                                type={showMainPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="profile-input"
                                            />
                                            <button className="visibility-btn" onClick={() => setShowMainPassword(!showMainPassword)}>
                                                {showMainPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="password-display">
                                            <span>{showMainPassword ? user.password : '••••••••••••'}</span>
                                            <button className="visibility-btn" onClick={() => setShowMainPassword(!showMainPassword)}>
                                                {showMainPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                                <span className="stat-label">Rooms Created</span>
                                <span className="stat-value">{user.roomsCreated}</span>
                            </div>
                            <div className="stat-entry">
                                <span className="stat-label">Rooms Joined</span>
                                <span className="stat-value">{user.roomsJoined}</span>
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
        </div>
    );
};

export default Profile;
