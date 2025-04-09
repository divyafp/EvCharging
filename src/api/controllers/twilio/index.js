const SendSms = async (phone, message) => {
  const accountSid = "ACfc3ba06ba47f608d251bce7b6693a35b";
  const authToken = "387448c675cdeea1c0b4bf8d07b3f3bb";
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
