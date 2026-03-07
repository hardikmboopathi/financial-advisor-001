require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Patient = require('./models/Patient');
const GlobalState = require('./models/GlobalState');
const Doctor = require('./models/Doctor');

const app = express();
app.use(express.json());
app.use(cors());

// --- Simple Request Logger ---
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- Mock Data Store for fallback (if MongoDB not available) ---
let patientsMemory = [];
let globalStateMemory = { id: 'tokenStatus', currentConsultedToken: 0 };
let doctorsMemory = [
    { _id: '1', name: 'Dr. Kumar', specialty: 'General Physician', status: 'available' },
    { _id: '2', name: 'Dr. Ravi', specialty: 'General Physician', status: 'available' },
    { _id: '3', name: 'Dr. Arun', specialty: 'General Physician', status: 'available' }
];
let useMemoryFallback = false;

// --- Database Connection (Optional) ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital-token-system';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');

        // Init Global State
        const state = await GlobalState.findOne({ id: 'tokenStatus' });
        if (!state) {
            await new GlobalState({ id: 'tokenStatus', currentConsultedToken: 0 }).save();
        }

        // Init Doctors
        const doctorCount = await Doctor.countDocuments();
        if (doctorCount === 0) {
            await Doctor.insertMany([
                { name: 'Dr. Kumar', specialty: 'General Physician', status: 'available' },
                { name: 'Dr. Ravi', specialty: 'General Physician', status: 'available' },
                { name: 'Dr. Arun', specialty: 'General Physician', status: 'available' }
            ]);
            console.log('Sample doctors initialized in DB');
        }
    } catch (err) {
        console.warn('MongoDB connection failed. Using In-Memory storage fallback.');
        useMemoryFallback = true;
    }
}

connectDB();

// --- Token Helper Logic ---
const startTimeStr = "11:00 AM";
const limitTimeStr = "2:00 PM";
const intervalMinutes = 8;

function convertToMinutes(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

function formatMinutes(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// --- API Endpoints ---

// Doctor Endpoints
// 1. Get All Doctors
app.get('/api/doctors', async (req, res) => {
    try {
        if (useMemoryFallback) return res.json(doctorsMemory);
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Update Doctor Status
app.put('/api/doctors/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const id = req.params.id;

        if (useMemoryFallback) {
            const index = doctorsMemory.findIndex(d => d._id === id);
            if (index !== -1) {
                doctorsMemory[index].status = status;
                return res.json(doctorsMemory[index]);
            }
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const doctor = await Doctor.findByIdAndUpdate(id, { status }, { new: true });
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Existing Appointment Endpoints...
// 1. Create Appointment (Updated with availability check could be added here, but client-side filter is requested)
app.post('/api/appointments', async (req, res) => {
    try {
        const { name, age, phone, symptoms, doctorName } = req.body;

        if (!name || !age || !phone || !symptoms || !doctorName) {
            console.warn('Booking attempt with missing fields:', req.body);
            return res.status(400).json({ message: 'All fields are required: Name, Age, Phone, Symptoms, and Doctor.' });
        }

        // Check doctor availability on backend too for safety
        let isAvailable = true;
        if (useMemoryFallback) {
            const doc = doctorsMemory.find(d => d.name === doctorName);
            if (doc && doc.status === 'unavailable') isAvailable = false;
        } else {
            const doc = await Doctor.findOne({ name: doctorName });
            if (doc && doc.status === 'unavailable') isAvailable = false;
        }

        if (!isAvailable) {
            return res.status(400).json({ message: `Dr. ${doctorName} is not available today.` });
        }

        // Fetch last token for today
        let lastToken = 0;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        if (useMemoryFallback) {
            lastToken = patientsMemory.reduce((max, p) => Math.max(max, p.tokenNumber), 0);
        } else {
            const lastPatient = await Patient.findOne({
                createdAt: { $gte: startOfToday, $lte: endOfToday }
            }).sort({ tokenNumber: -1 });
            lastToken = lastPatient ? lastPatient.tokenNumber : 0;
        }

        const nextToken = lastToken + 1;

        // Calculate time
        const startMinutes = convertToMinutes(startTimeStr);
        const limitMinutes = convertToMinutes(limitTimeStr);
        const appointmentMinutes = startMinutes + (nextToken - 1) * intervalMinutes;

        if (appointmentMinutes >= limitMinutes) {
            return res.status(400).json({ message: 'No more appointments available today after 2:00 PM.' });
        }

        const appointmentTime = formatMinutes(appointmentMinutes);

        const patientData = {
            name, age, phone, symptoms, doctorName,
            tokenNumber: nextToken,
            appointmentTime,
            status: 'waiting',
            createdAt: new Date()
        };

        if (useMemoryFallback) {
            const newPatient = { _id: Date.now().toString(), ...patientData };
            patientsMemory.push(newPatient);
            console.log(`✅ Appointment Booked (Memory): Token #${nextToken} at ${appointmentTime}`);
            res.status(201).json(newPatient);
        } else {
            const newPatient = new Patient(patientData);
            await newPatient.save();
            console.log(`✅ Appointment Booked (DB): Token #${nextToken} at ${appointmentTime} for Dr. ${doctorName}`);
            res.status(201).json(newPatient);
        }
    } catch (err) {
        console.error('❌ BOOKING ERROR:', err);
        res.status(500).json({ error: err.message, message: 'Server error while booking appointment.' });
    }
});

// 2. Get All Today's Patients
app.get('/api/appointments/today', async (req, res) => {
    try {
        if (useMemoryFallback) {
            return res.json(patientsMemory.sort((a, b) => a.tokenNumber - b.tokenNumber));
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const appointments = await Patient.find({
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        }).sort({ tokenNumber: 1 });

        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Update Patient Status (Complete/Cancel)
app.put('/api/appointments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const id = req.params.id;

        if (useMemoryFallback) {
            const patient = patientsMemory.find(p => (p._id || '').toString() === id.toString());
            if (patient) patient.status = status;
            return res.json(patient);
        }
        const patient = await Patient.findByIdAndUpdate(id, { status }, { new: true });
        res.json(patient);
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Cancel Appointment
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Attempting to delete appointment: ${id}`);

        if (useMemoryFallback) {
            const initialLength = patientsMemory.length;
            patientsMemory = patientsMemory.filter(p => (p._id || '').toString() !== id.toString());
            console.log(`Memory deletion: ${initialLength} -> ${patientsMemory.length} patients`);
            return res.json({ message: 'Appointment deleted', success: true });
        }
        await Patient.findByIdAndDelete(id);
        res.json({ message: 'Appointment deleted', success: true });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 5. Get Current Token Status
app.get('/api/tokens/status', async (req, res) => {
    try {
        if (useMemoryFallback) {
            return res.json(globalStateMemory);
        }
        const state = await GlobalState.findOne({ id: 'tokenStatus' });
        res.json(state);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Update Current Consulted Token (ADMIN)
app.put('/api/tokens/current', async (req, res) => {
    try {
        const { token } = req.body;
        if (useMemoryFallback) {
            globalStateMemory.currentConsultedToken = token;
            return res.json(globalStateMemory);
        }
        const state = await GlobalState.findOneAndUpdate(
            { id: 'tokenStatus' },
            { currentConsultedToken: token },
            { new: true }
        );
        res.json(state);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Global Error Handler
app.use((err, req, res, next) => {
    console.error('💥 GLOBAL ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});

server.on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Added to prevent premature exit
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
