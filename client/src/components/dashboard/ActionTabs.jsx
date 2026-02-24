import React from 'react';

const ActionTabs = ({ activeTab, handleTabClick, progress }) => {
    return (
        <div className="action-tabs">
            <button
                className={`action-tab coding ${activeTab === 'coding' ? 'active' : ''}`}
                onClick={() => handleTabClick('coding')}
            >
                {activeTab === 'coding' && (
                    <div className="tab-progress-fill" style={{ width: `${progress}%` }}></div>
                )}
                <div className="tab-indicator-container">
                    <div className="tab-indicator coding"></div>
                </div>
                <span>Collab Coding</span>
            </button>
            <button
                className={`action-tab learning ${activeTab === 'learning' ? 'active' : ''}`}
                onClick={() => handleTabClick('learning')}
            >
                {activeTab === 'learning' && (
                    <div className="tab-progress-fill" style={{ width: `${progress}%` }}></div>
                )}
                <div className="tab-indicator-container">
                    <div className="tab-indicator learning"></div>
                </div>
                <span>Collab Learning</span>
            </button>
        </div>
    );
};

export default ActionTabs;
