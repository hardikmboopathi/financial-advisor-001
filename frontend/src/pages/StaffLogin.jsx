import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, LogIn, ShieldCheck } from 'lucide-react'

function StaffLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Mock login
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
            localStorage.setItem('staffAuth', 'true')
            navigate('/admin-dashboard')
        } else {
            setError('Invalid credentials. Try admin/admin123')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ maxWidth: '400px', margin: '40px auto' }}
        >
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'rgba(0, 122, 255, 0.1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                    }}>
                        <ShieldCheck size={32} color="#007AFF" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Staff Login</h2>
                    <p style={{ color: '#86868b', fontSize: '0.9rem' }}>Access the administration dashboard</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} color="#86868b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 45px',
                                borderRadius: '12px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="#86868b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 45px',
                                borderRadius: '12px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#FF3B30', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>{error}</p>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <LogIn size={18} /> Login to Dashboard
                    </button>
                </form>
            </div>
        </motion.div>
    )
}

export default StaffLogin
