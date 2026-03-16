import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ActionTabs from '../components/dashboard/ActionTabs';
import ActionCard from '../components/dashboard/ActionCard';
import MyGroups from '../components/dashboard/MyGroups';
import { supabase } from '../supabase';
import '../styles/UserHome.css';

const UserHome = ({ isDark, toggleTheme }) => {
    const [activeTab, setActiveTab] = useState('coding'); // 'coding' or 'learning'
    const [actionType, setActionType] = useState('join'); // 'join' or 'create'
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [user, setUser] = useState({ name: 'User' });
    const [formData, setFormData] = useState({
        create: { groupName: '', groupId: '', groupKey: '' },
        join: { groupId: '', groupKey: '' }
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const name = authUser.user_metadata?.full_name || authUser.email.split('@')[0];
                setUser({ name });
                localStorage.setItem('userName', name);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e, type) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [name]: value
            }
        }));
    };

    const SLIDE_DURATION = 25000; // 25 seconds per tab

    useEffect(() => {
        if (isPaused) return;

        const intervalTime = 50;
        const step = (100 / SLIDE_DURATION) * intervalTime;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + step;
                return next >= 100 ? 100 : next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [activeTab, isPaused]);

    useEffect(() => {
        if (progress >= 100) {
            const timeout = setTimeout(() => {
                setActiveTab(current => current === 'coding' ? 'learning' : 'coding');
                setProgress(0);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [progress]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setProgress(0);
    };

    return (
        <div className="user-dashboard-wrapper" data-theme={isDark ? 'dark' : 'light'}>
            <DashboardNavbar
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            <main className="user-dashboard-content">
                <section className="dashboard-hero" id="dashboard-hero">
                    <div className="hero-text">
                        <h1>Welcome back, {user.name}!</h1>
                        <p>What would you like to build or learn today?</p>
                    </div>
                </section>

                <section className="dashboard-actions-section">
                    <ActionTabs
                        activeTab={activeTab}
                        handleTabClick={handleTabClick}
                        progress={progress}
                    />

                    <ActionCard
                        key={activeTab}
                        activeTab={activeTab}
                        actionType={actionType}
                        setActionType={setActionType}
                        setIsPaused={setIsPaused}
                        formData={formData}
                        onInputChange={handleInputChange}
                    />
                </section>

                <MyGroups />
            </main>
        </div>
    );
};

export default UserHome;
