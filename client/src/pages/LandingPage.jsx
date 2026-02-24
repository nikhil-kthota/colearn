import React from 'react';
import Navbar from '../components/LandingPage/Navbar';
import Home from '../components/LandingPage/Home';
import HowItWorks from '../components/LandingPage/HowItWorks';
import Features from '../components/LandingPage/Features';
import Footer from '../components/LandingPage/Footer';

const LandingPage = ({ isDark, toggleTheme }) => {
    return (
        <div className="landing-wrapper">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <Home />
            <div className="relative-content" style={{ position: 'relative', zIndex: 10 }}>
                <HowItWorks />
                <Features />
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
