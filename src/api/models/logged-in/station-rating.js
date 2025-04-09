const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { created_at } = require('../../../utils/static-values');

const ratingSchema = new mongoose.Schema({
    station_id: {
        type: String,
        trim: true,
    },
    rating: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    booking_id: {
        type: String,
        trim: true,
    },
    date: {
        type: String,
        trim: true,
        default: created_at,
    },
});

const Rating = mongoose.model('station_reviews', ratingSchema);

module.exports = Rating;
