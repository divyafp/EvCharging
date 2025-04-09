const SendSms = async (phone, message) => {
  require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  try {
    const sentMessage = await client.messages.create({
      body: message,
      from: "+12564491597", // Replace with your Twilio phone number
      to: phone,
    });
    console.log(`Message SID: ${sentMessage.sid}`);
    return true; // Return success
  } catch (error) {
    console.log(`Error sending SMS: ${error.message}`); // Log the error message
    return false; // Return false to indicate failure
  }
};

module.exports = SendSms;
