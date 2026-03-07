const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    symptoms: { type: String, required: true },
    doctorName: { type: String, required: true },
    tokenNumber: { type: Number, required: true },
    appointmentTime: { type: String, required: true }, // Format "HH:MM AM/PM"
    status: {
        type: String,
        enum: ['waiting', 'completed', 'cancelled'],
        default: 'waiting'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
