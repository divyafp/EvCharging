const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: String,
        trim: true,
    },
    heading: {
        type: String,
        trim: true,
        default: null,
    },
    message: {
        type: String,
        trim: true,
        default: null,
    },
    read: {
        type: Boolean,
        trim: true,
        default: false,
    },
    date: {
        type: String,
        trim: true,
        default: created_at,
    },
});

const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;
