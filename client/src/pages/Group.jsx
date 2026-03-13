import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import GroupNavbar from '../components/group/GroupNavbar';
import FilesColumn from '../components/group/FilesColumn';
import FileViewerColumn from '../components/group/FileViewerColumn';
import AIAssistanceColumn from '../components/group/AIAssistanceColumn';
import { supabase } from '../supabase';
import '../styles/Group.css';

const Group = ({ isDark, toggleTheme }) => {
    const { id } = useParams();
    const [isFilesCollapsed, setIsFilesCollapsed] = useState(false);
    const [groupName, setGroupName] = useState('Loading...');
    const [selectedFile, setSelectedFile] = useState(null);

    React.useEffect(() => {
        const fetchGroup = async () => {
            const { data, error } = await supabase
                .from('collab_groups')
                .select('group_name')
                .eq('group_id', id)
                .single();
            
            if (data) setGroupName(data.group_name);
        };
        fetchGroup();
    }, [id]);

    return (
        <div className="group-layout">
            <GroupNavbar
                groupName={groupName}
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            <main className={`group-main-container ${isFilesCollapsed ? 'files-collapsed' : ''}`}>
                <FilesColumn
                    isCollapsed={isFilesCollapsed}
                    toggleCollapse={() => setIsFilesCollapsed(!isFilesCollapsed)}
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                />
                <FileViewerColumn selectedFile={selectedFile} />
                <AIAssistanceColumn />
            </main>
        </div>
    );
};

export default Group;
