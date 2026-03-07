import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { User, LogOut, Calendar, Clock, Trash2, Heart } from 'lucide-react'

const API_URL = 'http://localhost:5001/api'

function PatientDashboard() {
    const [patient, setPatient] = useState(null)
    const [myAppointments, setMyAppointments] = useState([])
    const [currentStatus, setCurrentStatus] = useState({ currentConsultedToken: 0 })
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const auth = localStorage.getItem('patientAuth')
        if (!auth) {
            navigate('/patient-login')
            return
        }
        setPatient(JSON.parse(auth))
        fetchData()
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [navigate])

    const fetchData = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('patientAuth'))
            const [appointmentsRes, statusRes] = await Promise.all([
                axios.get(`${API_URL}/appointments/today`),
                axios.get(`${API_URL}/tokens/status`)
            ])

            // Filter appointments by phone number
            const filtered = appointmentsRes.data.filter(a => a.phone === auth.phone)
            setMyAppointments(filtered)
            setCurrentStatus(statusRes.data)
        } catch (err) {
            console.error('Error fetching patient data:', err)
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return
        try {
            await axios.delete(`${API_URL}/appointments/${id}`)
            setMyAppointments(prev => prev.filter(a => a._id !== id))
        } catch (err) {
            alert('Error cancelling appointment')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('patientAuth')
        navigate('/')
    }

    if (!patient) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
        >
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', background: '#e1e1e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} color="#86868b" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Welcome, {patient.name}</h2>
                        <p style={{ color: '#86868b', fontSize: '0.85rem', margin: 0 }}>Patient ID: {patient.phone.slice(-4)}</p>
                    </div>
                </div>
                <button onClick={handleLogout} style={{ border: 'none', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', padding: '10px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={20} color="#007AFF" /> Your Appointments
                    </h3>

                    {loading ? (
                        <p style={{ color: '#86868b', textAlign: 'center' }}>Loading...</p>
                    ) : myAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p style={{ color: '#86868b', marginBottom: '15px' }}>No active appointments found.</p>
                            <button onClick={() => navigate('/book-token')} className="btn btn-primary" style={{ padding: '10px 20px' }}>Book Now</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {myAppointments.map(app => (
                                <div key={app._id} style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.5)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#007AFF' }}>#{app.tokenNumber}</div>
                                        <div className={`status-tag status-${app.status}`}>{app.status}</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86868b', fontSize: '0.9rem', marginBottom: '5px' }}>
                                        <Clock size={16} /> Expected at: <strong>{app.appointmentTime}</strong>
                                    </div>

                                    {app.status === 'waiting' && (
                                        <button
                                            onClick={() => cancelAppointment(app._id)}
                                            style={{
                                                marginTop: '15px',
                                                border: 'none',
                                                background: 'none',
                                                color: '#FF3B30',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '0'
                                            }}
                                        >
                                            <Trash2 size={14} /> Cancel Appointment
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '25px', background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'rgba(255,255,255,0.9)' }}>Live Progress</h3>

                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Token</p>
                        <h1 style={{ fontSize: '4.5rem', margin: '10px 0', fontWeight: '800' }}>#{currentStatus.currentConsultedToken}</h1>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', fontSize: '0.85rem' }}>
                            Doctor is now consulting
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                            <Heart size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                            Please arrive 10 minutes before your scheduled time.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default PatientDashboard
