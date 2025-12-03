// src/context/AuthContext.js
// Global state for authentication: Manages token/user, login/logout, persists in localStorage.
// Connected to your backend via fetch: Sends JSON to /api/login & /api/register.
// On load, checks for existing token and optionally validates it (uncomment if /api/me exists).
// Why Context? Avoids prop-drilling; any component can access auth state easily.

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

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
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('authToken');
        console.log('Initial token from localStorage:', storedToken);
        return storedToken;
    });
    const [user, setUser] = useState(() => {
        const storedRoles = localStorage.getItem('userRoles');
        if (storedRoles) {
            console.log('Initial user roles from localStorage:', storedRoles);
            return { roles: JSON.parse(storedRoles) };
        } 
        console.log('No initial user roles found.');
        return null;
    }); // Backend user: { id, email, roles }
    const [loading, setLoading] = useState(true); // True on mount for splash prevention

    // Effect: Runs on mount - Restore user if token exists.
    // Why useEffect? Side-effect free component; handles async validation.
    useEffect(() => {
        const initAuth = async () => {
            console.log('Auth init effect running. Current token:', token);
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
                console.log('No token found on init, clearing local storage and user state.');
                localStorage.removeItem('userRoles');
                setUser(null);
            }
            setLoading(false); // Done loading
            console.log('Auth init completed. Loading set to false.');
        };
        initAuth();
    }, [token]); // Re-run if token changes

    // Login function: Async POST to backend /api/login.
    // Params: email (string), password (string).
    // Returns: { success: bool, message?: string } for form handling.
    // Handles: Network errors, invalid creds, sets token/user on success.
    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            // Fetch config: Matches your backend expectations (JSON body, no auth header for login).
            const response = await fetch('http://localhost:3001/api/UserAuth/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Required for JSON parsing on backend
                },
                body: JSON.stringify({ email, password }), // Exact body format for your API
            });

            const data = await response.json(); // Parse JSON response
            console.log('Login API response:', data);

            // Success check: Based on your backend { success: true }
            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRoles', JSON.stringify(data.roles));

                const decodedToken = jwtDecode(data.token);
                console.log("Decoded Token in AuthContext (for ID and Name):", decodedToken); // Log the full decoded token
                const userEmail = decodedToken.email;
                // Correctly extract userId using the standard 'sub' claim or the .NET Identity 'nameidentifier' claim
                const userId = decodedToken.sub || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']; 
                // Correctly extract userName using the .NET Identity 'name' claim
                const userName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decodedToken.name || '';

                setToken(data.token);
                setUser({ id: userId, email: userEmail, name: userName, roles: data.roles }); // Set full user object with name
                console.log('Login successful. User state set:', { id: userId, email: userEmail, name: userName, roles: data.roles });
                return { success: true }; // No message needed on success
            } else {
                console.log('Login failed:', data.message);
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
        console.log('Logging out.');
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
        console.log('AuthContext is loading...');
        return <div>Loading...</div>; // Simple placeholder; customize with spinner
    }

    console.log('AuthContext loaded. Token:', token, 'User:', user);
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};