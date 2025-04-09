const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const registerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        unique: true,
        trim: true,
    },
    country_code_id: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
    },
    bike_mode: {
        type: String,
        default: null, // Set the default value here
        trim: true,
    },
    status: {
        type: String,
        trim: true,
        default : 'active'
    },
    social_id: {
        type: String,
        default: null, // Set the default value here
        trim: true,
    },
    notification_token: {
        type: String,
        default: null, // Set the default value here
        trim: true,
    },
    profile_image: {
        type: String,
        default: null, // Set the default value here
        trim: true,
    },
    date: {
        type: String,
        trim: true,
        default: created_at,
    },
});

const Users = mongoose.model('users', registerSchema);

module.exports = Users;