import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
    CheckCircle, XCircle, Trash2, ArrowRight, RefreshCw,
    Layers, Stethoscope, UserCheck, UserX, LayoutDashboard,
    Users, Settings, Plus, Search, Filter, TrendingUp, Clock
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [currentStatus, setCurrentStatus] = useState({ currentConsultedToken: 0 })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('All')

    // Add Doctor Modal State
    const [showAddDoc, setShowAddDoc] = useState(false)
    const [newDoc, setNewDoc] = useState({ name: '', specialty: '' })

    const fetchAllData = async () => {
        try {
            const [appRes, statusRes, docRes] = await Promise.all([
                axios.get(`${API_URL}/appointments/today`),
                axios.get(`${API_URL}/tokens/status`),
                axios.get(`${API_URL}/doctors`)
            ])
            setAppointments(appRes.data)
            setCurrentStatus(statusRes.data)
            setDoctors(docRes.data)
        } catch (err) {
            console.error('Data sync error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
        const interval = setInterval(fetchAllData, 10000)
        return () => clearInterval(interval)
    }, [])

    // --- Actions ---
    const updateToken = async (num) => {
        try {
            await axios.put(`${API_URL}/tokens/current`, { token: num })
            setCurrentStatus({ ...currentStatus, currentConsultedToken: num })
        } catch (err) { alert('Token update failed') }
    }

    const updatePatientStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/appointments/${id}/status`, { status })
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a))
        } catch (err) { alert('Status update failed') }
    }

    const deletePatient = async (id) => {
        if (!window.confirm('Delete this record permanently?')) return
        try {
            await axios.delete(`${API_URL}/appointments/${id}`)
            setAppointments(prev => prev.filter(a => (a._id || a.id) !== id))
        } catch (err) { alert('Deletion failed') }
    }

    const handleAddDoctor = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post(`${API_URL}/doctors`, newDoc)
            setDoctors([...doctors, res.data])
            setNewDoc({ name: '', specialty: '' })
            setShowAddDoc(false)
        } catch (err) { alert('Failed to add doctor') }
    }

    const removeDoctor = async (id) => {
        if (!window.confirm('Remove this doctor from system?')) return
        try {
            await axios.delete(`${API_URL}/doctors/${id}`)
            setDoctors(prev => prev.filter(d => d._id !== id))
        } catch (err) { alert('Remove failed') }
    }

    const toggleDocAvailability = async (id, current) => {
        try {
            const status = current === 'available' ? 'unavailable' : 'available'
            await axios.put(`${API_URL}/doctors/${id}/status`, { status })
            setDoctors(prev => prev.map(d => d._id === id ? { ...d, status } : d))
        } catch (err) { alert('Toggle failed') }
    }

    // --- Helpers ---
    const getSymptomStyle = (s = '') => {
        const text = s.toLowerCase()
        if (text.includes('fever')) return { icon: '🤒', color: '#FF3B30', bg: '#FFEBEE' }
        if (text.includes('emergency') || text.includes('chest')) return { icon: '🚨', color: '#AF52DE', bg: '#F3E5F5' }
        return { icon: '🏥', color: '#007AFF', bg: '#E3F2FD' }
    }

    const stats = {
        total: appointments.length,
        waiting: appointments.filter(a => a.status === 'waiting' && a.tokenNumber > currentStatus.currentConsultedToken).length,
        completed: appointments.filter(a => a.status === 'completed').length
    }

    const filteredQueue = appointments.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.tokenNumber.toString().includes(searchTerm)
        const matchesCat = filterCategory === 'All' || a.symptoms.toLowerCase().includes(filterCategory.toLowerCase())
        return matchesSearch && matchesCat
    })

    const nextTokenNum = appointments.find(a => a.tokenNumber > currentStatus.currentConsultedToken && a.status === 'waiting')?.tokenNumber

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', gap: '20px' }}>
            {/* Sidebar */}
            <aside style={{ background: 'white', padding: '40px 20px', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ marginBottom: '40px', padding: '0 15px' }}>
                    <h3 style={{ fontSize: '0.8rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Menu</h3>
                </div>

                {[
                    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                    { id: 'queue', label: 'Patient Queue', icon: Users },
                    { id: 'doctors', label: 'Staff Directory', icon: Stethoscope },
                    { id: 'settings', label: 'System Config', icon: Settings },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 15px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === item.id ? '#007AFF' : 'transparent',
                            color: activeTab === item.id ? 'white' : '#1d1d1f',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        <item.icon size={18} /> {item.label}
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <main style={{ padding: '40px 40px 40px 0' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 5px 0' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p style={{ color: '#86868b' }}>Management Dashboard for LifeLine Hospital</p>
                    </div>
                    <button onClick={fetchAllData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={14} /> Sync Data
                    </button>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                <div className="glass-card" style={{ padding: '25px', position: 'relative' }}>
                                    <p style={{ margin: 0, color: '#86868b', fontSize: '0.9rem' }}>Live Token</p>
                                    <h2 style={{ fontSize: '2.5rem', color: '#007AFF', margin: '10px 0' }}>#{currentStatus.currentConsultedToken}</h2>
                                    {nextTokenNum && (
                                        <button onClick={() => updateToken(nextTokenNum)} style={{ cursor: 'pointer', background: '#007AFF', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                            Next: #{nextTokenNum}
                                        </button>
                                    )}
                                </div>
                                <div className="glass-card" style={{ padding: '25px' }}>
                                    <Users size={20} color="#5856D6" style={{ marginBottom: '10px' }} />
                                    <p style={{ margin: 0, color: '#86868b', fontSize: '0.9rem' }}>Total Today</p>
                                    <h2 style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.total}</h2>
                                </div>
                                <div className="glass-card" style={{ padding: '25px' }}>
                                    <Clock size={20} color="#FF9500" style={{ marginBottom: '10px' }} />
                                    <p style={{ margin: 0, color: '#86868b', fontSize: '0.9rem' }}>In Queue</p>
                                    <h2 style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.waiting}</h2>
                                </div>
                                <div className="glass-card" style={{ padding: '25px' }}>
                                    <TrendingUp size={20} color="#34C759" style={{ marginBottom: '10px' }} />
                                    <p style={{ margin: 0, color: '#86868b', fontSize: '0.9rem' }}>Completed</p>
                                    <h2 style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.completed}</h2>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '30px' }}>
                                <h3 style={{ marginBottom: '20px' }}>System Status</h3>
                                <div style={{ background: '#f5f5f7', padding: '20px', borderRadius: '16px', border: '1px solid #eee' }}>
                                    <p style={{ margin: 0, color: '#1d1d1f' }}>Backend: <span style={{ color: '#34C759', fontWeight: '700' }}>ONLINE</span></p>
                                    <p style={{ margin: '10px 0 0 0', color: '#86868b', fontSize: '0.85rem' }}>Last synchronized: {new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'queue' && (
                        <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="glass-card" style={{ padding: '0' }}>
                                <div style={{ padding: '25px 30px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={18} color="#86868b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search name or token..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['All', 'Fever', 'Emergency'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setFilterCategory(cat)}
                                                style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', background: filterCategory === cat ? '#007AFF' : '#f5f5f7', color: filterCategory === cat ? 'white' : '#1d1d1f', fontWeight: '600' }}
                                            >{cat}</button>
                                        ))}
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', background: '#fafafa' }}>
                                            <th style={{ padding: '20px 30px', color: '#86868b', fontWeight: '600', fontSize: '0.85rem' }}>TOKEN</th>
                                            <th style={{ padding: '20px', color: '#86868b', fontWeight: '600', fontSize: '0.85rem' }}>PATIENT</th>
                                            <th style={{ padding: '20px', color: '#86868b', fontWeight: '600', fontSize: '0.85rem' }}>SYMPTOMS</th>
                                            <th style={{ padding: '20px', color: '#86868b', fontWeight: '600', fontSize: '0.85rem' }}>STATUS</th>
                                            <th style={{ padding: '20px 30px', color: '#86868b', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQueue.map(a => {
                                            const s = getSymptomStyle(a.symptoms)
                                            return (
                                                <tr key={a._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                    <td style={{ padding: '20px 30px', fontWeight: '800', color: '#007AFF' }}>#{a.tokenNumber}</td>
                                                    <td style={{ padding: '20px' }}>
                                                        <div style={{ fontWeight: '600' }}>{a.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#86868b' }}>{a.phone} • {a.appointmentTime}</div>
                                                    </td>
                                                    <td style={{ padding: '20px' }}>
                                                        <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                            {s.icon} {a.symptoms}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '20px' }}>
                                                        <span className={`status-tag status-${a.status}`}>{a.status}</span>
                                                    </td>
                                                    <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                            {a.status === 'waiting' && (
                                                                <button onClick={() => updatePatientStatus(a._id, 'completed')} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#e8f5e9', color: '#43a047', cursor: 'pointer' }}><CheckCircle size={16} /></button>
                                                            )}
                                                            <button onClick={() => deletePatient(a._id)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#ffebee', color: '#e53935', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'doctors' && (
                        <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h2>Medical Staff</h2>
                                <button onClick={() => setShowAddDoc(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Plus size={16} /> Add Doctor
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {doctors.map(doc => (
                                    <div key={doc._id} className="glass-card" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{doc.name}</h3>
                                            <p style={{ margin: '0 0 15px 0', color: '#86868b', fontSize: '0.9rem' }}>{doc.specialty}</p>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => toggleDocAvailability(doc._id, doc.status)}
                                                    style={{ background: doc.status === 'available' ? '#34C759' : '#86868b', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}
                                                >{doc.status === 'available' ? 'Available' : 'Away'}</button>
                                                <button onClick={() => removeDoctor(doc._id)} style={{ background: 'none', border: 'none', color: '#FF3B30', fontSize: '0.8rem', fontWeight: '600' }}>Remove</button>
                                            </div>
                                        </div>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Stethoscope size={24} color="#007AFF" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals */}
            {showAddDoc && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <motion.form
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onSubmit={handleAddDoctor}
                        className="glass-card"
                        style={{ width: '400px', padding: '40px' }}
                    >
                        <h2 style={{ marginBottom: '25px' }}>Add New Doctor</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input
                                type="text" placeholder="Doctor Name" required
                                value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                                style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}
                            />
                            <input
                                type="text" placeholder="Specialty (e.g. Cardiologist)" required
                                value={newDoc.specialty} onChange={e => setNewDoc({ ...newDoc, specialty: e.target.value })}
                                style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Profile</button>
                                <button type="button" onClick={() => setShowAddDoc(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </div>
                    </motion.form>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard

