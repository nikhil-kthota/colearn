import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, FolderOpen, Upload, FilePlus } from 'lucide-react';

const FilesColumn = ({ isCollapsed, toggleCollapse }) => {
    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log("Selected files:", files);
            // File upload logic will go here
        }
    };

    return (
        <div className={`room-column files-column ${isCollapsed ? 'collapsed' : ''}`}>
            <div className={`column-header ${isCollapsed ? 'flex-column-center' : 'flex-between'}`}>
                {!isCollapsed && (
                    <div className="flex-center">
                        <FolderOpen size={16} className="mr-2" />
                        FILES
                    </div>
                )}

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
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
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
                    <div className="files-empty-state">
                        <div className="empty-icon-wrapper">
                            <FilePlus size={40} strokeWidth={1.5} />
                        </div>
                        <h3>No files yet</h3>
                        <p>Upload files to start collaborating with your team.</p>

                        <button className="upload-btn-primary" onClick={handleUploadClick}>
                            <Upload size={18} className="mr-2" />
                            Upload Files
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilesColumn;
