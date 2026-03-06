import React, { useState } from 'react';
import { Send, Plus, ChevronUp, FileText, Cpu, Settings } from 'lucide-react';

const AIAssistanceColumn = () => {
    const [message, setMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isAddingModel, setIsAddingModel] = useState(false);
    const [newModelData, setNewModelData] = useState({ name: '', key: '' });
    const [selectedModel, setSelectedModel] = useState('Gemini 3 Flash');
    const [models, setModels] = useState(['Gemini 3 Flash', 'GPT-4o', 'Claude 3.5 Sonnet']);

    const mockFiles = [
        { id: 1, name: 'main.jsx' },
        { id: 2, name: 'Room.css' },
        { id: 3, name: 'index.html' }
    ];

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (message.trim()) {
            console.log(`Sending to ${selectedModel}:`, message);
            setMessage('');
            setIsMenuOpen(false);
            setIsModelMenuOpen(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSaveModel = (e) => {
        e.preventDefault();
        if (newModelData.name.trim()) {
            setModels(prev => [...prev, newModelData.name]);
            setSelectedModel(newModelData.name);
            setIsAddingModel(false);
            setNewModelData({ name: '', key: '' });
            setIsModelMenuOpen(false);
        }
    };

    return (
        <div className="room-column ai-column">
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
                            <textarea
                                className="ai-chat-textarea"
                                placeholder="Ask anything, @ to mention, / for workflows"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            {/* Toolbar row */}
                            <div className="ai-input-toolbar">
                                <div className="toolbar-left">
                                    {/* + Button and Menu */}
                                    <div style={{ position: 'relative' }}>
                                        <Plus
                                            size={20}
                                            className="toolbar-plus"
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        />

                                        {isMenuOpen && (
                                            <div className="ai-context-menu">
                                                <div className="menu-section">
                                                    <div className="menu-section-title">Reference Files</div>
                                                    <div className="menu-list">
                                                        {mockFiles.map(file => (
                                                            <button
                                                                key={file.id}
                                                                type="button"
                                                                className="menu-option"
                                                                onClick={() => {
                                                                    setMessage(prev => prev + ` @${file.name} `);
                                                                    setIsMenuOpen(false);
                                                                }}
                                                            >
                                                                <FileText size={14} />
                                                                {file.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

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
                                                        <div className="menu-section-title">Add custom model</div>
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
                                    <button type="submit" className="ai-send-circle" disabled={!message.trim()}>
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
