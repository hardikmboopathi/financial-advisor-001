import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Booking from './pages/Booking'
import Confirmation from './pages/Confirmation'
import Status from './pages/Status'
import AdminDashboard from './pages/AdminDashboard'
import StaffLogin from './pages/StaffLogin'
import PatientLogin from './pages/PatientLogin'
import PatientDashboard from './pages/PatientDashboard'

// Protected Route for Admin
const AdminProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('staffAuth') === 'true'
  if (!isAuth) {
    return <Navigate to="/staff-login" replace />
  }
  return children
}

function Navigation() {
  const location = useLocation()
  const isAdminPath = location.pathname.includes('admin') || location.pathname.includes('staff')

  return (
    <header style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '40px' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(90deg, #007AFF, #5856D6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', margin: 0 }}>
          LifeLine Hospital
        </h1>
      </Link>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
        {!isAdminPath ? (
          <>
            <Link to="/" style={{ textDecoration: 'none', color: '#007AFF', fontWeight: '600', fontSize: '0.9rem' }}>Home</Link>
            <Link to="/live-status" style={{ textDecoration: 'none', color: '#5856D6', fontWeight: '600', fontSize: '0.9rem' }}>Live Status</Link>
            <Link to="/patient-login" style={{ textDecoration: 'none', color: '#86868b', fontWeight: '600', fontSize: '0.9rem' }}>Patient Portal</Link>
          </>
        ) : (
          <>
            <Link to="/" style={{ textDecoration: 'none', color: '#86868b', fontWeight: '600', fontSize: '0.9rem' }}>Patient View</Link>
            {localStorage.getItem('staffAuth') === 'true' && (
              <button
                onClick={() => { localStorage.removeItem('staffAuth'); window.location.href = '/staff-login'; }}
                style={{ background: 'none', border: 'none', color: '#FF3B30', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
              >Logout Staff</button>
            )}
          </>
        )}
      </nav>
    </header>
  )
}

function App() {
  return (
    <Router>
      <div className="container">
        <Navigation />

        <main>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Patient Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/book-token" element={<Booking />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/live-status" element={<Status />} />
              <Route path="/patient-login" element={<PatientLogin />} />
              <Route path="/patient-dashboard" element={<PatientDashboard />} />

              {/* Staff Routes */}
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route
                path="/admin-dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        <footer style={{ marginTop: '60px', textAlign: 'center', color: '#86868b', fontSize: '0.9rem', paddingBottom: '40px' }}>
          &copy; 2026 LifeLine Hospital | Care with compassion
          <div style={{ marginTop: '10px' }}>
            <Link to="/staff-login" style={{ textDecoration: 'none', color: '#c1c1c1', fontSize: '0.75rem' }}>Staff Access</Link>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

