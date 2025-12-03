// // src/components/Dashboard.js
// // Example protected view: Shows user data from backend, logout button.
// // Only accessible if token exists (enforced in App.js).

// import React from 'react';
// import { useAuth } from '../context/AuthContext.jsx'; // For user data
// import { useNavigate } from 'react-router-dom'; // For logout redirect

// const Dashboard = () => {
//     const { user, logout } = useAuth(); // Destructure user from context
//     const navigate = useNavigate();

//     // Logout handler: Calls context logout, then redirects.
//     const handleLogout = () => {
//         logout(); // Clears token/user
//         navigate('/login', { replace: true }); // Redirect without history back
//     };

//     // Edge: If no user (rare), show fallback.
//     if (!user) {
//         return <div>Loading user data...</div>;
//     }

//     return (
//         <div className="dashboard-container">
//             <h2>Welcome to Dashboard, {user.email}!</h2>
//             <p>Your User ID: {user.id}</p>
//             {/* Add more protected content here, e.g., API calls with token */}
//             <button onClick={handleLogout} className="logout-btn">Logout</button>
//         </div>
//     );
// };

// export default Dashboard;

import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-600 text-lg">
                Loading user data...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* Top Navbar */}
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-700">
                    User Dashboard
                </h1>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 p-6 space-y-6">

                {/* Welcome Section */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Welcome, <span className="text-blue-600">{user.email}</span>
                    </h2>
                    <p className="text-gray-600 mt-1">
                        User ID: <span className="font-medium text-gray-700">{user.id}</span>
                    </p>
                </div>

                {/* Example Cards Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                        <h3 className="text-gray-700 font-semibold text-lg mb-2">
                            Profile Details
                        </h3>
                        <p className="text-gray-500 text-sm">
                            View or update your personal account information.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                        <h3 className="text-gray-700 font-semibold text-lg mb-2">
                            Activity Logs
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Track your recent activities and system interactions.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                        <h3 className="text-gray-700 font-semibold text-lg mb-2">
                            Support Center
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Need help? Contact support anytime.
                        </p>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default Dashboard;
