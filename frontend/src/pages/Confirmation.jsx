import React from 'react'
import { useLocation, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, MapPin, Printer } from 'lucide-react'

function Confirmation() {
    const location = useLocation()
    const appointment = location.state?.appointment

    if (!appointment) {
        return <Navigate to="/" />
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
        >
            <CheckCircle size={64} color="#34C759" style={{ marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>Appointment Confirmed</h2>
            <p style={{ color: '#86868b', marginBottom: '30px' }}>Thank you, {appointment.name}. Your booking is successful.</p>

            {/* Ticket UI */}
            <div
                className="glass-card"
                style={{
                    background: 'white',
                    border: '2px dashed #007AFF',
                    maxWidth: '350px',
                    margin: '0 auto 30px auto',
                    padding: '40px 20px',
                    position: 'relative'
                }}
            >
                <p style={{ fontSize: '0.8rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', marginBottom: '15px' }}>
                    Consultation Ticket
                </p>

                <h4 style={{ fontSize: '0.9rem', color: '#86868b', margin: 0 }}>Token Number</h4>
                <h1 style={{ fontSize: '4rem', color: '#007AFF', margin: '0 0 20px 0', lineHeight: '1' }}>#{appointment.tokenNumber}</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                        <Clock size={16} color="#5856D6" />
                        <span style={{ fontWeight: '600' }}>Time: {appointment.appointmentTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                        <MapPin size={16} color="#5856D6" />
                        <span style={{ fontSize: '0.9rem', color: '#86868b' }}>Room 102, 1st Floor</span>
                    </div>
                </div>

                <hr style={{ border: 'none', height: '1px', background: 'rgba(0,0,0,0.1)', margin: '25px 0' }} />

                <div style={{ textAlign: 'left', fontSize: '0.85rem', color: '#86868b' }}>
                    <p style={{ marginBottom: '5px' }}><strong>Doctor Arrival:</strong> 11:00 AM</p>
                    <p><strong>Note:</strong> Please arrive 10 minutes before your slot.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <Link to="/live-status" className="btn btn-primary" style={{ flex: 1 }}>
                    View Live Queue
                </Link>
                <button
                    onClick={() => window.print()}
                    className="btn"
                    style={{ background: '#f5f5f7', color: '#1d1d1f', flex: '0 0 auto', padding: '16px' }}
                >
                    <Printer size={20} />
                </button>
            </div>

            <Link to="/" style={{ display: 'block', marginTop: '30px', textDecoration: 'none', color: '#86868b', fontWeight: '600' }}>
                Back to Home
            </Link>
        </motion.div>
    )
}

export default Confirmation
