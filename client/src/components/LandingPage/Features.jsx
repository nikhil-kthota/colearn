import React from 'react';
import '../styles/Features.css';

const Features = () => {
    return (
        <section className="features-section" id="features">
            <h2 className="section-title">
                Why choose CoLearn?
            </h2>

            <div className="feature-grid">
                <div className="feature-box">
                    <h3>Group-Based Workspaces</h3>
                    <p>
                        Create dedicated spaces for your teams with integrated video and voice chat. No more switching tabs for communication.
                    </p>
                </div>

                <div className="feature-box">
                    <h3>Real-Time File Editing</h3>
                    <p>
                        Edit documents and code simultaneously. See cursors and changes instantly as if you were on the same machine.
                    </p>
                </div>

                <div className="feature-box">
                    <h3>Collaborative Coding</h3>
                    <p>
                        Write, run, and debug code together. AI assistance helps you refactor and understand complex logic in real-time.
                    </p>
                </div>

                <div className="feature-box">
                    <h3>Interactive Chat</h3>
                    <p>
                        Seamlessly send messages within your workspace. Keep communication flowing without leaving the context.
                    </p>
                </div>

                <div className="feature-box">
                    <h3>AI Assistance</h3>
                    <p>
                        Get intelligent suggestions, code refactoring, and explanations. Your personal AI tutor is always ready to help.
                    </p>
                </div>

                <div className="feature-box">
                    <h3>Secure File Sharing</h3>
                    <p>
                        Upload and share resources with your team securely. Manage access permissions and keep your data safe.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Features;
