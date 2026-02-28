import React, { useState } from 'react';
import { User, Mail, Calendar, Edit2, Shield, Settings, Trash2, ArrowLeft, Sun, Moon, Check, X, Camera, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = ({ isDark, toggleTheme }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Placeholder user data
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        joinedDate: 'January 2024',
        roomsCreated: 12,
        roomsJoined: 45,
        role: 'Full Stack Developer',
        bio: 'Passionate about building collaborative tools and learning new technologies. Constantly exploring the world of micro-frontends and real-time systems.'
    });

    const [formData, setFormData] = useState({ ...user });

    const handleEditToggle = () => {
        if (isEditing) {
            // Revert changes on cancel
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

    const handleAvatarEdit = () => {
        alert("Avatar upload feature coming soon! (Supabase integration pending)");
    };

    const handleBannerEdit = () => {
        alert("Cover photo upload feature coming soon! (Supabase integration pending)");
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
                <div className="profile-header-section">
                    <div className="profile-banner">
                        <button
                            className="edit-banner-btn"
                            aria-label="Edit cover photo"
                            onClick={handleBannerEdit}
                        >
                            <Camera size={20} />
                            <span>Edit Cover</span>
                        </button>
                    </div>
                    <div className="profile-avatar-container">
                        <div className="profile-avatar-large">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <button
                            className="edit-avatar-btn"
                            aria-label="Edit avatar"
                            onClick={handleAvatarEdit}
                        >
                            <Camera size={18} />
                        </button>
                    </div>
                </div>

                <div className="profile-grid">
                    {/* Left Column: User Info */}
                    <div className={`profile-card info-card ${isEditing ? 'editing-active' : ''}`}>
                        <div className="card-header">
                            <h2>Profile Information</h2>
                            {!isEditing ? (
                                <button className="icon-btn-small" onClick={handleEditToggle} aria-label="Edit profile">
                                    <Edit2 size={16} />
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button className="icon-btn-small cancel" onClick={handleEditToggle} aria-label="Cancel editing">
                                        <X size={16} />
                                    </button>
                                    <button className="icon-btn-small save" onClick={handleSave} aria-label="Save changes">
                                        <Check size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="info-list">
                            <div className="info-item">
                                <User className="info-icon" size={20} />
                                <div className="info-text">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="profile-input"
                                        />
                                    ) : (
                                        <span>{user.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="info-item">
                                <Calendar className="info-icon" size={20} />
                                <div className="info-text">
                                    <label>Joined</label>
                                    <span>{user.joinedDate}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <Mail className="info-icon" size={20} />
                                <div className="info-text">
                                    <label>Email Address</label>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <Shield className="info-icon" size={20} />
                                <div className="info-text">
                                    <label>Password</label>
                                    <div className="password-display-wrapper">
                                        {isEditing ? (
                                            <div className="password-input-group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="profile-input"
                                                />
                                                <button
                                                    className="password-toggle-btn inside"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    tabIndex="-1"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="password-view-group">
                                                <span className="password-dots">
                                                    {showPassword ? user.password : "••••••••••••"}
                                                </span>
                                                <button
                                                    className="password-toggle-btn"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-bio">
                            <div className="bio-header">
                                <label>Bio</label>
                                {isEditing && (
                                    <span className={`char-count ${formData.bio.length >= 180 ? 'at-limit' : ''}`}>
                                        {formData.bio.length}/180
                                    </span>
                                )}
                            </div>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="profile-textarea"
                                    rows="4"
                                    maxLength="180"
                                />
                            ) : (
                                <p>{user.bio}</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Stats & Settings */}
                    <div className="profile-right-column">
                        <div className="profile-card stats-card">
                            <h2>Your Activity</h2>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">{user.roomsCreated}</span>
                                    <span className="stat-label">Rooms Created</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{user.roomsJoined}</span>
                                    <span className="stat-label">Rooms Joined</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-card account-actions-card">
                            <h2>Account Settings</h2>
                            <div className="action-list">
                                <button className="action-item delete">
                                    <Trash2 size={18} />
                                    <span>Delete Account</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
