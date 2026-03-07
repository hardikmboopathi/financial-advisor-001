import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Smartphone, LogIn, HeartPulse } from 'lucide-react'

function PatientLogin() {
    const [credentials, setCredentials] = useState({ phone: '', name: '' })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Simple mock patient login - stores name & phone in localStorage
        if (credentials.phone.length >= 10 && credentials.name) {
            localStorage.setItem('patientAuth', JSON.stringify(credentials))
            navigate('/patient-dashboard')
        } else {
            setError('Please enter a valid name and phone number.')
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
                        background: 'rgba(88, 86, 214, 0.1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                    }}>
                        <HeartPulse size={32} color="#5856D6" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Patient Portal</h2>
                    <p style={{ color: '#86868b', fontSize: '0.9rem' }}>Login to view your tokens and history</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} color="#86868b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={credentials.name}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 45px',
                                borderRadius: '12px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Smartphone size={18} color="#86868b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={credentials.phone}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 45px',
                                borderRadius: '12px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#FF3B30', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>{error}</p>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(90deg, #5856D6, #AF52DE)' }}>
                        <LogIn size={18} /> Access Portal
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#86868b', marginTop: '10px' }}>
                        Don't have an appointment? <a href="/book-token" style={{ color: '#5856D6', fontWeight: '600', textDecoration: 'none' }}>Book Now</a>
                    </p>
                </form>
            </div>
        </motion.div>
    )
}

export default PatientLogin
