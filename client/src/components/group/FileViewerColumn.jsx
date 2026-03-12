import React from 'react';

const FileViewerColumn = () => {
    return (
        <div className="group-column viewer-column">
            <div className="column-header">FILE VIEWER</div>
            <div className="column-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', opacity: 0.3 }}>
                    <p>Select a file to preview</p>
                </div>
            </div>
        </div>
    );
};

export default FileViewerColumn;
