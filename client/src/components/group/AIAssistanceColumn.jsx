import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

const AIAssistanceColumn = () => {
    const { id: groupId } = useParams();
    const [message, setMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isAddingModel, setIsAddingModel] = useState(false);
    const [newModelData, setNewModelData] = useState({ name: '', key: '' });
    const [selectedModel, setSelectedModel] = useState('Gemini 3 Flash');
    const [models, setModels] = useState(['Gemini 3 Flash', 'GPT-4o', 'Claude 3.5 Sonnet']);
    const [attachedImage, setAttachedImage] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [groupFiles, setGroupFiles] = useState([]);

    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    React.useEffect(() => {
        fetchModels();
        fetchGroupFiles();
    }, [groupId]);

    const fetchModels = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('user_ai_models')
            .select('name, key')
            .eq('user_id', user.id);

        if (data && data.length > 0) {
            const customModels = data.map(m => m.name);
            setModels(['Gemini 3 Flash', 'GPT-4o', 'Claude 3.5 Sonnet', ...customModels]);
        }
    };

    const fetchGroupFiles = async () => {
        const { data } = await supabase
            .from('group_files')
            .select('file_name')
            .eq('group_id', groupId);
        
        if (data) setGroupFiles(data);
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (message.trim() || attachedImage || attachedFile) {
            console.log(`Sending to ${selectedModel}:`, { text: message, image: !!attachedImage, file: attachedFile?.name });
            setMessage('');
            setAttachedImage(null);
            setAttachedFile(null);
            setIsMenuOpen(false);
            setIsModelMenuOpen(false);
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => setAttachedImage(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB'
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSaveModel = async (e) => {
        e.preventDefault();
        if (newModelData.name.trim()) {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('user_ai_models')
                .insert([{
                    user_id: user.id,
                    name: newModelData.name,
                    key: newModelData.key
                }]);

            if (error) {
                console.error('Error saving model:', error);
                return;
            }

            setModels(prev => [...prev, newModelData.name]);
            setSelectedModel(newModelData.name);
            setIsAddingModel(false);
            setNewModelData({ name: '', key: '' });
            setIsModelMenuOpen(false);
        }
    };

    return (
        <div className="group-column ai-column">
            <div className="column-header flex-center">
                AI ASSISTANCE
            </div>
            <div className="column-content">
                <div className="ai-chat-container">
                    <div className="ai-welcome-msg">
                        Hello! I'm your AI assistant. I can help you understand the code, debug issues, or suggest improvements.
                    </div>

                    <form className="ai-input-form" onSubmit={handleSendMessage}>
                        <div className="ai-input-wrapper">
                            {/* Text Area Input */}
                            {attachedImage && (
                                <div className="ai-preview-container">
                                    <div className="ai-image-preview">
                                        <img src={attachedImage} alt="Preview" />
                                        <button className="remove-ai-attach" onClick={() => setAttachedImage(null)}><X size={12} /></button>
                                    </div>
                                </div>
                            )}

                            {attachedFile && (
                                <div className="ai-preview-container">
                                    <div className="ai-file-preview">
                                        <FileText size={14} />
                                        <span>{attachedFile.name}</span>
                                        <button className="remove-ai-attach" onClick={() => setAttachedFile(null)}><X size={12} /></button>
                                    </div>
                                </div>
                            )}

                            <textarea
                                className="ai-chat-textarea"
                                placeholder="Ask anything, @ to mention, / for workflows"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                            />

                            {/* Toolbar row */}
                            <div className="ai-input-toolbar">
                                <div className="toolbar-left">
                                    {/* Toolbar icons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <Plus
                                                size={20}
                                                className="toolbar-plus"
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            />

                                            {isMenuOpen && (
                                                <div className="ai-context-menu">
                                    <div className="menu-section">
                                                        <div className="menu-section-title">Reference Group Files</div>
                                                        <div className="menu-list">
                                                            {groupFiles.length > 0 ? groupFiles.map((file, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    className="menu-option"
                                                                    onClick={() => {
                                                                        setMessage(prev => prev + ` @${file.file_name} `);
                                                                        setIsMenuOpen(false);
                                                                    }}
                                                                >
                                                                    <FileText size={14} />
                                                                    {file.file_name}
                                                                </button>
                                                            )) : (
                                                                <div className="menu-empty-hint">No files in group</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <ImageIcon
                                            size={20}
                                            className="toolbar-plus"
                                            onClick={() => imageInputRef.current.click()}
                                        />
                                        <Paperclip
                                            size={20}
                                            className="toolbar-plus"
                                            onClick={() => fileInputRef.current.click()}
                                        />
                                    </div>

                                    <input type="file" ref={imageInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

                                    {/* Model Selector */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            type="button"
                                            className="toolbar-btn"
                                            onClick={() => {
                                                setIsModelMenuOpen(!isModelMenuOpen);
                                                setIsAddingModel(false);
                                            }}
                                        >
                                            <ChevronUp size={14} />
                                            <span>{selectedModel}</span>
                                        </button>

                                        {isModelMenuOpen && (
                                            <div className="ai-context-menu" style={{ left: '0', width: '240px' }}>
                                                {!isAddingModel ? (
                                                    <>
                                                        <div className="menu-section">
                                                            <div className="menu-section-title">Select Model</div>
                                                            <div className="menu-list">
                                                                {models.map(model => (
                                                                    <button
                                                                        key={model}
                                                                        type="button"
                                                                        className={`menu-option ${selectedModel === model ? 'active' : ''}`}
                                                                        onClick={() => {
                                                                            setSelectedModel(model);
                                                                            setIsModelMenuOpen(false);
                                                                        }}
                                                                    >
                                                                        <Cpu size={14} />
                                                                        {model}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="menu-section-divider"></div>
                                                        <button
                                                            type="button"
                                                            className="menu-action-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsAddingModel(true);
                                                            }}
                                                        >
                                                            <Plus size={14} />
                                                            Add your own model
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="add-model-form" onClick={e => e.stopPropagation()}>
                                                        <div className="menu-form-header">
                                                            <ArrowLeft
                                                                size={16}
                                                                className="menu-back-arrow"
                                                                onClick={() => setIsAddingModel(false)}
                                                            />
                                                            <div className="menu-section-title">Add custom model</div>
                                                        </div>
                                                        <div className="model-input-group">
                                                            <label>Model Name</label>
                                                            <input
                                                                type="text"
                                                                className="model-field-input"
                                                                placeholder="e.g. My Custom Gemini"
                                                                value={newModelData.name}
                                                                onChange={e => setNewModelData({ ...newModelData, name: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="model-input-group">
                                                            <label>API Key</label>
                                                            <input
                                                                type="password"
                                                                className="model-field-input"
                                                                placeholder="Enter your key..."
                                                                value={newModelData.key}
                                                                onChange={e => setNewModelData({ ...newModelData, key: e.target.value })}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="model-save-btn"
                                                            onClick={handleSaveModel}
                                                        >
                                                            Save Model
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="toolbar-right">
                                    <button type="submit" className="ai-send-circle" disabled={!message.trim() && !attachedImage && !attachedFile}>
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAssistanceColumn;
