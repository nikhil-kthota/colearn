import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import '../styles/Signup.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            
            // Store full name if available in user metadata
            const fullName = data.user.user_metadata?.full_name || 'User';
            localStorage.setItem('userName', fullName);
            
            navigate("/dashboard");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        console.log("Google Login button clicked");
        setLoading(true);
        try {
            // Check for commonly misplaced keys
            if (import.meta.env.VITE_SUPABASE_ANON_KEY?.startsWith('sb_')) {
                console.warn("CRITICAL: Your Supabase Anon Key looks like a Stripe key. Please check your .env.production file.");
            }

            const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
            console.log("Redirect URL being sent to Supabase:", redirectUrl);
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("FATAL: Google Login process failed:", error);
            alert(`Login Error: ${error.message}. Check browser console for details.`);
        } finally {
            setLoading(false);
        }
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
                        <img
                            src={`${import.meta.env.BASE_URL}logo-dark.png`}
                            alt="CoLearn Logo"
                            style={{ height: '32px', width: 'auto' }}
                        />
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>CoLearn</span>
                    </div>
                    <h1 className="signup-title">Welcome Back</h1>
                    <p className="signup-subtitle">Pick up exactly where you left off.</p>
                </div>

                <form className="signup-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input name="email" type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input name="password" type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-1rem' }}>
                        <a href="#" className="auth-forgot-pass">Forgot password?</a>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                    </button>
                </form>

                <div className="divider">OR</div>

                <button 
                    type="button" 
                    className="btn-google" 
                    onClick={handleGoogleLogin} 
                    disabled={loading}
                >
                    <Mail size={18} />
                    Login with Google
                </button>

                <p className="auth-footer-text">
                    Don't have an account? <Link to="/signup" className="auth-link-highlight">Sign Up</Link>
                </p>
            </div>

            <div className="signup-right">
                <div className="signup-image-bg" style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}signup-bg.jpeg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />

                <div className="signup-overlay-text">
                    <h2 className="overlay-heading">
                        Shared minds. Limitless potential.
                    </h2>
                    <p className="overlay-sub">
                        Empowering collective minds through shared growth and innovative learning.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
