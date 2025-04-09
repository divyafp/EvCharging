const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const termsAndConditionSchema = new mongoose.Schema({
    html: {
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

const TermsAndConditions = mongoose.model('terms_and_conditions', termsAndConditionSchema);

module.exports = TermsAndConditions;
