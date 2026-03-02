import React from 'react';

const AIAssistanceColumn = () => {
    return (
        <div className="room-column ai-column">
            <div className="column-header">AI ASSISTANCE</div>
            <div className="column-content">
                <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                }}>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        marginBottom: '1rem'
                    }}>
                        Hello! I'm your AI assistant. I can help you understand the code, debug issues, or suggest improvements.
                    </div>
                    {/* Chat input placeholder */}
                    <div style={{
                        padding: '0.8rem 1rem',
                        borderRadius: '25px',
                        backgroundColor: 'rgba(128, 128, 128, 0.05)',
                        border: '1px solid rgba(128, 128, 128, 0.1)',
                        fontSize: '0.85rem',
                        opacity: 0.6
                    }}>
                        Ask me anything...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistanceColumn;
