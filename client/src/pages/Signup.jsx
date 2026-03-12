import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import '../styles/Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName
                    }
                }
            });

            if (error) throw error;

            alert('Signup successful! Please check your email for verification.');
            navigate('/login');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (error) {
            alert(error.message);
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

                <button className="btn-google" onClick={handleGoogleSignup}>
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