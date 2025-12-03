// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

    const { token, logout, apiBase } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [token, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/Admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // Filter out admins if they appear in the list
                const regularUsers = data.filter(user =>
                    !user.roles?.includes('Admin') && !user.roles?.includes('SuperAdmin')
                );
                setUsers(regularUsers);
            }
        } catch (err) {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setError("All fields are required");
            return;
        }

        try {
            const response = await fetch(`${apiBase}/Admin/AddUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                setSuccess("User added successfully");
                setShowAddModal(false);
                setNewUser({ name: "", email: "", password: "" });
                fetchUsers();
            } else {
                setError("Failed to add user");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`${apiBase}/Admin/DeleteUser/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess("User deleted successfully");
                fetchUsers();
            } else {
                setError("Failed to delete user");
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
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage user accounts</p>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Add New User
                        </button>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Error and Success Messages */}
                <div className="mb-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            Error: {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            Success: {success}
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
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
                                    Add User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Users ({users.length})</h2>
                            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                                Admin Access Only
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{user.name || 'N/A'}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                {user.roles?.join(', ') || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                Delete
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
    );
};

export default AdminDashboard;