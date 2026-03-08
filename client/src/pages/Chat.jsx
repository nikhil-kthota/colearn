import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send,
    Paperclip,
    Smile,
    AtSign,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    ArrowLeft,
    Search,
    Hash,
    MessageSquare,
    Users,
    User,
    Plus,
    X,
    FileImage,
    Menu
} from 'lucide-react';
import RoomNavbar from '../components/room/RoomNavbar';
import '../styles/Chat.css';

const Chat = ({ isDark, toggleTheme }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [attachedImage, setAttachedImage] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showFileSuggestions, setShowFileSuggestions] = useState(false);
    const chatEndRef = useRef(null);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Mock data for members
    const members = [
        { id: 1, name: "John Doe", avatar: "JD", color: "#3b82f6", status: "online" },
        { id: 2, name: "Alice Smith", avatar: "AS", color: "#10b981", status: "online" },
        { id: 3, name: "Bob Wilson", avatar: "BW", color: "#f59e0b", status: "offline" },
        { id: 4, name: "Charlie Davis", avatar: "CD", color: "#8b5cf6", status: "online" }
    ];

    // Mock data for room files
    const roomFiles = [
        { id: 1, name: 'architecture_diagram.pdf', size: '2.4 MB' },
        { id: 2, name: 'app_logic.js', size: '15 KB' },
        { id: 3, name: 'brand_assets.zip', size: '12.8 MB' }
    ];

    // Chat Tabs/Channels
    const [conversations, setConversations] = useState([
        { id: 'general', name: 'General Chat', type: 'group', icon: <Hash size={18} /> },
        { id: 'alice', name: 'Alice Smith', type: 'dm', memberId: 2, icon: <User size={18} /> },
        { id: 'frontend-team', name: 'Frontend Squad', type: 'group', icon: <Users size={18} /> }
    ]);

    const [activeChatId, setActiveChatId] = useState('general');

    // Mock messages per conversation
    const [chatMessages, setChatMessages] = useState({
        'general': [
            { id: 1, user: members[1], text: 'Welcome to the team! Check #architecture_diagram.pdf', time: '12:45 PM' },
            { id: 2, user: members[0], text: 'Thanks @Alice! Looking into it.', time: '12:47 PM' }
        ],
        'alice': [
            { id: 1, user: members[1], text: 'Hey John, do you have a second to review the PR?', time: '10:30 AM' }
        ],
        'frontend-team': [
            { id: 1, user: members[3], text: 'Starting the sprint planning meeting in 5 mins.', time: '11:00 AM' }
        ]
    });

    const activeChat = conversations.find(c => c.id === activeChatId);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, activeChatId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() || attachedImage || attachedFile) {
            const newMessage = {
                id: (chatMessages[activeChatId]?.length || 0) + 1,
                user: members[0], // Current user
                text: message,
                image: attachedImage,
                file: attachedFile,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setChatMessages(prev => ({
                ...prev,
                [activeChatId]: [...(prev[activeChatId] || []), newMessage]
            }));

            setMessage('');
            setAttachedImage(null);
            setAttachedFile(null);
            setShowFileSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setMessage(val);

        // Show suggestions if the last character is @
        if (val.endsWith('@')) {
            setShowFileSuggestions(true);
        } else if (!val.includes('@') || val.endsWith(' ')) {
            setShowFileSuggestions(false);
        }
    };

    const insertFileMention = (fileName) => {
        const parts = message.split('@');
        parts.pop(); // Remove the trailing @
        const newMessage = parts.join('@') + '#' + fileName + ' ';
        setMessage(newMessage);
        setShowFileSuggestions(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setAttachedImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: file.type
            });
        }
    };

    const parseMentions = (text) => {
        return text.split(' ').map((word, i) => {
            if (word.startsWith('@')) return <span key={i} className="mention-user">{word} </span>;
            if (word.startsWith('#')) return <span key={i} className="mention-file">{word} </span>;
            return word + ' ';
        });
    };

    const roomNames = { '1': 'React Micro-Frontend', '2': 'System Design Patterns' };
    const currentRoomName = roomNames[id] || "Collaboration Room";

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="chat-layout">
            <RoomNavbar roomName={currentRoomName} isDark={isDark} toggleTheme={toggleTheme} />

            <main className="chat-main">
                {/* Mobile Sidebar Overlay Backdrop */}
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

                {/* Sidebar: Navigation + Channels */}
                <aside className={`chat-nav-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-mobile-header">
                        <span>Navigation</span>
                        <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-header">
                            <span>CHANNELS</span>
                            <Plus size={14} className="add-icon" />
                        </div>
                        <div className="nav-list">
                            {conversations.filter(c => c.type === 'group').map(conv => (
                                <button
                                    key={conv.id}
                                    className={`nav-item ${activeChatId === conv.id ? 'active' : ''}`}
                                    onClick={() => setActiveChatId(conv.id)}
                                >
                                    {conv.icon}
                                    <span>{conv.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-header">
                            <span>DIRECT MESSAGES</span>
                            <Plus size={14} className="add-icon" />
                        </div>
                        <div className="nav-list">
                            {conversations.filter(c => c.type === 'dm').map(conv => (
                                <button
                                    key={conv.id}
                                    className={`nav-item ${activeChatId === conv.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveChatId(conv.id);
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <div className="status-indicator online"></div>
                                    <span>{conv.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section files-section">
                        <div className="section-header">
                            <span>ROOM FILES</span>
                        </div>
                        <div className="mini-file-list">
                            {roomFiles.map(file => (
                                <div key={file.id} className="file-pill">
                                    <FileText size={12} />
                                    <span>{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="chat-window">
                    <header className="window-header">
                        <div className="header-left">
                            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                                <Menu size={24} />
                            </button>
                            <button className="back-link" onClick={() => navigate(`/room/${id}`)}>
                                <ArrowLeft size={18} />
                                <span>Exit to Room</span>
                            </button>
                            <div className="v-divider"></div>
                            <div className="active-chat-info">
                                <span className="chat-title">{activeChat?.name}</span>
                                <span className="member-count">
                                    {members.map(m => m.name).join(', ')}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="chat-scroller">
                        <div className="chat-messages-list">
                            {(chatMessages[activeChatId] || []).map((msg) => (
                                <div key={msg.id} className={`chat-message ${msg.user.id === members[0].id ? 'mine' : ''}`}>
                                    <div className="message-avatar" style={{ backgroundColor: msg.user.color }}>{msg.user.avatar}</div>
                                    <div className="message-body">
                                        <div className="message-header">
                                            <span className="author">{msg.user.name}</span>
                                            <span className="timestamp">{msg.time}</span>
                                        </div>
                                        <div className="message-bubble">
                                            {msg.image && (
                                                <div className="message-image">
                                                    <img src={msg.image} alt="Uploaded" />
                                                </div>
                                            )}
                                            {msg.file && (
                                                <div className="message-file">
                                                    <FileText size={18} />
                                                    <div className="msg-file-info">
                                                        <span className="msg-file-name">{msg.file.name}</span>
                                                        <span className="msg-file-size">{msg.file.size}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <p>{parseMentions(msg.text)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    <footer className="chat-composer">
                        {showFileSuggestions && (
                            <div className="file-suggestions-popup fade-in">
                                <div className="suggestions-header">
                                    <AtSign size={14} />
                                    <span>Mention a Room File</span>
                                </div>
                                <div className="suggestions-list">
                                    {roomFiles.map(file => (
                                        <button
                                            key={file.id}
                                            className="suggestion-item"
                                            onClick={() => insertFileMention(file.name)}
                                        >
                                            <span className="sug-name">{file.name}</span>
                                            <span className="sug-size">{file.size}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {attachedImage && (
                            <div className="image-preview">
                                <img src={attachedImage} alt="Preview" />
                                <button className="remove-img" onClick={() => setAttachedImage(null)}><X size={14} /></button>
                            </div>
                        )}
                        {attachedFile && (
                            <div className="file-preview-pill fade-in">
                                <FileText size={16} />
                                <span className="preview-file-name">{attachedFile.name}</span>
                                <button className="remove-file" onClick={() => setAttachedFile(null)}><X size={14} /></button>
                            </div>
                        )}
                        <form className="composer-container" onSubmit={handleSendMessage}>
                            <div className="composer-actions">
                                <button type="button" className="action-btn" onClick={() => imageInputRef.current?.click()}>
                                    <ImageIcon size={20} />
                                </button>
                                <button type="button" className="action-btn" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip size={20} />
                                </button>
                            </div>

                            <input
                                type="text"
                                className="composer-input"
                                placeholder={`Message ${activeChat?.name}... (type @ for files)`}
                                value={message}
                                onChange={handleInputChange}
                            />

                            <input
                                type="file"
                                ref={imageInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleImageUpload}
                            />

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />

                            <div className="composer-actions right">
                                <button type="button" className="action-btn"><Smile size={20} /></button>
                                <button type="submit" className="send-trigger" disabled={!message.trim() && !attachedImage && !attachedFile}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </footer>
                </section>
            </main>
        </div>
    );
};

export default Chat;
