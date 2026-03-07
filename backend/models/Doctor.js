const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    }
});

module.exports = mongoose.model('Doctor', doctorSchema);
