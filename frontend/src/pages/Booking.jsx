import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { User, Smartphone, Activity, ClipboardList, Stethoscope } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

function Booking() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [doctors, setDoctors] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        phone: '',
        symptoms: '',
        doctorName: ''
    })

    useEffect(() => {
        const auth = localStorage.getItem('patientAuth')
        if (!auth) {
            alert('Please login to book an appointment.')
            navigate('/patient-login')
            return
        }
        const patient = JSON.parse(auth)
        setFormData(prev => ({
            ...prev,
            name: patient.name || '',
            phone: patient.phone || ''
        }))

        // Fetch available doctors
        axios.get(`${API_URL}/doctors`)
            .then(res => {
                const available = res.data.filter(d => d.status === 'available')
                setDoctors(available)
            })
            .catch(err => console.error('Error fetching doctors:', err))
    }, [navigate])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validate required fields explicitly
        if (!formData.name || !formData.phone || !formData.doctorName || !formData.symptoms) {
            setError('All fields are required.')
            setLoading(false)
            return
        }

        try {
            const response = await axios.post(`${API_URL}/appointments`, formData)
            const app = response.data

            // Show success popup with real data
            alert(`✅ Appointment booked successfully!\n\nPatient: ${app.name}\nToken number: ${app.tokenNumber}\nScheduled Time: ${app.appointmentTime}\nDoctor: ${app.doctorName}`)

            navigate('/confirmation', { state: { appointment: app } })
        } catch (err) {
            console.error('Booking failed:', err)
            // Show real error message from backend if available
            const msg = err.response?.data?.message || err.response?.data?.error || 'Error booking appointment. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
        >
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                    <div style={{ background: '#007AFF', padding: '10px', borderRadius: '12px' }}>
                        <ClipboardList color="white" size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Book Appointment</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1d1d1f', fontWeight: '600' }}>
                            <User size={16} /> Patient Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            required
                            readOnly={!!formData.name} // Lock if logged in
                            value={formData.name}
                            onChange={handleChange}
                            style={{ background: '#f5f5f7' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1d1d1f', fontWeight: '600' }}>
                                Age
                            </label>
                            <input
                                type="number"
                                name="age"
                                placeholder="Age"
                                required
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1d1d1f', fontWeight: '600' }}>
                                <Smartphone size={16} /> Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="10 digit number"
                                required
                                readOnly={!!formData.phone} // Lock if logged in
                                value={formData.phone}
                                onChange={handleChange}
                                style={{ background: '#f5f5f7' }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1d1d1f', fontWeight: '600' }}>
                            <Stethoscope size={16} /> Select Doctor
                        </label>
                        <select
                            name="doctorName"
                            required
                            value={formData.doctorName}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e0e0e0', appearance: 'none', background: 'white' }}
                        >
                            {doctors.length === 0 ? (
                                <option value="">No doctors available today</option>
                            ) : (
                                <>
                                    <option value="">Choose a specialist...</option>
                                    {doctors.map(doc => <option key={doc._id} value={doc.name}>{doc.name} ({doc.specialty})</option>)}
                                </>
                            )}
                        </select>
                        {doctors.length === 0 && (
                            <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#FF3B30', fontWeight: '500' }}>
                                🔴 All doctors are currently away. Please check back later.
                            </p>
                        )}
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1d1d1f', fontWeight: '600' }}>
                            <Activity size={16} /> Symptoms / Reason
                        </label>
                        <textarea
                            name="symptoms"
                            rows="3"
                            placeholder="Describe your condition (e.g., persistent fever, headache)"
                            required
                            value={formData.symptoms}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontFamily: 'inherit' }}
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ color: '#FF3B30', background: '#FFEBEE', padding: '15px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                        style={{ padding: '18px', fontSize: '1.1rem', background: loading ? '#86868b' : 'linear-gradient(90deg, #007AFF, #5856D6)', border: 'none' }}
                    >
                        {loading ? 'Processing...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </motion.div>
    )
}

export default Booking

