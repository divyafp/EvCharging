const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const countryCodeSchema = new mongoose.Schema({
    country_code: {
        type: String,
        required: true,
        trim: true,
    },
    country_name: {
        type: String,
        required: true,
        trim: true,
    },
    country_short_name: {
        type: String,
        required: true,
        trim: true,
    },
    country_image: {
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

const CountryCode = mongoose.model('country_codes', countryCodeSchema);

module.exports = CountryCode;
