const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const vehicleSchema = new mongoose.Schema({
    vehicle_name: {
        type: String,
        required: true,
        trim: true,
    },
    model_no: {
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

const Vehicles = mongoose.model('vehicles', vehicleSchema);

module.exports = Vehicles;
