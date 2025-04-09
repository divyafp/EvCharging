var fs = require("fs");
const { BASE_URL } = require("./urls");
const OneSignal = require("onesignal-node");
const Notification = require("../api/models/common/notification");
const Users = require("../api/models/auth/users");
const nodemailer = require("nodemailer");

const delete_file = async (path, fileName) => {
  console.log(path + fileName);
  fs.unlink("./" + path + fileName, function (err) {
    console.log("file deleted successfully");
  });
};

function removeLeadingZero(phoneNumber) {
  // Check if the phone number starts with a zero
  if (phoneNumber.startsWith("0")) {
    // Remove the leading zero
    phoneNumber = phoneNumber.slice(1);
  }

  return phoneNumber;
}

async function sendNotification(user_id, heading, message) {
  const restApi = "OTMzNDhjYTItOGI2NC00ZDFlLTgxODMtODI2OTMxZGIzODUy";
  const appId = "2fe1426b-1143-4ac2-bfa7-3fa03a5d432c";
  try {
    const find = await Users.findOne({ _id: user_id });

    const client = new OneSignal.Client(appId, restApi);

    const notification = {
      headings: { en: heading || "Notification Title" },
      contents: { en: message || "Hello, this is a push notification!" },
      include_player_ids: [find?.notification_token],
      // included_segments: ['All'],
    };

    const response = await client.createNotification(notification);
    const transaction = await Notification.create({
      user_id,
      heading,
      message,
    });
    return true;
  } catch (error) {
    return error.message;
  }
}




// async function sendEmail() {
//     const testAccount = await nodemailer.createTestAccount()
//     const transporter = await nodemailer.createTransport({
//         host: "smpt.ethereal.email",
//         port: 587,
//         secure: true,
//         auth: {
//             user: testAccount.user,
//             pass: testAccount.pass
//         },
//     });
//   transporter.sendMail({
//       from: "OpenJavascript <test@openjavascript.info>",
//       to: "ayan.ali25508@gmail.com",
//       subject: "Testing, testing",
//       text: "test",
//     },
//     function (error, info) {
//       if (error) {
//         console.log(error)
//         return 0;
//       } else {
//         console.log(info.response)
//         return info.response;
//       }
//     }
//   );
// }

async function sendEmail() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻"<ayan.ali25508@gmail.com>', // sender address
      to: "ayan.ahmed2634@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
      attachments: [
        {
          filename: 'hello.json',
          content: JSON.stringify({
            name: "Hello World!"
          })
        }
      ]
    });
  
    console.log("Message sent: %s", info.messageId);
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
  
module.exports = {
  delete_file,
  removeLeadingZero,
  sendNotification,
  sendEmail,
};
