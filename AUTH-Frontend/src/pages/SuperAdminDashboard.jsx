// src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "User" });
    
    const { token, logout, apiBase } = useAuth();
    const navigate = useNavigate();

    // Fetch data
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, adminsRes] = await Promise.all([
                fetch(`${apiBase}/SuperAdmin/AllUsers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${apiBase}/SuperAdmin/AllAdmins`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (adminsRes.ok) setAdmins(await adminsRes.json());
        } catch (err) {
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // Add new user/admin
    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setError("All fields are required");
            return;
        }

        try {
            const response = await fetch(`${apiBase}/SuperAdmin/Add${newUser.role}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password
                })
            });

            if (response.ok) {
                setSuccess(`${newUser.role} added successfully`);
                setShowAddModal(false);
                setNewUser({ name: "", email: "", password: "", role: "User" });
                fetchData();
            } else {
                setError("Failed to add user");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // Delete user/admin
    const handleDelete = async (id, isAdmin) => {
        if (!window.confirm("Are you sure you want to delete?")) return;

        try {
            const endpoint = isAdmin ? 'DeleteAdmin' : 'DeleteUser';
            const response = await fetch(`${apiBase}/SuperAdmin/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess("Deleted successfully");
                fetchData();
            } else {
                setError("Failed to delete");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // Make user admin
    const handleMakeAdmin = async (userId) => {
        try {
            const response = await fetch(`${apiBase}/SuperAdmin/MakeAdmin/${userId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess("User promoted to admin");
                fetchData();
            } else {
                setError("Failed to promote user");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage all users and administrators</p>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Add New User/Admin
                        </button>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Total Admins</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">{admins.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Total Accounts</h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{users.length + admins.length}</p>
                    </div>
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Add New User/Admin</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{user.name || 'N/A'}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleMakeAdmin(user.id)}
                                                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                    >
                                                        Make Admin
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id, false)}
                                                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Admins Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All Admins ({admins.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{admin.name || 'N/A'}</td>
                                            <td className="px-6 py-4">{admin.email}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDelete(admin.id, true)}
                                                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                >
                                                    Remove Admin
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;