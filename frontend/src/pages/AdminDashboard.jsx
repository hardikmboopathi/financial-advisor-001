import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { CheckCircle, XCircle, Trash2, ArrowRight, RefreshCw, Layers, Stethoscope, UserCheck, UserX } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

function AdminDashboard() {
    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [filter, setFilter] = useState('All')
    const [currentStatus, setCurrentStatus] = useState({ currentConsultedToken: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const getSymptomStyle = (symptoms = '') => {
        const s = symptoms.toLowerCase();
        if (s.includes('fever')) return { icon: '🤒', color: '#E53935', label: 'Fever', bg: '#FFEBEE' };
        if (s.includes('headache')) return { icon: '🤕', color: '#FBC02D', label: 'Headache', bg: '#FFF9C4' };
        if (s.includes('chest pain') || s.includes('breathing')) return { icon: '🚨', color: '#D32F2F', label: 'Emergency', bg: '#FFCDD2' };
        if (s.includes('cold') || s.includes('cough')) return { icon: '🤧', color: '#1976D2', label: 'Cold / Flu', bg: '#E3F2FD' };
        if (s.includes('stomach')) return { icon: '🤢', color: '#388E3C', label: 'Stomach', bg: '#E8F5E9' };
        return { icon: '🏥', color: '#757575', label: 'General', bg: '#F5F5F5' };
    }

    const fetchAdminData = async () => {
        try {
            setLoading(true)
            const [appointmentsRes, statusRes, doctorsRes] = await Promise.all([
                axios.get(`${API_URL}/appointments/today`),
                axios.get(`${API_URL}/tokens/status`),
                axios.get(`${API_URL}/doctors`)
            ])
            setAppointments(appointmentsRes.data)
            setCurrentStatus(statusRes.data)
            setDoctors(doctorsRes.data)
            setError('')
        } catch (err) {
            console.error('Error fetching admin data:', err)
            setError('Error loading administration dashboard.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAdminData()
        const interval = setInterval(fetchAdminData, 15000)
        return () => clearInterval(interval)
    }, [])

    const toggleDoctorStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
            await axios.put(`${API_URL}/doctors/${id}/status`, { status: newStatus });
            setDoctors(doctors.map(d => d._id === id ? { ...d, status: newStatus } : d));
        } catch (err) {
            alert('Error updating doctor status');
        }
    }

    const updateToken = async (newToken) => {
        try {
            await axios.put(`${API_URL}/tokens/current`, { token: newToken })
            setCurrentStatus({ ...currentStatus, currentConsultedToken: newToken })
        } catch (err) {
            alert('Error updating token')
        }
    }

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/appointments/${id}/status`, { status })
            setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a))
        } catch (err) {
            alert('Error updating patient status')
        }
    }

    const deleteAppointment = async (id) => {
        if (!id) return;
        if (!window.confirm('Delete this appointment?')) return
        try {
            await axios.delete(`${API_URL}/appointments/${id}`)
            setAppointments(prev => prev.filter(a => (a._id || a.id) !== id))
        } catch (err) {
            alert('Error deleting appointment.')
        }
    }

    const nextWaitingToken = appointments.find(a => a.tokenNumber > currentStatus.currentConsultedToken && a.status === 'waiting')?.tokenNumber

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem' }}>Admin Dashboard</h2>
                    <p style={{ color: '#86868b', fontSize: '0.9rem' }}>Hospital Staff Management Portal</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Current Token</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h1 style={{ fontSize: '3rem', color: '#007AFF', margin: 0 }}>#{currentStatus.currentConsultedToken}</h1>
                        {nextWaitingToken && (
                            <button
                                onClick={() => updateToken(nextWaitingToken)}
                                className="btn btn-primary"
                                style={{ padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                Next {nextWaitingToken} <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Doctor Management Section */}
            <div className="glass-card" style={{ marginBottom: '30px', padding: '25px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Stethoscope size={20} color="#007AFF" /> Doctor Availability
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {doctors.map(doc => (
                        <div key={doc._id} style={{
                            padding: '15px 20px',
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.5)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{doc.name}</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#86868b' }}>{doc.specialty}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    background: doc.status === 'available' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                                    color: doc.status === 'available' ? '#34C759' : '#FF3B30'
                                }}>
                                    {doc.status}
                                </span>
                                <button
                                    onClick={() => toggleDoctorStatus(doc._id, doc.status)}
                                    style={{
                                        border: 'none',
                                        background: doc.status === 'available' ? '#FF3B30' : '#34C759',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    Toggle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={18} /> Today's Bookings
                    </h3>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'Fever', 'Emergency', 'Cold'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: filter === cat ? '#007AFF' : 'white',
                                    color: filter === cat ? 'white' : '#86868b',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <button onClick={fetchAdminData} style={{ background: 'none', border: 'none', color: '#007AFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', fontSize: '0.9rem' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                <div style={{ padding: '0 10px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ padding: '15px', fontSize: '0.85rem', color: '#86868b', fontWeight: '600' }}>TOKEN</th>
                                <th style={{ padding: '15px', fontSize: '0.85rem', color: '#86868b', fontWeight: '600' }}>PATIENT</th>
                                <th style={{ padding: '15px', fontSize: '0.85rem', color: '#86868b', fontWeight: '600' }}>DOCTOR</th>
                                <th style={{ padding: '15px', fontSize: '0.85rem', color: '#86868b', fontWeight: '600' }}>SYMPTOMS</th>
                                <th style={{ padding: '15px', fontSize: '0.85rem', color: '#86868b', fontWeight: '600' }}>TIME</th>
                                <th style={{ padding: '15px', fontSize: '0.85rem', color: '#86868b', fontWeight: '600' }}>STATUS</th>
                                <th style={{ padding: '15px', fontSize: '0.85rem', color: '#86868b', fontWeight: '600', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && appointments.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#86868b' }}>Loading appointments...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#86868b' }}>No appointments booked for today yet.</td></tr>
                            ) : (
                                <AnimatePresence>
                                    {appointments
                                        .filter(a => {
                                            if (filter === 'All') return true;
                                            return a.symptoms.toLowerCase().includes(filter.toLowerCase());
                                        })
                                        .map((a) => {
                                            const style = getSymptomStyle(a.symptoms);
                                            return (
                                                <motion.tr
                                                    key={a._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{ borderBottom: '1px solid rgba(0,0,0,0.025)', background: a.tokenNumber === currentStatus.currentConsultedToken ? 'rgba(0, 122, 255, 0.05)' : '' }}
                                                >
                                                    <td style={{ padding: '15px', fontWeight: '700', color: '#007AFF' }}>#{a.tokenNumber}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{ fontWeight: '600' }}>{a.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#86868b' }}>{a.age}y • {a.phone}</div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{a.doctorName}</div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            background: style.bg,
                                                            color: style.color,
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            <span>{style.icon}</span>
                                                            <span>{a.symptoms}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{a.appointmentTime}</div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <span className={`status-tag status-${a.status}`}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            {a.status === 'waiting' && (
                                                                <>
                                                                    <button onClick={() => updateStatus(a._id, 'completed')} title="Complete" style={{ border: 'none', background: '#E8F5E9', color: '#43A047', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                                                                        <CheckCircle size={18} />
                                                                    </button>
                                                                    <button onClick={() => updateStatus(a._id, 'cancelled')} title="Cancel" style={{ border: 'none', background: '#FFF3E0', color: '#FB8C00', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button onClick={() => deleteAppointment(a._id)} title="Delete" style={{ border: 'none', background: '#FFEBEE', color: '#E53935', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {error && (
                <div style={{ color: '#FF3B30', background: '#FFEBEE', padding: '15px', borderRadius: '12px', marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}
        </motion.div>
    )
}

export default AdminDashboard

