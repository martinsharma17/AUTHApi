// src/components/Dashboard.js
// Example protected view: Shows user data from backend, logout button.
// Only accessible if token exists (enforced in App.js).

import React from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // For user data
import { useNavigate } from 'react-router-dom'; // For logout redirect

const Dashboard = () => {
    const { user, logout } = useAuth(); // Destructure user from context
    const navigate = useNavigate();

    // Logout handler: Calls context logout, then redirects.
    const handleLogout = () => {
        logout(); // Clears token/user
        navigate('/login', { replace: true }); // Redirect without history back
    };

    // Edge: If no user (rare), show fallback.
    if (!user) {
        return <div>Loading user data...</div>;
    }

    return (
        <div className="dashboard-container">
            <h2>Welcome to Dashboard, {user.email}!</h2>
            <p>Your User ID: {user.id}</p>
            {/* Add more protected content here, e.g., API calls with token */}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
    );
};

export default Dashboard;