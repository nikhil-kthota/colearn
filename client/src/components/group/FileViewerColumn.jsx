import React from 'react';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../../supabase';

const FileViewerColumn = ({ selectedFile }) => {
    const [publicUrl, setPublicUrl] = React.useState(null);

    React.useEffect(() => {
        if (selectedFile) {
            const { data } = supabase.storage
                .from('group-assets')
                .getPublicUrl(selectedFile.file_path);
            setPublicUrl(data.publicUrl);
        }
    }, [selectedFile]);

    return (
        <div className="group-column viewer-column">
            <div className="column-header">FILE PREVIEW</div>
            <div className="column-content">
                {selectedFile ? (
                    <div className="file-preview-details fade-in">
                        <div className="preview-icon-large">
                            <FileText size={64} strokeWidth={1} />
                        </div>
                        <h2>{selectedFile.file_name}</h2>
                        <div className="preview-stats">
                            <span>Type: {selectedFile.file_type || 'Unknown'}</span>
                            <span>Size: {(selectedFile.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                        
                        <div className="preview-actions">
                            <a 
                                href={publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="action-btn-large primary"
                            >
                                <ExternalLink size={18} />
                                Open File
                            </a>
                            <a 
                                href={`${publicUrl}?download=`} 
                                download={selectedFile.file_name}
                                className="action-btn-large secondary"
                            >
                                <Download size={18} />
                                Download
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="empty-preview">
                        <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>Select a file from the sidebar to preview its details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileViewerColumn;
