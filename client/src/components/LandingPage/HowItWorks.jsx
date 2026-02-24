import React, { useEffect, useState, useRef } from 'react';
import '../styles/HowItWorks.css';

const items = [
    {
        id: 'signup',
        title: "Sign Up and Create a Group",
        desc: "Create your CoLearn account and set up a new group in seconds. Each group becomes a shared space where members collaborate, learn, and build together."
    },
    {
        id: 'invite',
        title: "Invite Members to Your Group",
        desc: "Invite others by sharing an invite link or by providing the group ID and password. Control who joins your group and manage member access easily."
    },
    {
        id: 'share',
        title: "Share Files and Resources",
        desc: "Upload documents, notes, and code files directly to the group. All shared resources are instantly accessible to group members."
    },
    {
        id: 'realtime',
        title: "Collaborate in Real Time",
        desc: "Edit files and code together with live updates. See changes instantly and work collaboratively as a team."
    },
    {
        id: 'chat',
        title: "Communicate Through Built-In Chat",
        desc: "Use built-in chat to discuss ideas, clarify doubts, and collaborate without leaving the platform."
    },
    {
        id: 'ai',
        title: "Learn with AI Assistance",
        desc: "Select shared files as context and ask the AI assistant questions. Get explanations, summaries, and code help tailored to your group’s content."
    },
    {
        id: 'security',
        title: "Manage Group Access and Security",
        desc: "Assign roles, manage permissions, and keep your group’s data secure using reliable authentication and storage."
    },
    {
        id: 'build',
        title: "Learn and Build Together",
        desc: "All collaboration including files, conversations, code, and AI support happens inside your group, making learning more focused and efficient."
    }
];

const HowItWorks = () => {
    const [activeId, setActiveId] = useState('signup');
    const observer = useRef(null);

    useEffect(() => {
        // Observer options - trigger when 50% of item is visible
        const options = {
            root: null,
            rootMargin: '-40% 0px -40% 0px', // Active in middle 20% of screen
            threshold: 0
        };

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.getAttribute('data-id'));
                }
            });
        }, options);

        const elements = document.querySelectorAll('.hiw-step-item');
        elements.forEach((el) => observer.current.observe(el));

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    return (
        <section className="how-it-works-section" id="how-we-work">
            <div className="hiw-container">
                {/* Left Side: Sticky Title */}
                <div className="hiw-left">
                    <h2 className="hiw-main-title">
                        Learn, collaborate,<br />and improve.
                    </h2>
                </div>

                {/* Right Side: Scrollable List */}
                <div className="hiw-right">
                    <div className="hiw-right-header">
                        This is how we work
                    </div>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`hiw-step-item ${activeId === item.id ? 'active' : ''}`}
                            data-id={item.id}
                            onClick={() => {
                                setActiveId(item.id);
                                document.querySelector(`[data-id='${item.id}']`).scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                        >
                            <h3 className="hiw-step-header">{item.title}</h3>
                            <div className="hiw-step-desc">
                                <div className="hiw-step-desc-inner">
                                    {item.desc}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
