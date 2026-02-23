import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Leaf } from 'lucide-react';
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
                        <Leaf size={32} className="brand-icon" strokeWidth={0} />
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--color-deep-blue)' }}>CoLearn</span>
                    </div>
                    <h1 className="signup-title">Create Account</h1>
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
                    backgroundImage: `url(${import.meta.env.BASE_URL}signup-bg.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }} />

                <div className="signup-overlay-text">
                    <h2 className="overlay-heading">
                        Climb higher together.
                    </h2>
                    <p className="overlay-sub">
                        Learn smarter and unlock the peak of your learning potential.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;