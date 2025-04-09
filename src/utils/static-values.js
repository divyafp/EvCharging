const { DATE_FORMATE } = require("./urls");
const moment = require('moment')

const created_at = moment(new Date()).format(DATE_FORMATE) + ' ' + moment(new Date()).format('hh:mm A')

module.exports = {created_at}