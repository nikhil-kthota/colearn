import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Leaf } from 'lucide-react';
import '../styles/Signup.css';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Add auth logic here later
        console.log("Login clicked");
    };

    return (
        <div className="signup-container">
            <div className="signup-left">
                <Link to="/" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-display)' }}>
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <div className="signup-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Leaf size={32} className="brand-icon" strokeWidth={0} />
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--color-deep-blue)' }}>CoLearn</span>
                    </div>
                    <h1 className="signup-title">Welcome Back</h1>
                </div>

                <form className="signup-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="john@example.com" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-1rem' }}>
                        <a href="#" className="auth-forgot-pass">Forgot password?</a>
                    </div>

                    <button type="submit" className="btn-auth-submit">
                        Login
                    </button>
                </form>

                <div className="divider">OR</div>

                <button className="btn-google">
                    <Mail size={18} />
                    Login with Google
                </button>

                <p className="auth-footer-text">
                    Don't have an account? <Link to="/signup" className="auth-link-highlight">Sign Up</Link>
                </p>
            </div>

            <div className="signup-right">
                <div className="signup-image-bg" style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}signup-bg.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />

                <div className="signup-overlay-text">
                    <h2 className="overlay-heading">
                        Your path continues here.
                    </h2>
                    <p className="overlay-sub">
                        Log in and push your learning potential to new heights with CoLearn.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
