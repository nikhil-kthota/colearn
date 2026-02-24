import React from 'react';
import { Github, ArrowUp } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="footer">
            <div className="footer-left">
                <span className="footer-copyright">&copy; {new Date().getFullYear()} CoLearn. All rights reserved.</span>
            </div>

            <div className="footer-center">
                <span className="footer-group">Project by Group 4</span>
            </div>

            <div className="footer-right">
                <a
                    href="https://github.com/nikhil-kthota/collaborative-learning"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                >
                    <Github size={20} />
                    <span>GitHub Repo</span>
                </a>

                <button
                    onClick={scrollToTop}
                    className="scroll-top-btn"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={20} />
                </button>
            </div>
        </footer>
    );
};

export default Footer;
