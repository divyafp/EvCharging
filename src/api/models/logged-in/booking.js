const mongoose = require("mongoose");
const moment = require("moment");
const { DATE_FORMATE } = require("../../../utils/urls");
const { created_at } = require("../../../utils/static-values");
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  user_id: { type: String, trim: true },
  station_id: { type: String, trim: true },
  port_id: { type: String, trim: true },
  iso_start_time: { type: String, trim: true },
  start_time: { type: String, trim: true },
  end_time: { type: String, trim: true },
  account_type: { type: String, trim: true, default: null },
  amount: { type: String, trim: true, default: 0 },
  transaction_id: { type: String, trim: true, default: null },
  status: { type: String, trim: true, default: "pending" },
  in_progress: { type: String, trim: true, default: "false" },
  charger_id: { type: String, trim: true, default: false },
  connector_id: { type: String, trim: true, default: false },
  date: { type: String, trim: true, default: moment(new Date()).format(DATE_FORMATE) },
  charging_date: { type: String, trim: true, default: null },
  created_at: { type: String, trim: true, default: created_at },
  invoice_no: { type: String, trim: true, default: generateInvoiceNumber },
  units: { type: String, trim: true, default: 0 },
  initialWh: { type: String, trim: true, default: 0 },
  finalWh: { type: String, trim: true, default: 0 },
  charging_status: { type: Boolean, default: false },
});

function generateInvoiceNumber() {
  const staticPrefix = "CHARZNET";
  const uuid = uuidv4().toUpperCase();
  const InvoiceNumber = staticPrefix + uuid.substr(0, 7);

  return InvoiceNumber;
}

const Booking = mongoose.model("bookings", bookingSchema);

module.exports = Booking;
