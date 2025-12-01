// src/context/AuthContext.js
// Global state for authentication: Manages token/user, login/logout, persists in localStorage.
// Connected to your backend via fetch: Sends JSON to /api/login & /api/register.
// On load, checks for existing token and optionally validates it (uncomment if /api/me exists).
// Why Context? Avoids prop-drilling; any component can access auth state easily.

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context: Holds auth values (token, user, methods).
const AuthContext = createContext();

// Hook: useAuth() - Safe access to context (throws error if used outside provider).
// Usage in components: const { token, login, logout } = useAuth();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider'); // Prevents misuse
    }
    return context;
};

// Provider: Wraps app, manages state with hooks.
// Params: children (JSX to wrap).
// State: token (JWT string), user (object from backend), loading (bool for initial check).
export const AuthProvider = ({ children }) => {
    // Initialize from localStorage: Persists login across browser refreshes.
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => {
        const storedRoles = localStorage.getItem('userRoles');
        return storedRoles ? { roles: JSON.parse(storedRoles) } : null;
    }); // Backend user: { id, email, roles }
    const [loading, setLoading] = useState(true); // True on mount for splash prevention

    // Effect: Runs on mount - Restore user if token exists.
    // Why useEffect? Side-effect free component; handles async validation.
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                // Optional: Validate token with backend /api/me (uncomment if endpoint exists)
                // try {
                //   const res = await fetch('http://localhost:3001/api/me', {
                //     headers: { Authorization: `Bearer ${token}` }
                //   });
                //   if (res.ok) {
                //     const data = await res.json();
                //     setUser(data.user);
                //   } else {
                //     logout(); // Invalid token? Clear it
                //   }
                // } catch (err) {
                //   logout();
                // }
            } else {
                // If no token, clear user and roles from local storage
                localStorage.removeItem('userRoles');
                setUser(null);
            }
            setLoading(false); // Done loading
        };
        initAuth();
    }, [token]); // Re-run if token changes

    // Login function: Async POST to backend /api/login.
    // Params: email (string), password (string).
    // Returns: { success: bool, message?: string } for form handling.
    // Handles: Network errors, invalid creds, sets token/user on success.
    const login = async (email, password) => {
        try {
            // Fetch config: Matches your backend expectations (JSON body, no auth header for login).
            const response = await fetch('http://localhost:3001/api/UserAuth/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Required for JSON parsing on backend
                },
                body: JSON.stringify({ email, password }), // Exact body format for your API
            });

            const data = await response.json(); // Parse JSON response

            // Success check: Based on your backend { success: true }
            if (data.success) {
                // Persist: Store token securely (localStorage; use httpOnly cookies in prod if needed).
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRoles', JSON.stringify(data.roles));
                setToken(data.token);
                setUser({ roles: data.roles }); // Set user roles for display
                return { success: true }; // No message needed on success
            } else {
                return { success: false, message: data.message || 'Invalid credentials' }; // Backend error msg
            }
        } catch (error) {
            // Edge case: Network/offline - Generic error, no leak of details.
            console.error('Login error:', error); // Log for dev
            return { success: false, message: 'Network error. Check backend server.' };
        }
    };

    // Logout: Clears state/storage, no backend call (client-side).
    // Why? Token invalidation on backend optional; this suffices for most apps.
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRoles');
        setToken(null);
        setUser(null);
    };

    // Value: Expose to consumers - Includes loading to prevent flashes.
    const value = {
        token,      // For protected headers/routes
        user,       // For displaying user info (now includes roles)
        loading,    // For spinners/skeletons
        login,      // Function to call
        logout,     // Function to call
    };

    // Render: If loading, show nothing (or spinner); else provide context.
    if (loading) {
        return <div>Loading...</div>; // Simple placeholder; customize with spinner
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};