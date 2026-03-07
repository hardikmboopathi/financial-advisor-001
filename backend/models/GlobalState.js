const mongoose = require('mongoose');

const globalStateSchema = new mongoose.Schema({
    id: { type: String, default: 'tokenStatus' },
    currentConsultedToken: { type: Number, default: 0 }
});

module.exports = mongoose.model('GlobalState', globalStateSchema);
