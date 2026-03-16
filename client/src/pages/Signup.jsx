import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import '../styles/Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName.trim()
                    }
                }
            });

            if (error) {
                if (error.message.includes('rate limit')) {
                    showToast('Email limit exceeded. Please try "Sign up with Google" instead!', 'error');
                } else {
                    showToast(error.message, 'error');
                }
                return;
            }

            if (data?.user?.identities?.length === 0) {
                showToast('Email already in use. Try logging in.', 'error');
            } else {
                showToast('Signup successful! Check your email or try logging in.');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        console.log("Google Signup button clicked");
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
            console.error("FATAL: Google Signup process failed:", error);
            showToast(`Login failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            {toast && (
                <div className={`profile-toast profile-toast-${toast.type || 'success'}`} style={{ position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
                    <span>{toast.message}</span>
                </div>
            )}
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

                <form className="signup-form" onSubmit={handleSignup}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input name="fullName" type="text" className="form-input" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input name="email" type="email" className="form-input" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input name="password" type="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
                    </button>
                </form>

                <div className="divider">OR</div>

                <button
                    type="button"
                    className="btn-google"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                >
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