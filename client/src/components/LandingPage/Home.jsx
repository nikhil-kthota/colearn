import React from 'react';
import '../../styles/Home.css';

import { Box, Terminal } from 'lucide-react';

const Home = () => {
    return (
        <div className="home-hero" id="home">
            <div className="hero-top-info">
                <p className="hero-subtitle">
                    Learn, code, and collaborate <br /> together in real time
                </p>
            </div>

            <div className="hero-main-brand">
                <h1 className="hero-company">CoLearn.</h1>
            </div>

            <div className="hero-side-box">
                <div className="side-box-content">
                    <div className="side-box-icon">
                        <Box size={40} className="floating-icon" />
                    </div>
                    <h3 className="side-box-title">
                        Empowering <br /> Collective Minds.
                    </h3>
                    <p className="side-box-text">
                        Collaborate smarter with shared files, real-time editing, group discussions, and AI-powered learning support.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
