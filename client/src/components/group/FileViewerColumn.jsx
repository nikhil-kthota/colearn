import React from 'react';
import { Download, FileText, ExternalLink, Trash2, Image as ImageIcon, Film, Music, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';

const FileViewerColumn = ({ selectedFile, onDelete }) => {
    const [publicUrl, setPublicUrl] = React.useState(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
        if (selectedFile && !selectedFile.isOptimistic) {
            const { data } = supabase.storage
                .from('group-assets')
                .getPublicUrl(selectedFile.file_path);
            setPublicUrl(data.publicUrl);
        } else {
            setPublicUrl(null);
        }
    }, [selectedFile]);

    const handleDelete = async () => {
        if (!selectedFile || selectedFile.isOptimistic) return;
        if (!window.confirm('Are you sure you want to delete this file? This cannot be undone.')) return;

        setIsDeleting(true);
        try {
            // 1. Delete from storage
            const { error: storageError } = await supabase.storage
                .from('group-assets')
                .remove([selectedFile.file_path]);

            if (storageError) {
                console.error('Storage Delete Error:', storageError);
            }

            // 2. Delete from database
            const { error: dbError } = await supabase
                .from('group_files')
                .delete()
                .eq('id', selectedFile.id);

            if (dbError) throw dbError;

            if (onDelete) onDelete();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting file: ' + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const renderPreview = () => {
        if (!selectedFile) return null;
        
        const type = selectedFile.file_type || '';
        
        if (type.startsWith('image/')) {
            return (
                <div className="preview-media-container">
                    {publicUrl ? (
                         <img src={publicUrl} alt={selectedFile.file_name} className="preview-media-image" />
                    ) : (
                         <ImageIcon size={64} className="preview-placeholder-icon" />
                    )}
                </div>
            );
        } else if (type === 'application/pdf') {
            return (
                <div className="preview-media-container pdf-container">
                    {publicUrl ? (
                        <iframe src={`${publicUrl}#toolbar=0`} title="PDF Preview" className="preview-media-pdf" />
                    ) : (
                        <FileText size={64} className="preview-placeholder-icon" />
                    )}
                </div>
            );
        } else if (type.startsWith('video/')) {
            return (
                <div className="preview-media-container">
                    {publicUrl ? (
                        <video controls className="preview-media-video">
                            <source src={publicUrl} type={type} />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <Film size={64} className="preview-placeholder-icon" />
                    )}
                </div>
            );
        } else if (type.startsWith('audio/')) {
            return (
                <div className="preview-media-container audio-container">
                    {publicUrl ? (
                        <audio controls className="preview-media-audio">
                            <source src={publicUrl} type={type} />
                            Your browser does not support the audio tag.
                        </audio>
                    ) : (
                        <Music size={64} className="preview-placeholder-icon" />
                    )}
                </div>
            );
        }

        // Fallback large icon based on type
        return (
            <div className="preview-icon-large">
                <FileText size={64} strokeWidth={1} />
            </div>
        );
    };

    return (
        <div className="group-column viewer-column">
            <div className="column-header">FILE PREVIEW</div>
            <div className="column-content viewer-content-area">
                {selectedFile ? (
                    <div className="file-preview-details fade-in">
                        {renderPreview()}
                        
                        <h2 className="preview-title" title={selectedFile.file_name}>
                            {selectedFile.file_name}
                        </h2>
                        
                        <div className="preview-stats">
                            <span>Type: {selectedFile.file_type || 'Unknown'}</span>
                            <span>Size: {(selectedFile.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                        
                        <div className="preview-actions-grid">
                            <a 
                                href={publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`action-btn-large primary ${!publicUrl ? 'disabled' : ''}`}
                            >
                                <ExternalLink size={18} />
                                Open
                            </a>
                            <a 
                                href={publicUrl ? `${publicUrl}?download=` : '#'} 
                                download={selectedFile.file_name}
                                className={`action-btn-large secondary ${!publicUrl ? 'disabled' : ''}`}
                            >
                                <Download size={18} />
                                Download
                            </a>
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting || selectedFile.isOptimistic}
                                className="action-btn-large danger-btn"
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-preview">
                        <FileText size={48} className="empty-preview-icon" style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>Select a file from the sidebar to preview its details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileViewerColumn;
