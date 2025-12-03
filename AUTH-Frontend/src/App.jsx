// import React from 'react'
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import { AuthProvider, useAuth } from './context/AuthContext.jsx'
// import LoginForm from './components/LoginForm.jsx'
// import RegisterForm from './components/RegisterForm.jsx'
// import Dashboard from './components/Dashboard.jsx'

// function AppContent() {
//   const { token } = useAuth()

//   return (
//     <Router>
//       <div className="App">
//         <header className="header">
//           <h1>My Auth App</h1>
//         </header>
//         <main>
//           <Routes>
//             <Route path="/login" element={<LoginForm />} />
//             <Route path="/register" element={<RegisterForm />} />
//             <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
//             <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   )
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   )
// }


import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import Dashboard from './components/Dashboard.jsx';

import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import { jwtDecode } from "jwt-decode"; // Corrected import
import Navbar from './components/Navbar.jsx'; // Added import for Navbar

const API_BASE_URL = "http://localhost:3001/api/"; // Define API base URL as a constant

function getUserRoles(token) {
  if (!token) return [];
  try {
    const decoded = jwtDecode(token);
    // Log the decoded token to see its structure
    console.log("Decoded JWT in getUserRoles:", decoded);
    // Check multiple potential keys for roles, prioritizing the .NET Identity specific URI
    const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
                || decoded["role"] 
                || decoded["roles"];
    console.log("Attempting to extract roles with keys: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role', 'role', 'roles'. Result:", roles);

    if (!roles) return []; // If roles is null or undefined after checks

    return Array.isArray(roles) ? roles : [roles];
  } catch (error) {
    console.error("Error decoding token or extracting roles:", error);
    return [];
  }
}

function AppContent() {
  const { token } = useAuth();
  const roles = getUserRoles(token);

  console.log("AppContent - Token:", token);
  console.log("AppContent - Roles from getUserRoles:", roles);

  const isSuperAdmin = roles.includes("SuperAdmin");
  const isAdmin = roles.includes("Admin");
  const isUser = roles.includes("User");

  console.log("AppContent - isSuperAdmin:", isSuperAdmin);
  console.log("AppContent - isAdmin:", isAdmin);
  console.log("AppContent - isUser:", isUser);

  return (
    <div className="App">
      <header className="header">
        {token && <Navbar />} {/* Conditionally render Navbar */}
        <h1>My Auth App</h1>
      </header>
      <main>
        <Routes>

          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Dashboard routing based on roles */}
          <Route
            path="/dashboard"
            element={
              token ? (
                isSuperAdmin ? (
                  <SuperAdminDashboard apiBase={API_BASE_URL} token={token} />
                ) : isAdmin ? (
                  <AdminDashboard apiBase={API_BASE_URL} token={token} />
                ) : isUser ? (
                  <UserDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
