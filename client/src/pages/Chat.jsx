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
import EmojiPicker, { Theme } from 'emoji-picker-react';
import GroupNavbar from '../components/group/GroupNavbar';
import { supabase } from '../supabase';
import '../styles/Chat.css';

const Chat = ({ isDark, toggleTheme }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [attachedImage, setAttachedImage] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showFileSuggestions, setShowFileSuggestions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDMModal, setShowDMModal] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const chatEndRef = useRef(null);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [realMembers, setRealMembers] = useState([]);
    const [groupFiles, setGroupFiles] = useState([]);

    // Chat Tabs/Channels
    const [conversations, setConversations] = useState([
        { id: 'general', name: 'General Chat', type: 'group', icon: <Hash size={18} /> }
    ]);

    const [activeChatId, setActiveChatId] = useState('general');
    const activeChat = conversations.find(c => c.id === activeChatId);

    // messages per channel
    const [chatMessages, setChatMessages] = useState({});

    const [loading, setLoading] = useState(true);
    const [currentGroupName, setCurrentGroupName] = useState('Loading...');

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUser(user);
        };
        fetchUser();
        fetchGroupDetails();
        fetchMembers();
        fetchChannels();
        fetchGroupFiles();
        fetchMessages();
        const subscription = subscribeToMessages();
        return () => {
            subscription.unsubscribe();
        };
    }, [id, activeChatId]);

    const fetchMembers = async () => {
        const { data, error } = await supabase
            .from('group_members')
            .select('user_id, role, display_name')
            .eq('group_id', id);
        
        if (data) {
            // To get more info for fallbacks, we might need a join or additional fetch
            // But for now let's use what we have and maybe fetch metadata if display_name is missing
            const membersWithBetterNames = await Promise.all(data.map(async (m) => {
                let name = m.display_name;
                
                // If DB display_name is null, it's an old record or joined before we started saving names
                if (!name) {
                    name = 'Member';
                }

                // Generate a consistent color based on user_id
                let hash = 0;
                for (let i = 0; i < m.user_id.length; i++) {
                    hash = m.user_id.charCodeAt(i) + ((hash << 5) - hash);
                }
                const color = `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;

                return {
                    id: m.user_id,
                    name: name,
                    avatar: name.charAt(0).toUpperCase(),
                    color: color,
                    role: m.role
                };
            }));
            setRealMembers(membersWithBetterNames);
        }
    };

    const fetchChannels = async () => {
        const { data, error } = await supabase
            .from('group_channels')
            .select('*')
            .eq('group_id', id);
        
        const baseConvs = [{ id: 'general', name: 'General Chat', type: 'group', icon: <Hash size={18} /> }];
        if (data && data.length > 0) {
            const dbConvs = data.map(c => ({
                id: c.id,
                name: c.name,
                type: 'group',
                icon: <Users size={18} />
            }));
            setConversations([...baseConvs, ...dbConvs]);
        } else {
            setConversations(baseConvs);
        }
    };

    const fetchGroupFiles = async () => {
        try {
            const { data, error } = await supabase
                .from('group_files')
                .select('*')
                .eq('group_id', id);
            
            if (error) throw error;
            setGroupFiles(data || []);
        } catch (err) {
            console.error('Error fetching group files:', err);
            setGroupFiles([]); // Fallback to empty on error
        }
    };

    const fetchGroupDetails = async () => {
        const { data, error } = await supabase
            .from('collab_groups')
            .select('group_name')
            .eq('group_id', id)
            .single();
        if (data) setCurrentGroupName(data.group_name);
    };

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('group_messages')
            .select('*')
            .eq('group_id', id)
            .eq('channel_id', activeChatId)
            .order('created_at', { ascending: true });

        if (data) {
            setChatMessages(prev => ({
                ...prev,
                [activeChatId]: data
            }));
        }
        setLoading(false);
    };

    const subscribeToMessages = () => {
        return supabase
            .channel('public:group_messages')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'group_messages',
                filter: `group_id=eq.${id}`
            }, payload => {
                const { channel_id } = payload.new;
                setChatMessages(prev => ({
                    ...prev,
                    [channel_id]: [...(prev[channel_id] || []), payload.new]
                }));
            })
            .subscribe();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() || attachedImage || attachedFile) {
            const { data: { user } } = await supabase.auth.getUser();
            
            const newMessage = {
                group_id: id,
                channel_id: activeChatId,
                user_id: user.id,
                user_name: user.user_metadata?.full_name || user.email,
                text: message,
            };

            const { error } = await supabase
                .from('group_messages')
                .insert([newMessage]);

            if (error) console.error('Error sending message:', error);

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

    const handleCreateChannel = async (e) => {
        e.preventDefault();
        if (newChannelName.trim()) {
            try {
                const { data, error } = await supabase
                    .from('group_channels')
                    .insert([{
                        group_id: id,
                        name: newChannelName,
                        type: 'group'
                    }])
                    .select()
                    .single();

                if (error) throw error;

                const newConv = {
                    id: data.id,
                    name: data.name,
                    type: 'group',
                    icon: <Users size={18} />
                };
                setConversations([...conversations, newConv]);
                setChatMessages({ ...chatMessages, [data.id]: [] });
                setActiveChatId(data.id);
                setNewChannelName('');
                setSelectedMembers([]);
                setShowCreateModal(false);
            } catch (err) {
                console.error('Error creating channel:', err);
            }
        }
    };

    const handleStartDM = (member) => {
        const existingDM = conversations.find(c => c.type === 'dm' && c.memberId === member.id);
        if (existingDM) {
            setActiveChatId(existingDM.id);
        } else {
            const newId = `dm-${member.id}`;
            const newConv = {
                id: newId,
                name: member.name,
                type: 'dm',
                memberId: member.id,
                icon: <User size={18} />
            };
            setConversations([...conversations, newConv]);
            setActiveChatId(newId);
        }
        setShowDMModal(false);
        setIsSidebarOpen(false);
    };

    const toggleMemberSelection = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handlePaste = (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => setAttachedImage(event.target.result);
                reader.readAsDataURL(blob);
            }
        }
    };

    const addEmoji = (emojiData) => {
        setMessage(prev => prev + emojiData.emoji);
    };


    const parseMentions = (text) => {
        return text.split(' ').map((word, i) => {
            if (word.startsWith('@')) return <span key={i} className="mention-user">{word} </span>;
            if (word.startsWith('#')) return <span key={i} className="mention-file">{word} </span>;
            return word + ' ';
        });
    };

    // Removed static groupNames mapping

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="chat-layout">
            <GroupNavbar groupName={currentGroupName} isDark={isDark} toggleTheme={toggleTheme} />

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
                            <Plus size={14} className="add-icon" onClick={() => setShowCreateModal(true)} />
                        </div>
                        <div className="nav-list">
                            {conversations.filter(c => c.type === 'group').length > 0 ? (
                                conversations.filter(c => c.type === 'group').map(conv => (
                                    <button
                                        key={conv.id}
                                        className={`nav-item ${activeChatId === conv.id ? 'active' : ''}`}
                                        onClick={() => setActiveChatId(conv.id)}
                                    >
                                        {conv.icon}
                                        <span>{conv.name}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="empty-sidebar-hint">No channels created yet.</div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-header">
                            <span>DIRECT MESSAGES</span>
                            <Plus size={14} className="add-icon" onClick={() => setShowDMModal(true)} />
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
                            <span>GROUP FILES</span>
                        </div>
                        <div className="mini-file-list">
                            {groupFiles.length > 0 ? (
                                groupFiles.map(file => (
                                    <div key={file.id} className="file-pill" title={file.name || 'Unnamed File'}>
                                        <FileText size={16} />
                                        <span>{file.name || 'Unnamed File'}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-sidebar-hint">No files shared yet.</div>
                            )}
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
                            <button className="back-link" onClick={() => navigate(`/group/${id}`)}>
                                <ArrowLeft size={18} />
                                <span>Exit to Group</span>
                            </button>
                            <div className="v-divider"></div>
                            <div className="active-chat-info">
                                <span className="chat-title">{activeChat?.name}</span>
                                <span className="member-count">
                                    {activeChat?.type === 'group'
                                        ? `${realMembers.length} members`
                                        : 'Direct Message'
                                    }
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="chat-scroller">
                        <div className="chat-messages-list">
                            {(chatMessages[activeChatId] || []).map((msg) => {
                                const msgMember = realMembers.find(m => m.id === msg.user_id);
                                return (
                                    <div key={msg.id} className={`chat-message ${msg.user_id === currentUser?.id ? 'mine' : ''}`}>
                                        <div className="message-avatar" style={{ backgroundColor: msgMember?.color || '#2dd4bf' }}>
                                            {(msg.user_name || 'U').substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className="message-body">
                                            <div className="message-header">
                                                <span className="author">{msg.user_name}</span>
                                                <span className="timestamp">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="message-bubble">
                                            {msg.image_url && (
                                                <div className="message-image">
                                                    <img src={msg.image_url} alt="Uploaded" />
                                                </div>
                                            )}
                                            {msg.file_url && (
                                                <div className="message-file">
                                                    <FileText size={18} />
                                                    <div className="msg-file-info">
                                                        <span className="msg-file-name">File Attachment</span>
                                                    </div>
                                                </div>
                                            )}
                                            <p>{parseMentions(msg.text)}</p>
                                        </div>
                                    </div>
                                </div>
                            )})}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    <footer className="chat-composer">
                        {showFileSuggestions && (
                            <div className="file-suggestions-popup fade-in">
                                <div className="suggestions-header">
                                    <AtSign size={14} />
                                    <span>Mention a Group File</span>
                                </div>
                                <div className="suggestions-list">
                                    {groupFiles.map(file => (
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
                                <button
                                    type="button"
                                    className={`action-btn ${showEmojiPicker ? 'active' : ''}`}
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    <Smile size={20} />
                                </button>
                                {showEmojiPicker && (
                                    <div className="emoji-picker-container fade-in">
                                        <EmojiPicker
                                            onEmojiClick={addEmoji}
                                            theme={isDark ? Theme.DARK : Theme.LIGHT}
                                            width={350}
                                            height={450}
                                            lazyLoadEmojis={true}
                                            skinTonesDisabled={true}
                                            searchPlaceHolder="Search emojis..."
                                            previewConfig={{ showPreview: false }}
                                        />
                                    </div>
                                )}
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
                                onPaste={handlePaste}
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
                                <button type="submit" className="send-trigger" disabled={!message.trim() && !attachedImage && !attachedFile}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </footer>
                </section>
            </main>

            {/* Create Channel Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-morphism fade-in">
                        <div className="modal-header">
                            <h3>Create New Channel</h3>
                            <button className="close-modal" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateChannel}>
                            <div className="form-group">
                                <label>Channel Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Frontend Squad"
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Add Members</label>
                                <div className="members-selection-list">
                                    {realMembers.filter(m => m.id !== currentUser?.id).map(member => (
                                        <div
                                            key={member.id}
                                            className={`member-select-item ${selectedMembers.includes(member.id) ? 'selected' : ''}`}
                                            onClick={() => toggleMemberSelection(member.id)}
                                        >
                                            <div className="member-avatar-mini" style={{ backgroundColor: member.color }}>{member.avatar}</div>
                                            <span>{member.name}</span>
                                            <div className="checkbox-custom">
                                                {selectedMembers.includes(member.id) && <div className="checked-indicator"></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!newChannelName.trim()}>Create Channel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Start DM Modal */}
            {showDMModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-morphism fade-in member-select-modal">
                        <div className="modal-header">
                            <h3>Direct Message</h3>
                            <button className="close-modal" onClick={() => setShowDMModal(false)}><X size={20} /></button>
                        </div>
                        <div className="search-members-box">
                            <Search size={16} />
                            <input type="text" placeholder="Search members..." />
                        </div>
                        <div className="modal-scroll-list">
                            {realMembers.filter(m => m.id !== currentUser?.id).length > 0 ? (
                                realMembers.filter(m => m.id !== currentUser?.id).map(member => (
                                    <div key={member.id} className="dm-select-item" onClick={() => handleStartDM(member)}>
                                        <div className="member-avatar" style={{ backgroundColor: member.color }}>{member.avatar}</div>
                                        <div className="dm-item-info">
                                            <span className="dm-name">{member.name}</span>
                                        </div>
                                        <MessageSquare size={16} className="dm-icon-hint" />
                                    </div>
                                ))
                            ) : (
                                <div className="modal-empty-state">
                                    <Users size={40} opacity={0.2} />
                                    <p>No other members in this group yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
