// src/components/LoginForm.js
// Handles login form: Input validation, submission to backend via context, error display.
// Responsive, accessible (labels, required). Redirects on success.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For post-login redirect
import { useAuth } from '../context/AuthContext.jsx'; // Access login function

// Component: Self-contained, uses hooks for state.
const LoginForm = () => {
    // Local state: Form fields, errors, loading.
    const [email, setEmail] = useState(''); // Email input value
    const [password, setPassword] = useState(''); // Password input value
    const [error, setError] = useState(''); // Displays validation/API errors
    const [loading, setLoading] = useState(false); // Disables button during API call

    const { login } = useAuth(); // Destructure login from context
    const navigate = useNavigate(); // Hook for navigation

    // Submit handler: Async, prevents default form behavior.
    // Why async? Awaits API response before updating UI.
    const handleSubmit = async (event) => {
        event.preventDefault(); // Stop page reload
        setError(''); // Clear old errors
        setLoading(true); // UI feedback

        // Basic validation: Client-side before API call (faster UX).
        // Edge: Trims whitespace, checks emptiness (email type handles format).
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setError('Email and password are required.');
            setLoading(false);
            return; // Early exit
        }

        // Call backend-connected login: Passes validated inputs.
        const result = await login(trimmedEmail, password);
        if (result.success) {
            // Success: Navigate to dashboard (protected route handles check).
            navigate('/dashboard', { replace: true }); // Replace history to prevent back to login
        } else {
            // Error: Show backend message (e.g., "User not found").
            setError(result.message);
        }
        setLoading(false); // Re-enable form
    };

    return (
        <div className="form-container"> {/* Styled wrapper */}
            <h2>Login to Your Account</h2>
            {/* Form: Semantic HTML for accessibility */}
            <form onSubmit={handleSubmit}>
                {/* Email field: Type=email for browser validation */}
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Controlled input
                        placeholder="Enter your email"
                        required // HTML5 validation
                        disabled={loading} // Prevent changes during submit
                    />
                </div>
                {/* Password field: Secure type, min length hint */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        minLength={6} // Hint for user
                        required
                        disabled={loading}
                    />
                </div>
                {/* Error display: Conditional, styled red */}
                {error && <p className="error-message" role="alert">{error}</p>}
                {/* Submit: Full-width, loading text */}
                <button type="submit" disabled={loading || !email || !password}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {/* Nav link: To register */}
            <p className="form-link">
                Don't have an account? <a href="/register">Register here</a>
            </p>
        </div>
    );
};

export default LoginForm;