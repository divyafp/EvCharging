const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const stationRadiusSchema = new mongoose.Schema({
    radius: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: String,
        trim: true,
        default: created_at,
    },
});

const stationRadiusUsers = mongoose.model('radius', stationRadiusSchema);

module.exports = stationRadiusUsers;
