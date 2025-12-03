// // src/pages/UserDashboard.js
// import React from "react";
// import { useAuth } from '../context/AuthContext.jsx';
// import { useNavigate } from 'react-router-dom';

// export default function UserDashboard() {
//     const { logout } = useAuth();
//     const navigate = useNavigate();

//     const handleLogout = () => {
//         logout();
//         navigate('/login', { replace: true });
//     };

//     return (
//         <div>
//             <h2>User Dashboard</h2>
//             <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a placeholder for user-specific content.</p>
//             <button onClick={handleLogout} className="logout-btn">Logout</button>
//         </div>
//     );
// }
// src/pages/UserDashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 md:p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'User'}!</h1>
                            <p className="text-gray-600 mt-2">Your personal dashboard</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Information</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Email:</span> {user?.email}</p>
                                <p><span className="font-medium">Roles:</span> {user?.roles?.join(', ') || 'User'}</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
                            <div className="space-y-2">
                                <p>Member since: {new Date().toLocaleDateString()}</p>
                                <p>Account status: <span className="text-green-600 font-medium">Active</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                                <h4 className="font-medium text-gray-900">Edit Profile</h4>
                                <p className="text-sm text-gray-600 mt-1">Update your information</p>
                            </button>
                            <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                                <h4 className="font-medium text-gray-900">Change Password</h4>
                                <p className="text-sm text-gray-600 mt-1">Update your security</p>
                            </button>
                            <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left">
                                <h4 className="font-medium text-gray-900">View Activity</h4>
                                <p className="text-sm text-gray-600 mt-1">Check your account history</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;