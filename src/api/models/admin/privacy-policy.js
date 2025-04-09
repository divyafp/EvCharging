const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const privacyPolicySchema = new mongoose.Schema({
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

const PrivacyPolicy = mongoose.model('privacy_policies', privacyPolicySchema);

module.exports = PrivacyPolicy;
