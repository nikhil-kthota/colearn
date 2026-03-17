import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import GroupNavbar from '../components/group/GroupNavbar';
import FilesColumn from '../components/group/FilesColumn';
import FileViewerColumn from '../components/group/FileViewerColumn';
import AIAssistanceColumn from '../components/group/AIAssistanceColumn';
import { supabase } from '../supabase';
import LoadingScreen from '../components/common/LoadingScreen';
import '../styles/Group.css';

const Group = ({ isDark, toggleTheme }) => {
    const { id } = useParams();
    const [isFilesCollapsed, setIsFilesCollapsed] = useState(false);
    const [groupName, setGroupName] = useState('Loading...');
    const [selectedFile, setSelectedFile] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleFileDelete = () => {
        setSelectedFile(null);
        setRefreshTrigger(prev => prev + 1);
    };

    React.useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };

        const fetchGroup = async () => {
            const { data, error } = await supabase
                .from('collab_groups')
                .select('group_name')
                .eq('group_id', id)
                .single();
            
            if (data) {
                setGroupName(data.group_name);
                // Update last activity
                await supabase
                    .from('collab_groups')
                    .update({ last_activity_at: new Date().toISOString() })
                    .eq('group_id', id);
            }
        };

        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchUserData(), fetchGroup()]);
            setLoading(false);
        };

        loadAll();
    }, [id]);

    if (loading) {
        return <LoadingScreen message={`Entering ${groupName === 'Loading...' ? 'Group' : groupName}...`} />;
    }

    return (
        <div className="group-layout">
            <GroupNavbar
                groupName={groupName}
                isDark={isDark}
                toggleTheme={toggleTheme}
                currentUser={currentUser}
            />

            <main className={`group-main-container ${isFilesCollapsed ? 'files-collapsed' : ''}`}>
                <FilesColumn
                    isCollapsed={isFilesCollapsed}
                    toggleCollapse={() => setIsFilesCollapsed(!isFilesCollapsed)}
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    refreshTrigger={refreshTrigger}
                    currentUser={currentUser}
                />
                <FileViewerColumn selectedFile={selectedFile} onDelete={handleFileDelete} />
                <AIAssistanceColumn currentUser={currentUser} />
            </main>
        </div>
    );
};

export default Group;
