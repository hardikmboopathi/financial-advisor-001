import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const isAdminPath = location.pathname.includes('admin') || location.pathname.includes('staff')
  const isAuth = localStorage.getItem('staffAuth') === 'true'

  const handleLogout = () => {
    localStorage.removeItem('staffAuth')
    navigate('/staff-login')
  }

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      marginBottom: '40px'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          background: 'linear-gradient(90deg, #007AFF, #5856D6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
          margin: 0
        }}>
          LifeLine Hospital
        </h1>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        {!isAdminPath ? (
          <>
            <Link to="/" style={{ textDecoration: 'none', color: '#1d1d1f', fontWeight: '600', fontSize: '0.9rem' }}>Home</Link>
            <Link to="/live-status" style={{ textDecoration: 'none', color: '#86868b', fontWeight: '600', fontSize: '0.9rem' }}>Live Status</Link>
            <Link to="/patient-login" style={{ textDecoration: 'none', color: '#86868b', fontWeight: '600', fontSize: '0.9rem' }}>Patient Portal</Link>
            <Link
              to="/staff-login"
              style={{
                textDecoration: 'none',
                background: 'rgba(0, 122, 255, 0.1)',
                color: '#007AFF',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}
            >
              Staff Portal
            </Link>
          </>
        ) : (
          <>
            <Link to="/" style={{ textDecoration: 'none', color: '#86868b', fontWeight: '600', fontSize: '0.9rem' }}>Patient View</Link>
            {isAuth && (
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: 'none',
                  color: '#FF3B30',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Logout Staff
              </button>
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

