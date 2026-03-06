import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import '../styles/Signup.css';

// Since the image is in an artifact folder, I will assume for now we might need to place it in the public folder.
// For this step I will reference it as a relative import assuming I'll move it, 
// OR simpler: I'll use a placeholder URL if I can't move it easily, BUT I have the file path.
// I will move the file in a subsequent step. For now I'll point to where I WILL put it.
// import bgImage from '../assets/signup-bg.png';

const Signup = () => {
    return (
        <div className="signup-container">
            {/* Left Side: Form */}
            <div className="signup-left">
                <Link to="/" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-display)' }}>
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <div className="signup-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <img
                            src={`${import.meta.env.BASE_URL}logo-dark.png`}
                            alt="CoLearn Logo"
                            style={{ height: '32px', width: 'auto' }}
                        />
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>CoLearn</span>
                    </div>
                    <h1 className="signup-title">Join the Community</h1>
                    <p className="signup-subtitle">Start your journey with us and amplify your potential.</p>
                </div>

                <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" placeholder="John Doe" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="john@example.com" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>

                    <button type="submit" className="btn-auth-submit">
                        Sign Up
                    </button>
                </form>

                <div className="divider">OR</div>

                <button className="btn-google">
                    <Mail size={18} />
                    Sign up with Google
                </button>

                <p className="auth-footer-text">
                    Already have an account? <Link to="/login" className="auth-link-highlight">Login</Link>
                </p>
            </div>

            <div className="signup-right">
                <div className="signup-image-bg" style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}signup-bg.jpeg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }} />

                <div className="signup-overlay-text">
                    <h2 className="overlay-heading">
                        Shared minds. Limitless potential.
                    </h2>
                    <p className="overlay-sub">
                        Experience the power of collective intelligence and real-time collaboration.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;