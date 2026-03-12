import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import GroupNavbar from '../components/group/GroupNavbar';
import FilesColumn from '../components/group/FilesColumn';
import FileViewerColumn from '../components/group/FileViewerColumn';
import AIAssistanceColumn from '../components/group/AIAssistanceColumn';
import '../styles/Group.css';

const Group = ({ isDark, toggleTheme }) => {
    const { id } = useParams();
    const [isFilesCollapsed, setIsFilesCollapsed] = useState(false);


    const groupNames = {
        '1': 'React Micro-Frontend',
        '2': 'System Design Patterns',
        '3': 'Python for Data Science',
        '4': 'Advanced Machine Learning'
    };

    const currentGroupName = groupNames[id] || "Collaboration Group";

    return (
        <div className="group-layout">
            <GroupNavbar
                groupName={currentGroupName}
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            <main className={`group-main-container ${isFilesCollapsed ? 'files-collapsed' : ''}`}>
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

export default Group;
