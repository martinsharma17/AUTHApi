import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import Dashboard from './components/Dashboard.jsx'

function AppContent() {
  const { token } = useAuth()

  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>My Auth App</h1>
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}