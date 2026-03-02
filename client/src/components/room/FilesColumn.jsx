import React from 'react';

const FilesColumn = () => {
    return (
        <div className="room-column files-column">
            <div className="column-header">FILES</div>
            <div className="column-content">
                {/* File list content will go here */}
                <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No files uploaded yet.</p>
            </div>
        </div>
    );
};

export default FilesColumn;
