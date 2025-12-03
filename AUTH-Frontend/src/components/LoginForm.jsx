// // src/components/LoginForm.js
// // Handles login form: Input validation, submission to backend via context, error display.
// // Responsive, accessible (labels, required). Redirects on success.

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // For post-login redirect
// import { useAuth } from '../context/AuthContext.jsx'; // Access login function

// // Component: Self-contained, uses hooks for state.
// const LoginForm = () => {
//     // Local state: Form fields, errors, loading.
//     const [email, setEmail] = useState(''); // Email input value
//     const [password, setPassword] = useState(''); // Password input value
//     const [error, setError] = useState(''); // Displays validation/API errors
//     const [loading, setLoading] = useState(false); // Disables button during API call

//     const { login } = useAuth(); // Destructure login from context
//     const navigate = useNavigate(); // Hook for navigation

//     // Submit handler: Async, prevents default form behavior.
//     // Why async? Awaits API response before updating UI.
//     const handleSubmit = async (event) => {
//         event.preventDefault(); // Stop page reload
//         setError(''); // Clear old errors
//         setLoading(true); // UI feedback

//         // Basic validation: Client-side before API call (faster UX).
//         // Edge: Trims whitespace, checks emptiness (email type handles format).
//         const trimmedEmail = email.trim();
//         if (!trimmedEmail || !password) {
//             setError('Email and password are required.');
//             setLoading(false);
//             return; // Early exit
//         }

//         // Call backend-connected login: Passes validated inputs.
//         const result = await login(trimmedEmail, password);
//         if (result.success) {
//             // Success: Navigate to dashboard (protected route handles check).
//             navigate('/dashboard', { replace: true }); // Replace history to prevent back to login
//         } else {
//             // Error: Show backend message (e.g., "User not found").
//             setError(result.message);
//         }
//         setLoading(false); // Re-enable form
//     };

//     return (
//         <div className="form-container"> {/* Styled wrapper */}
//             <h2>Login to Your Account</h2>
//             {/* Form: Semantic HTML for accessibility */}
//             <form onSubmit={handleSubmit}>
//                 {/* Email field: Type=email for browser validation */}
//                 <div className="form-group">
//                     <label htmlFor="email">Email Address</label>
//                     <input
//                         type="email"
//                         id="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)} // Controlled input
//                         placeholder="Enter your email"
//                         required // HTML5 validation
//                         disabled={loading} // Prevent changes during submit
//                     />
//                 </div>
//                 {/* Password field: Secure type, min length hint */}
//                 <div className="form-group">
//                     <label htmlFor="password">Password</label>
//                     <input
//                         type="password"
//                         id="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Enter your password"
//                         minLength={6} // Hint for user
//                         required
//                         disabled={loading}
//                     />
//                 </div>
//                 {/* Error display: Conditional, styled red */}
//                 {error && <p className="error-message" role="alert">{error}</p>}
//                 {/* Submit: Full-width, loading text */}
//                 <button type="submit" disabled={loading || !email || !password}>
//                     {loading ? 'Logging in...' : 'Login'}
//                 </button>
//             </form>
//             {/* Nav link: To register */}
//             <p className="form-link">
//                 Don't have an account? <a href="/register">Register here</a>
//             </p>
//         </div>
//     );
// };

// export default LoginForm;


// src/components/LoginForm.js
// Handles login form: Input validation, submission to backend via context, error display.
// Responsive, accessible (labels, required). Redirects on success.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setError('Email and password are required.');
            setLoading(false);
            return;
        }

        const result = await login(trimmedEmail, password);
        if (result.success) {
            navigate('/dashboard', { replace: true });
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleBlur = (field) => () => {
        setTouched({ ...touched, [field]: true });
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    const isFormValid = email.trim() && password && isValidEmail(email);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl">

                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <LockClosedIcon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className={`h-5 w-5 ${touched.email && email ?
                                            (isValidEmail(email) ? 'text-green-500' : 'text-red-500') :
                                            'text-gray-400'
                                            }`} />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={handleBlur('email')}
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-offset-1 focus:outline-none transition-all duration-200 ${touched.email && email
                                            ? isValidEmail(email)
                                                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                                : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                        placeholder="you@example.com"
                                        required
                                        disabled={loading}
                                    />
                                    {touched.email && email && isValidEmail(email) && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {touched.email && email && !isValidEmail(email) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <ExclamationCircleIcon className="h-4 w-4" />
                                        Please enter a valid email address
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={handleBlur('password')}
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-offset-1 focus:outline-none transition-all duration-200 ${touched.password && password
                                            ? password.length >= 6
                                                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                                : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                        placeholder="Enter your password"
                                        minLength={6}
                                        required
                                        disabled={loading}
                                    />
                                    {touched.password && password && password.length >= 6 && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {touched.password && password && password.length < 6 && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <ExclamationCircleIcon className="h-4 w-4" />
                                        Password must be at least 6 characters
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div
                                className="rounded-xl bg-red-50 border border-red-200 p-4 animate-fade-in"
                                role="alert"
                            >
                                <div className="flex items-center">
                                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 ${loading || !isFormValid
                                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-80'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <LockClosedIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                                    Sign in to your account
                                </div>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">New to our platform?</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Create a new account
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        By signing in, you agree to our{' '}
                        <Link to="/terms" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>

            {/* Add custom animation */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default LoginForm;