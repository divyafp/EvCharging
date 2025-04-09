const mongoose = require("mongoose");
const { created_at } = require("../../../utils/static-values");

const environmentVariable = new mongoose.Schema({
  minimum_amount_for_charging: {
    type: String,
    trim: true,
    default : 0
  },
  gst: {
    type: String,
    trim: true,
    default : 0
  },
});

const EnvironmentVariable = mongoose.model(
  "environment_variable",
  environmentVariable
);

module.exports = EnvironmentVariable;
