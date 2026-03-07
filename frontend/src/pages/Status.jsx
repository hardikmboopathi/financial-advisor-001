import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Bell, RefreshCw, Users, AlertCircle } from 'lucide-react'

const API_URL = 'http://localhost:5001/api'

function Status() {
    const [currentStatus, setCurrentStatus] = useState({ currentConsultedToken: 0 })
    const [todayAppointments, setTodayAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchData = async () => {
        try {
            setLoading(true)
            const [statusRes, appointmentsRes] = await Promise.all([
                axios.get(`${API_URL}/tokens/status`),
                axios.get(`${API_URL}/appointments/today`)
            ])
            setCurrentStatus(statusRes.data)
            setTodayAppointments(appointmentsRes.data)
            setError('')
        } catch (err) {
            console.error('Error fetching data:', err)
            setError('Could not fetch real-time data. Please check connection.')
        } finally {
            setLoading(false)
        }
    }

    // Poll for updates every 10 seconds
    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [])

    const waitingTokens = todayAppointments
        .filter(a => a.tokenNumber > currentStatus.currentConsultedToken && a.status === 'waiting')
        .map(a => a.tokenNumber)
        .sort((a, b) => a - b)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', marginBottom: '20px' }}>
                    Now Consulting
                </h2>

                {loading && !currentStatus.currentConsultedToken ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <RefreshCw size={48} color="#007AFF" className="spin" style={{ animation: 'spin 2s linear infinite' }} />
                    </div>
                ) : (
                    <motion.h1
                        key={currentStatus.currentConsultedToken}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ fontSize: '6rem', color: '#007AFF', margin: '0 0 10px 0', lineHeight: '1' }}
                    >
                        {currentStatus.currentConsultedToken || '---'}
                    </motion.h1>
                )}

                <p style={{ fontWeight: '500', color: currentStatus.currentConsultedToken > 0 ? '#34C759' : '#86868b' }}>
                    {currentStatus.currentConsultedToken > 0 ? 'Appointment in Progress' : 'Waiting for doctor to start'}
                </p>

                {error && (
                    <div style={{ marginTop: '20px', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.85rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>

            <div className="glass-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.2rem' }}>
                    <Users size={20} color="#5856D6" />
                    Next in Queue
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <AnimatePresence>
                        {waitingTokens.length > 0 ? (
                            waitingTokens.slice(0, 10).map((token, index) => (
                                <motion.div
                                    key={token}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.05 } }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="token-badge"
                                    style={{ background: index === 0 ? '#5856D6' : 'rgba(88, 86, 214, 0.15)', color: index === 0 ? 'white' : '#5856D6', padding: '10px 20px', fontSize: '1.1rem' }}
                                >
                                    #{token}
                                </motion.div>
                            ))
                        ) : (
                            <p style={{ color: '#86868b', fontSize: '0.95rem' }}>No more patients in waiting today.</p>
                        )}
                    </AnimatePresence>
                    {waitingTokens.length > 10 && <span style={{ color: '#86868b', alignSelf: 'center' }}>+{waitingTokens.length - 10} more</span>}
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', color: '#86868b', fontSize: '0.85rem' }}>
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Bell size={14} /> System refreshes automatically every 10 seconds.
                </p>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2s linear infinite; }
      `}</style>
        </motion.div>
    )
}

export default Status
