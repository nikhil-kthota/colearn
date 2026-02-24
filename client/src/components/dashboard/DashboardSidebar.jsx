import React from 'react';
import {
    LayoutDashboard,
    Code2,
    Terminal,
    Settings,
    LogOut,
    Sparkles,
    Menu,
    ChevronLeft
} from 'lucide-react';

const DashboardSidebar = ({ isCollapsed, setIsCollapsed }) => {
    return (
        <aside className="user-sidebar">
            <div className="sidebar-header">
                {!isCollapsed && (
                    <div className="sidebar-brand">
                        <Sparkles className="brand-icon" />
                        <span>CoLearn</span>
                    </div>
                )}
                <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    {!isCollapsed && <p className="nav-label">Menu</p>}
                    <button className="nav-item active" title="Dashboard">
                        <LayoutDashboard size={20} />
                        {!isCollapsed && <span>Dashboard</span>}
                    </button>
                    <button className="nav-item" title="My Rooms">
                        <Code2 size={20} />
                        {!isCollapsed && <span>My Rooms</span>}
                    </button>
                    <button className="nav-item" title="AI Assistant">
                        <Terminal size={20} />
                        {!isCollapsed && <span>AI Assistant</span>}
                    </button>
                </div>

                <div className="nav-group">
                    {!isCollapsed && <p className="nav-label">Account</p>}
                    <button className="nav-item" title="Settings">
                        <Settings size={20} />
                        {!isCollapsed && <span>Settings</span>}
                    </button>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="account-section">
                    <div className="user-profile-info">
                        <div className="avatar">JD</div>
                        {!isCollapsed && (
                            <div className="user-details">
                                <p className="user-name">John Doe</p>
                                <p className="user-email">john@example.com</p>
                            </div>
                        )}
                    </div>
                </div>

                <button className="nav-item logout" title="Logout">
                    <LogOut size={20} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
