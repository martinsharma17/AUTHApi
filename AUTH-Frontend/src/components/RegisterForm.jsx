// src/components/RegisterForm.js
// Similar to LoginForm but for /api/register. Includes password confirmation.
// On success: Auto-calls login() to seamless onboard, redirects to dashboard.
// Validation: Matches backend expectations (email unique, password strength).

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // For auto-login after register

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth(); // Reuse login for post-register auth
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        // Validation: Comprehensive - empty, match, length, email format.
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password || !confirmPassword) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }
        // Basic email regex (enhance with library if needed).
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError('Please enter a valid email.');
            setLoading(false);
            return;
        }

        try {
            // Register call: POST to your backend /api/register.
            const registerResponse = await fetch('http://localhost:3001/api/UserAuth/Register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail, password }),
            });
            const registerData = await registerResponse.json();

            if (registerData.success) {
                // Auto-login: Immediately auth the new user (no re-enter creds).
                const loginResult = await login(trimmedEmail, password);
                if (loginResult.success) {
                    navigate('/dashboard', { replace: true });
                } else {
                    setError('Registration successful, but login failed. Please login manually.');
                }
            } else {
                setError(registerData.message || 'Registration failed. Email may exist.');
            }
        } catch (err) {
            console.error('Register error:', err);
            setError('Server error. Ensure backend is running on port 3001.');
        }
        setLoading(false);
    };

    return (
        <div className="form-container">
            <h2>Create New Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        minLength={6}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        disabled={loading}
                    />
                </div>
                {error && <p className="error-message" role="alert">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="form-link">
                Already have an account? <a href="/login">Login here</a>
            </p>
        </div>
    );
};

export default RegisterForm;