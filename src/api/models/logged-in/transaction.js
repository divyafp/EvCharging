const mongoose = require('mongoose');
const moment = require('moment');
const { DATE_FORMATE } = require('../../../utils/urls');
const { v4: uuidv4 } = require('uuid');
const { created_at } = require('../../../utils/static-values');

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: String,
        trim: true,
    },
    credit_or_debit: {
        type: String,
        trim: true,
        default: null,
    },
    transaction_id: {
        type: String,
        trim: true,
        default: generateTransactionId,
    },
    amount: {
        type: String,
        trim: true,
        default: 0,
    },
    in_progress: {
        type: String,
        trim: true,
        default: false,
    },
    station_id: {
        type: String,
        trim: true,
        default: null,
    },
    transaction_reason: {
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

function generateTransactionId() {
    const staticPrefix = "TXN#";
    const uuid = uuidv4().toUpperCase();
    const transactionId = staticPrefix + uuid.substr(0, 7);

    return transactionId;
}


const Transaction = mongoose.model('transactions', transactionSchema);

module.exports = Transaction;
