import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ActionTabs from '../components/dashboard/ActionTabs';
import ActionCard from '../components/dashboard/ActionCard';
import '../styles/UserHome.css';

const UserHome = ({ isDark, toggleTheme }) => {
    const [activeTab, setActiveTab] = useState('coding'); // 'coding' or 'learning'
    const [actionType, setActionType] = useState('join'); // 'join' or 'create'
    const [progress, setProgress] = useState(0);

    const SLIDE_DURATION = 10000; // 10 seconds per tab

    useEffect(() => {
        const intervalTime = 50;
        const step = (100 / SLIDE_DURATION) * intervalTime;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + step;
                return next >= 100 ? 100 : next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [activeTab]);

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
        <div className="user-dashboard-wrapper">
            <DashboardNavbar
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            <main className="user-dashboard-content">
                <section className="dashboard-hero">
                    <div className="hero-text">
                        <h1>Welcome back, John!</h1>
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
                    />
                </section>
            </main>
        </div>
    );
};

export default UserHome;
