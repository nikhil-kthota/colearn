import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Upload, FilePlus, FileText, Loader2 } from 'lucide-react';

const FilesColumn = ({ isCollapsed, toggleCollapse, onFileSelect, selectedFile }) => {
    const { id: groupId } = useParams();
    const fileInputRef = useRef(null);
    const [files, setFiles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);

    React.useEffect(() => {
        if (groupId) {
            fetchFiles();
        }
    }, [groupId]);

    const fetchFiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('group_files')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

        if (data) setFiles(data);
        setLoading(false);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const { data: { user } } = await supabase.auth.getUser();

        for (const file of selectedFiles) {
            const filePath = `${groupId}/${Date.now()}_${file.name}`;
            
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('group-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                continue;
            }

            // 2. Log in Database
            const { error: dbError } = await supabase
                .from('group_files')
                .insert([{
                    group_id: groupId,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type,
                    uploaded_by: user.id
                }]);

            if (dbError) console.error('DB Error:', dbError);
        }

        setUploading(false);
        fetchFiles();
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
