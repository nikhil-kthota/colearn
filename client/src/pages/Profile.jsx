import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Shield, Settings, Trash2, ArrowLeft, Sun, Moon, Check, X, Eye, EyeOff, Plus, LogOut, Loader2, Camera, User as UserIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/common/LoadingScreen';
import '../styles/Profile.css';

const Profile = ({ isDark, toggleTheme }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showMainPassword, setShowMainPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAvatarDeleteConfirm, setShowAvatarDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Model editing states
    const [editingModelId, setEditingModelId] = useState(null);
    const [editingModelData, setEditingModelData] = useState({ name: '', key: '' });
    const [isAddingModel, setIsAddingModel] = useState(false);
    const [newModelData, setNewModelData] = useState({ name: '', key: '' });
    const [visibleModelIds, setVisibleModelIds] = useState(new Set());
    const [showNewModelKey, setShowNewModelKey] = useState(false);

    // Cropper states
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isRecentering, setIsRecentering] = useState(false);

    // User data state
    const [user, setUser] = useState({
        name: 'User',
        email: '',
        joinedDate: '',
        groupsJoined: 0,
        avatarUrl: '',
        avatarCrop: { x: 0, y: 0, zoom: 1 },
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

            // Fetch groups joined by this user, excluding groups they created to avoid double counting
            const { count: groupsJoined } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', authUser.id)
                .neq('role', 'Admin');

            // Fetch AI models for this user
            const { data: aiModels, error: modelsError } = await supabase
                .from('user_ai_models')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false });

            if (modelsError) console.error('Error fetching AI models:', modelsError);

            // Fetch profile data from the public.profiles table
        const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, avatar_url, avatar_crop')
                .eq('id', authUser.id)
                .single();

            const userData = {
                name: profile?.full_name || authUser.user_metadata?.full_name || 'User',
                email: authUser.email,
                joinedDate: new Date(authUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                groupsCreated: groupsCreated || 0,
                groupsJoined: groupsJoined || 0,
                avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
                avatarCrop: profile?.avatar_crop || { x: 0, y: 0, zoom: 1 },
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
            const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser();
            if (authUserError || !authUser) {
                throw new Error("User not authenticated.");
            }

            // 1. Update auth.users metadata
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: { full_name: formData.name }
            });

            if (authUpdateError) throw authUpdateError;

            // 2. Update profiles table
            const { error: dbError } = await supabase
                .from('profiles')
                .upsert({ 
                    id: authUser.id, 
                    full_name: formData.name,
                    updated_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            setUser({ ...formData });
            setIsEditing(false);
            localStorage.setItem('userName', formData.name);
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Failed to update profile.');
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
            toast.success('Model updated!');
        } catch (err) {
            console.error('Error updating model:', err);
            toast.error('Failed to update model.');
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
            toast.success('New model added!');
        } catch (err) {
            console.error('Error adding model:', err);
            toast.error('Failed to add model.');
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
                toast.success('Model deleted.');
            } catch (err) {
                console.error('Error deleting model:', err);
                toast.error('Failed to delete model.');
            }
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedArea); // We'll save the percentages (0-100)
    };

    const handleAvatarFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a PNG, JPG, or JPEG image.');
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result);
            setCrop({ x: 0, y: 0 }); // Reset for new upload
            setZoom(1);
            setShowCropModal(true);
        });
        reader.readAsDataURL(file);
    };

    const handleRecenter = () => {
        if (!user.avatarUrl) return;
        setImageSrc(user.avatarUrl);
        setCrop(user.avatarCrop?.crop || { x: 0, y: 0 });
        setZoom(user.avatarCrop?.zoom || 1);
        setIsRecentering(true);
        setShowCropModal(true);
    };

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleConfirmCrop = async () => {
        if (!imageSrc) return;

        setUploading(true);
        setShowCropModal(false);

        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            let finalUrl = user.avatarUrl;

            // Only upload if it's a NEW image (not just recentering)
            if (!isRecentering) {
                // Get the raw file from the input to upload ORIGINAL, not cropped
                const file = fileInputRef.current.files[0];
                const filePath = `avatars/${authUser.id}-${Date.now()}.${file.name.split('.').pop()}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                
                finalUrl = publicUrl;

                // Cleanup old storage file
                if (user.avatarUrl) {
                    try {
                        const oldPath = user.avatarUrl.split('/public/avatars/')[1];
                        if (oldPath) await supabase.storage.from('avatars').remove([oldPath]);
                    } catch (e) { console.warn(e); }
                }
            }

            // Save settings and URL to DB
            const { error: dbUpdateError } = await supabase
                .from('profiles')
                .upsert({ 
                    id: authUser.id, 
                    avatar_url: finalUrl,
                    avatar_crop: { ...croppedAreaPixels, zoom }, // Save the PERCENTAGES
                    updated_at: new Date().toISOString()
                });

            if (dbUpdateError) throw dbUpdateError;

            await supabase.auth.updateUser({
                data: { avatar_url: finalUrl }
            });

            setUser(prev => ({ 
                ...prev, 
                avatarUrl: finalUrl,
                avatarCrop: { ...croppedAreaPixels, zoom }
            }));
            
            toast.success(isRecentering ? 'Position updated!' : 'Profile picture uploaded!');
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to save changes.');
        } finally {
            setUploading(false);
            setImageSrc(null);
            setIsRecentering(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAvatar = async () => {
        setUploading(true);
        setShowAvatarDeleteConfirm(false);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const { error: dbUpdateError } = await supabase
                .from('profiles')
                .update({ 
                    avatar_url: null,
                    avatar_crop: null, // ALSO CLEAR THE CROP DATA
                    updated_at: new Date().toISOString()
                })
                .eq('id', authUser.id);

            if (dbUpdateError) throw dbUpdateError;

            // Cleanup storage file
            if (user.avatarUrl) {
                try {
                    const oldPath = user.avatarUrl.split('/public/avatars/')[1];
                    if (oldPath) {
                        await supabase.storage.from('avatars').remove([oldPath]);
                    }
                } catch (e) {
                    console.warn('Failed to cleanup avatar file:', e);
                }
            }

            await supabase.auth.updateUser({
                data: { 
                    avatar_url: null,
                    // Note: avatar_crop is usually kept in profiles table, not auth metadata,
                    // but we clear what we might have there too if any.
                }
            });
            setUser(prev => ({ 
                ...prev, 
                avatarUrl: '',
                avatarCrop: null // CLEAR IN LOCAL STATE
            }));
            toast.success('Profile picture removed.');
        } catch (err) {
            console.error('Error deleting avatar:', err);
            toast.error('Failed to delete image.');
        } finally {
            setUploading(false);
        }
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
                <LoadingScreen message="Loading your profile..." />
            ) : (
                <main className="profile-content fade-in">
                    {/* Row 1: Profile Image and Details */}
                    <div className="profile-row profile-main-row">
                        <div className="profile-avatar-column">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarFileChange}
                                accept="image/png, image/jpeg, image/jpg"
                                style={{ display: 'none' }}
                            />
                            <div 
                                className={`profile-main-avatar ${uploading ? 'uploading' : ''}`}
                                title={user.avatarUrl ? "Hover for options" : "Click to upload"}
                            >
                                {uploading ? (
                                    <Loader2 className="animate-spin" size={40} />
                                ) : user.avatarUrl ? (
                                    <>
                                        <div className="avatar-img-wrapper">
                                                    <img 
                                                        src={user.avatarUrl} 
                                                        alt="Profile" 
                                                        className="avatar-img" 
                                                        style={{
                                                            width: `${100 / (user.avatarCrop?.width || 100) * 100}%`,
                                                            height: `${100 / (user.avatarCrop?.height || 100) * 100}%`,
                                                            position: 'absolute',
                                                            left: `${-(user.avatarCrop?.x || 0) * (100 / (user.avatarCrop?.width || 100))}%`,
                                                            top: `${-(user.avatarCrop?.y || 0) * (100 / (user.avatarCrop?.height || 100))}%`,
                                                        }}
                                                    />
                                        </div>
                                        <div className="avatar-edit-controls">
                                            <button className="avatar-control-btn" onClick={handleAvatarClick} title="Change Photo">
                                                <Camera size={18} />
                                            </button>
                                            <button className="avatar-control-btn" onClick={handleRecenter} title="Recenter/Crop">
                                                <Settings size={18} />
                                            </button>
                                            <button className="avatar-control-btn delete" onClick={() => setShowAvatarDeleteConfirm(true)} title="Remove Photo">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                        <button className="avatar-edit-overlay" onClick={handleAvatarClick}>
                                            <Camera size={32} />
                                        </button>
                                    </>
                                )}
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
                        
                        {/* Avatar Delete Confirmation Modal */}
                        {showAvatarDeleteConfirm && (
                            <div className="delete-confirm-overlay fade-in">
                                <div className="delete-confirm-modal">
                                    <div className="delete-modal-icon">
                                        <Trash2 size={32} />
                                    </div>
                                    <h3>Remove Photo?</h3>
                                    <p>Are you sure you want to remove your profile picture?</p>
                                    
                                    <div className="delete-modal-actions">
                                        <button 
                                            className="cancel-modal-btn"
                                            onClick={() => setShowAvatarDeleteConfirm(false)}
                                            disabled={uploading}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="confirm-delete-btn"
                                            onClick={handleDeleteAvatar}
                                            disabled={uploading}
                                        >
                                            {uploading ? (
                                                <><Loader2 size={16} className="animate-spin" /> Removing...</>
                                            ) : (
                                                <><Trash2 size={16} /> Remove Photo</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            )}
            {showCropModal && (
                <div className="crop-modal-overlay">
                    <div className="crop-modal-container">
                        <div className="crop-header">
                            <h3>Edit Profile Picture</h3>
                            <button className="icon-btn-small cancel" onClick={() => setShowCropModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="crop-area-container">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>
                        <div className="crop-controls">
                            <div className="zoom-slider-container">
                                <span>Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="zoom-slider"
                                />
                            </div>
                            <div className="crop-footer-btns">
                                <button className="crop-btn cancel" onClick={() => setShowCropModal(false)}>Cancel</button>
                                <button className="crop-btn confirm" onClick={handleConfirmCrop}>Save Profile Picture</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
