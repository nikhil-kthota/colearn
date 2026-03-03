import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';

const AIAssistanceColumn = () => {
    const [message, setMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            console.log("Sending to AI:", message);
            setMessage('');
        }
    };

    return (
        <div className="room-column ai-column">
            <div className="column-header flex-center">
                <Bot size={16} className="mr-2" />
                AI ASSISTANCE
            </div>
            <div className="column-content">
                <div className="ai-chat-container">
                    <div className="ai-welcome-msg">
                        Hello! I'm your AI assistant. I can help you understand the code, debug issues, or suggest improvements.
                    </div>

                    <form className="ai-input-form" onSubmit={handleSendMessage}>
                        <div className="ai-input-wrapper">
                            <input
                                type="text"
                                className="ai-chat-input"
                                placeholder="Ask me anything..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit" className="ai-send-btn" disabled={!message.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAssistanceColumn;
