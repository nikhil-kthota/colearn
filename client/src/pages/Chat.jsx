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
import LoadingScreen from '../components/common/LoadingScreen';
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
    const [showDMModal, setShowDMModal] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const chatEndRef = useRef(null);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const [members, setMembers] = useState([]);
    const [groupFiles, setGroupFiles] = useState([]);
    const [conversations, setConversations] = useState([
        { id: 'general', name: 'General Chat', type: 'group', icon: <Hash size={18} /> }
    ]);
    const [activeChatId, setActiveChatId] = useState('general');
    const [chatMessages, setChatMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentGroupName, setCurrentGroupName] = useState('Loading...');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setCurrentUser(user);

                // 1. Fetch all base data
                const [groupDetails, groupMembers, groupFiles, threads, allMsgs] = await Promise.all([
                    fetchGroupDetails(),
                    fetchMembers(),
                    fetchGroupFiles(),
                    fetchThreads(user.id),
                    fetchMessagesOnly()
                ]);

                // 2. Build Sidebar (General first)
                const baseConversations = [
                    { id: 'general', name: 'General Chat', type: 'group', icon: <Hash size={18} /> }
                ];

                // 3. Build Sidebar (DMs from Threads table)
                const dmConvs = threads.map(thread => {
                    const otherId = thread.participant_one === user.id ? thread.participant_two : thread.participant_one;
                    const member = groupMembers.find(m => m.id === otherId);
                    return {
                        id: thread.id,
                        name: member ? member.name : 'User',
                        type: 'dm',
                        memberId: otherId,
                        icon: <User size={18} />
                    };
                }).filter(Boolean);

                setConversations([...baseConversations, ...dmConvs]);

                // 4. Group existing messages
                const groupedMessages = {};
                allMsgs.forEach(msg => {
                    const cid = msg.channel_id || 'general';
                    if (!groupedMessages[cid]) groupedMessages[cid] = [];
                    groupedMessages[cid].push(msg);
                });

                setChatMessages(groupedMessages);
                setLoading(false);
            } catch (err) {
                console.error("Chat Init Error:", err);
                setLoading(false);
            }
        };
        init();

        const channel = supabase
            .channel(`group_chat:${id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'group_messages',
                filter: `group_id=eq.${id}`
            }, payload => {
                const msg = payload.new;
                const cid = msg.channel_id || 'general';
                
                // Ensure DM conversation exists in sidebar for receiver
                if (cid.startsWith('dm_')) {
                    setConversations(prev => {
                        if (prev.find(c => c.id === cid)) return prev;
                        const otherId = cid.split('_').find(uuid => uuid !== (currentUser?.id || ''));
                        const member = members.find(m => m.id === otherId);
                        if (member) {
                            return [...prev, {
                                id: cid,
                                name: member.name,
                                type: 'dm',
                                memberId: otherId,
                                icon: <User size={18} />
                            }];
                        }
                        return prev;
                    });
                }

                setChatMessages(prev => ({
                    ...prev,
                    [cid]: [...(prev[cid] || []), msg]
                }));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeChatId]);

    const fetchGroupDetails = async () => {
        const { data } = await supabase
            .from('collab_groups')
            .select('group_name')
            .eq('group_id', id)
            .single();
        if (data) setCurrentGroupName(data.group_name);
    };

    const fetchMembers = async () => {
        const { data } = await supabase
            .from('group_members')
            .select('*')
            .eq('group_id', id);
        if (data) {
            const m = data.map(m => ({
                id: m.user_id,
                name: m.user_name,
                avatar: m.user_name?.substring(0, 2).toUpperCase(),
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                status: 'online'
            }));
            setMembers(m);
            return m;
        }
        return [];
    };

    const fetchGroupFiles = async () => {
        const { data } = await supabase
            .from('group_files')
            .select('*')
            .eq('group_id', id);
        if (data) {
            setGroupFiles(data.map(f => ({
                id: f.id,
                name: f.file_name,
                size: (f.file_size / 1024).toFixed(1) + ' KB'
            })));
        }
    };

    const fetchThreads = async (userId) => {
        const { data } = await supabase
            .from('group_chat_threads')
            .select('*')
            .eq('group_id', id)
            .or(`participant_one.eq.${userId},participant_two.eq.${userId}`);
        return data || [];
    };

    const fetchMessagesOnly = async () => {
        const { data } = await supabase
            .from('group_messages')
            .select('*')
            .eq('group_id', id)
            .order('created_at', { ascending: true });
        return data || [];
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!message.trim() && !attachedImage && !attachedFile) return;

        try {
            let imageUrl = null;
            let fileUrl = null;
            let fileName = null;

            if (attachedImage && attachedImage.startsWith('data:')) {
                // Upload image
                const blob = await (await fetch(attachedImage)).blob();
                const path = `chat/${id}/${Date.now()}_img.png`;
                const { data, error } = await supabase.storage.from('group-assets').upload(path, blob);
                if (!error) {
                    const { data: urlData } = supabase.storage.from('group-assets').getPublicUrl(path);
                    imageUrl = urlData.publicUrl;
                }
            }

            const { data: { user } } = await supabase.auth.getUser();
            
            let recipientId = null;
            if (activeChatId.startsWith('dm_')) {
                // Correctly extract other user ID (skip the 'dm' prefix)
                recipientId = activeChatId.split('_').filter(part => part !== 'dm' && part !== user.id)[0];
            }

            // Get user's current avatar URL from the members list or metadata
            const myMemberData = members.find(m => m.id === user.id);
            const userAvatar = myMemberData?.user_avatar || user.user_metadata?.avatar_url || null;

            const newMessage = {
                group_id: id,
                user_id: user.id,
                user_name: localStorage.getItem('userName') || user.user_metadata?.full_name || user.email,
                user_avatar: userAvatar, 
                text: message,
                channel_id: activeChatId,
                recipient_id: recipientId,
                image_url: imageUrl,
                file_url: fileUrl,
                file_name: fileName,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('group_messages')
                .insert([newMessage]);

            if (error) {
                console.error("Supabase Message Error Details:", error);
                throw error;
            }

            setMessage('');
            setAttachedImage(null);
            setAttachedFile(null);
            setShowFileSuggestions(false);
            setShowEmojiPicker(false);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setMessage(val);
        if (val.endsWith('@')) {
            setShowFileSuggestions(true);
        } else if (!val.includes('@') || val.endsWith(' ')) {
            setShowFileSuggestions(false);
        }
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

    const insertFileMention = (fileName) => {
        const parts = message.split('@');
        parts.pop();
        setMessage(parts.join('@') + '#' + fileName + ' ');
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

    const handleStartDM = async (member) => {
        const myId = currentUser.id;
        const otherId = member.id;
        const dmId = `dm_${[myId, otherId].sort().join('_')}`;

        // Register the thread in the DB if it doesn't exist
        const { error } = await supabase
            .from('group_chat_threads')
            .upsert([{ 
                id: dmId, 
                group_id: id, 
                participant_one: [myId, otherId].sort()[0],
                participant_two: [myId, otherId].sort()[1] 
            }], { onConflict: 'id' });

        if (error) console.error("Error creating DM thread:", error);

        const existingDM = conversations.find(c => c.id === dmId);
        if (!existingDM) {
            const newConv = {
                id: dmId,
                name: member.name,
                type: 'dm',
                memberId: otherId,
                icon: <User size={18} />
            };
            setConversations([...conversations, newConv]);
        }
        setActiveChatId(dmId);
        setShowDMModal(false);
        setIsSidebarOpen(false);
    };

    const addEmoji = (emojiData) => {
        setMessage(prev => prev + emojiData.emoji);
    };

    const parseMentions = (text) => {
        if (!text) return '';
        return text.split(' ').map((word, i) => {
            if (word.startsWith('@')) return <span key={i} className="mention-user">{word} </span>;
            if (word.startsWith('#')) return <span key={i} className="mention-file">{word} </span>;
            return word + ' ';
        });
    };

    const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (loading) return <LoadingScreen message={`Connecting to ${currentGroupName === 'Loading...' ? 'Chat' : currentGroupName}...`} />;

    return (
        <div className="chat-layout">
            <GroupNavbar groupName={currentGroupName} isDark={isDark} toggleTheme={toggleTheme} currentUser={currentUser} />

            <main className="chat-main">
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

                <aside className={`chat-nav-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-mobile-header">
                        <span>Navigation</span>
                        <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-header">
                            <span>CHATS</span>
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
                            {groupFiles.map(file => (
                                <div key={file.id} className="file-pill">
                                    <FileText size={12} />
                                    <span>{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

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
                                        ? `${members.length} members`
                                        : 'Active now'
                                    }
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="chat-scroller">
                        <div className="chat-messages-list">
                            {(chatMessages[activeChatId] || []).map((msg) => (
                                <div key={msg.id} className={`chat-message ${msg.user_id === currentUser?.id ? 'mine' : ''}`}>
                                    <div className="message-avatar" style={{ backgroundColor: '#2dd4bf', overflow: 'hidden' }}>
                                        {msg.user_avatar ? (
                                            <img src={msg.user_avatar} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                        ) : (
                                            msg.user_name?.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="message-body">
                                        <div className="message-header">
                                            <span className="author">{msg.user_name}</span>
                                            <span className="timestamp">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="message-bubble">
                                            {msg.image_url && (
                                                <div className="message-image">
                                                    <img src={msg.image_url} alt="Uploaded" loading="lazy" />
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

                            <div className="composer-actions right">
                                <button type="submit" className="send-trigger" disabled={!message.trim() && !attachedImage}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </footer>
                </section>
            </main>

            {showDMModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-morphism fade-in member-select-modal">
                        <div className="modal-header">
                            <h3>Direct Message</h3>
                            <button className="close-modal" onClick={() => setShowDMModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-scroll-list">
                            {members.filter(m => m.id !== currentUser?.id).map(member => (
                                <div key={member.id} className="dm-select-item" onClick={() => handleStartDM(member)}>
                                    <div className="member-avatar" style={{ backgroundColor: member.color }}>{member.avatar}</div>
                                    <div className="dm-item-info">
                                        <span className="dm-name">{member.name}</span>
                                    </div>
                                    <MessageSquare size={16} className="dm-icon-hint" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
