import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Upload, FilePlus, FileText, Loader2, Trash2 } from 'lucide-react';

const FilesColumn = ({ isCollapsed, toggleCollapse, onFileSelect, selectedFile, refreshTrigger }) => {
    const { id: groupId } = useParams();
    const fileInputRef = useRef(null);
    const [files, setFiles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState(null);

    React.useEffect(() => {
        if (groupId) {
            fetchFiles();
        }
    }, [groupId, refreshTrigger]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('group_files')
                .select('*')
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching files. Table might not exist:', error);
            } else if (data) {
                setFiles(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching files:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length === 0) return;

        setUploading(true);
        
        let currentUserContext = null;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            currentUserContext = user;
        } catch(err) {
            console.warn('Could not get user for upload context', err);
        }

        const newFiles = Array.from(selectedFiles);
        let updatedDb = false;

        for (const file of newFiles) {
            const filePath = `${groupId}/${Date.now()}_${file.name}`;
            
            // Optimistic UI Update
            const optimisticFile = {
                id: Date.now() + Math.random(),
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                file_path: filePath,
                group_id: groupId,
                isOptimistic: true
            };
            setFiles(prev => [optimisticFile, ...prev]);

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('group-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                alert(`⚠️ Storage Error: Could not upload "${file.name}".\nPlease ensure you have created a public bucket named "group-assets" in Supabase.`);
                // Remove optimistic file on failure
                setFiles(prev => prev.filter(f => f.id !== optimisticFile.id));
                continue;
            }

            // 2. Log in Database
            if (currentUserContext) {
                const { error: dbError } = await supabase
                    .from('group_files')
                    .insert([{
                        group_id: groupId,
                        file_name: file.name,
                        file_path: filePath,
                        file_size: file.size,
                        file_type: file.type,
                        uploaded_by: currentUserContext.id
                    }]);

                if (dbError) {
                    console.error('DB Error:', dbError);
                    alert(`⚠️ Database Error: File uploaded to storage, but could not save record.\nPlease ensure you have created the "group_files" table.`);
                } else {
                    updatedDb = true;
                }
            }
        }

        setUploading(false);
        // Reset input so same file can be uploaded again if needed
        e.target.value = '';
        
        if (updatedDb) {
            fetchFiles();
        }
    }; // Close handleFileChange

    const handleFileDelete = async (e, file) => {
        e.stopPropagation(); // prevent selecting the file
        if (file.isOptimistic) return;
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        setDeletingId(file.id);
        try {
            // 1. Storage remove
            const { error: storageError } = await supabase.storage
                .from('group-assets')
                .remove([file.file_path]);

            if (storageError) console.error('Storage Delete Error:', storageError);

            // 2. Database remove
            const { error: dbError } = await supabase
                .from('group_files')
                .delete()
                .eq('id', file.id);

            if (dbError) throw dbError;

            // Trigger global refresh (if the deleted file was the one currently viewed, we clear it here)
            // But since Group.jsx passes down a `handleFileDelete` for the viewer, we can just do a fetch here locally first.
            
            // Auto close preview if they delete the currently viewing file
            if (selectedFile?.id === file.id) {
                onFileSelect(null);
            }
            fetchFiles(); 
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting file: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownload = (e, file) => {
        e.stopPropagation(); // prevent selecting the file
        if (file.isOptimistic) return;
        
        const { data } = supabase.storage
            .from('group-assets')
            .getPublicUrl(file.file_path);
            
        // Trigger a download programmatically
        const a = document.createElement('a');
        a.href = `${data.publicUrl}?download=`;
        a.download = file.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className={`group-column files-column ${isCollapsed ? 'collapsed' : ''}`}>
            <div className={`column-header flex-between`}>
                <div className="flex-center">
                    FILES
                </div>

                <div className="header-actions flex-center">
                    {!isCollapsed && (
                        <button
                            className="collapse-toggle"
                            onClick={handleUploadClick}
                            title="Upload Files"
                        >
                            <Upload size={16} />
                        </button>
                    )}

                    <button
                        className="collapse-toggle"
                        onClick={toggleCollapse}
                        onMouseEnter={() => isCollapsed && toggleCollapse()}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? (
                            <>
                                <ChevronRight size={18} className="icon-desktop" />
                                <ChevronDown size={18} className="icon-mobile" />
                            </>
                        ) : (
                            <>
                                <ChevronLeft size={18} className="icon-desktop" />
                                <ChevronUp size={18} className="icon-mobile" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
            />

            {!isCollapsed && (
                <div className="column-content">
                    {loading ? (
                        <div className="files-loading">
                            <Loader2 className="animate-spin" size={24} />
                            <p>Loading files...</p>
                        </div>
                    ) : files.length > 0 ? (
                        <div className="files-list-container">
                            <div className="files-grid">
                                {files.map(file => (
                                    <div 
                                        key={file.id} 
                                        className={`file-item-card ${selectedFile?.id === file.id ? 'active' : ''}`}
                                        onClick={() => onFileSelect(file)}
                                    >
                                        <div className="file-icon-box">
                                            <FileText size={24} />
                                        </div>
                                        <div className="file-info">
                                            <span className="file-name-text" title={file.file_name}>{file.file_name}</span>
                                            <span className="file-meta">{(file.file_size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        
                                        <div className="file-item-actions">
                                            <button 
                                                className="file-action-btn file-action-download" 
                                                onClick={(e) => handleDownload(e, file)}
                                                title="Download"
                                                disabled={file.isOptimistic}
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button 
                                                className="file-action-btn file-action-delete" 
                                                onClick={(e) => handleFileDelete(e, file)}
                                                title="Delete"
                                                disabled={file.isOptimistic || deletingId === file.id}
                                            >
                                                {deletingId === file.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {uploading && (
                                <div className="uploading-overlay">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Uploading...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="files-empty-state">
                            <div className="empty-icon-wrapper">
                                <FilePlus size={40} strokeWidth={1.5} />
                            </div>
                            <h3>No files yet</h3>
                            <p>Upload files to start collaborating with others.</p>

                            <button className="upload-btn-primary" onClick={handleUploadClick} disabled={uploading}>
                                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} className="mr-2" />}
                                {uploading ? 'Uploading...' : 'Upload Files'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilesColumn;
