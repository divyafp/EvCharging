const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const faqSchema = new mongoose.Schema({
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

const Faqs = mongoose.model('faqs', faqSchema);

module.exports = Faqs;
