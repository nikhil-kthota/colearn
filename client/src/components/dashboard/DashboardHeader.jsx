import React from 'react';
import { Sun, Moon } from 'lucide-react';

const DashboardHeader = ({ isDark, toggleTheme }) => {
    return (
        <header className="user-header">
            <div className="header-left">
                <h1>Dashboard</h1>
            </div>
            <div className="header-right">
                <button className="theme-toggle-header" onClick={toggleTheme} title="Toggle Mode">
                    {isDark ? <Sun size={22} /> : <Moon size={22} />}
                    <span className="toggle-text">{isDark ? 'Light' : 'Dark'}</span>
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
