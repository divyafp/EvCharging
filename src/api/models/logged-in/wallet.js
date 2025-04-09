const mongoose = require('mongoose');
const { created_at } = require('../../../utils/static-values');

const creditWalletSchema = new mongoose.Schema({
    user_id: {
        type: String,
        trim: true,
    },
    account_type: {
        type: String,
        trim: true,
        default: null,
    },
    amount: {
        type: String,
        trim: true,
        default: null,
    },
    date: {
        type: String,
        trim: true,
        default: created_at,
    },
});

const Wallet = mongoose.model('wallets', creditWalletSchema);

module.exports = Wallet;
