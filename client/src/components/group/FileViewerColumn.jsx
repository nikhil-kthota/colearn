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
            <div className="column-header flex-between" style={{ alignItems: 'center' }}>
                <div className="preview-header-title">
                    {selectedFile ? selectedFile.file_name : 'FILE PREVIEW'}
                </div>
                
                {selectedFile && publicUrl && (
                    <div className="preview-header-actions">
                        <a 
                            href={publicUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="header-action-link"
                        >
                            <ExternalLink size={16} />
                            <span>Open</span>
                        </a>
                        <a 
                            href={`${publicUrl}?download=`} 
                            download={selectedFile.file_name}
                            className="header-action-link"
                        >
                            <Download size={16} />
                            <span>Download</span>
                        </a>
                    </div>
                )}
            </div>
            <div className="column-content viewer-content-area no-padding">
                {selectedFile ? (
                    <div className="file-preview-details full-height fade-in">
                        {renderPreview()}
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
