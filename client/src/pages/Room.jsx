import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import RoomNavbar from '../components/room/RoomNavbar';
import FilesColumn from '../components/room/FilesColumn';
import FileViewerColumn from '../components/room/FileViewerColumn';
import AIAssistanceColumn from '../components/room/AIAssistanceColumn';
import '../styles/Room.css';

const Room = ({ isDark, toggleTheme }) => {
    const { id } = useParams();
    const [isFilesCollapsed, setIsFilesCollapsed] = useState(false);

    // Simple placeholder logic for room names based on ID
    const roomNames = {
        '1': 'React Micro-Frontend',
        '2': 'System Design Patterns',
        '3': 'Python for Data Science',
        '4': 'Advanced Machine Learning'
    };

    const currentRoomName = roomNames[id] || "Collaboration Room";

    return (
        <div className="room-layout">
            <RoomNavbar
                roomName={currentRoomName}
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            <main className={`room-main-container ${isFilesCollapsed ? 'files-collapsed' : ''}`}>
                <FilesColumn
                    isCollapsed={isFilesCollapsed}
                    toggleCollapse={() => setIsFilesCollapsed(!isFilesCollapsed)}
                />
                <FileViewerColumn />
                <AIAssistanceColumn />
            </main>
        </div>
    );
};

export default Room;
