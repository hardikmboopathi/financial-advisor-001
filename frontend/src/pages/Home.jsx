import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Activity, User, Heart } from 'lucide-react'

function Home() {
    const navigate = useNavigate()

    const patientOptions = [
        {
            title: 'Book Appointment',
            desc: 'Get your timed token instantly',
            icon: <Calendar size={28} color="#007AFF" />,
            path: '/book-token',
            color: '#007AFF',
            bg: 'rgba(0, 122, 255, 0.1)'
        },
        {
            title: 'Check Live Status',
            desc: 'Monitor current token progress',
            icon: <Activity size={28} color="#5856D6" />,
            path: '/live-status',
            color: '#5856D6',
            bg: 'rgba(88, 86, 214, 0.1)'
        },
        {
            title: 'Patient Portal',
            desc: 'View your tokens & history',
            icon: <User size={28} color="#FF9500" />,
            path: '/patient-login',
            color: '#FF9500',
            bg: 'rgba(255, 149, 0, 0.1)'
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '900px', margin: '0 auto' }}
        >
            <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '60px 40px', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', color: '#1d1d1f', marginBottom: '1.5rem', fontWeight: '800' }}>Your Care is Our Priority</h2>
                <p style={{ color: '#86868b', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                    Experience healthcare reimagined with our advanced token management system.
                    Minimize wait times and maximize quality care.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '20px' }}>
                    {patientOptions.map((opt, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.03, translateY: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(opt.path)}
                            className="glass-card"
                            style={{
                                padding: '30px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                border: '1px solid rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}
                        >
                            <div style={{ width: '56px', height: '56px', background: opt.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {opt.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1d1d1f' }}>{opt.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#86868b' }}>{opt.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center', color: '#86868b', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '10px' }}>
                    <span>✓ Premium Care</span>
                    <span>✓ No Waiting Queues</span>
                    <span>✓ Expert Doctors</span>
                </div>
            </div>
        </motion.div>
    )
}

export default Home

