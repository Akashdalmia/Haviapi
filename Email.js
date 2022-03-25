const mailer = require("nodemailer");

const getEmailData = (to, name, marks, template) => {
  let data = null;

  switch (template) {
    case "marks":
      data = {
        from: "HAVI <sender@havi.co>",
        to,
        subject: `Congratulations 👏​ ${name}, Your Havi score is improved.`,
        html: `<h4>Hey ${name}</h4>
        We are proud of you. You have improved your Havi score, That means you have learnt, created or performed well.<br/>

        Your new score is<br/>
        <b>${marks}</b>
        <br/>
        <p>Keep it up, Keep inspiring.</p>
        <br/>
        Thanks<br/>
        Team Havi<br/>
        www.havi.co<br/>
        `,
      };
      break;
    default:
      data;
  }
  return data;
};

const sendEmail = (to, name, marks, template) => {
  const smptTransport = mailer.createTransport({
    host: "obpsjc1-08.nexcess.net",
    port: 587,
    secureConnection: false,
    auth: {
      user: "sender@havi.co",
      pass: "FealtyCozenWinterAvenue47",
    },
    from: "sender@havi.co",
    tls: {
      ciphers: "SSLv3",
    },
  });

  const mail = getEmailData(to, name, marks, template);

  smptTransport.sendMail(mail, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("email send sucessfully!!");
    }
    smptTransport.close();
  });
};

module.exports = { sendEmail };

// // async..await is not allowed in global scope, must use a wrapper
// async function main() {
//   // Generate test SMTP service account from ethereal.email
//   // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();

//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: testAccount.user, // generated ethereal user
//       pass: testAccount.pass, // generated ethereal password
//     },
//   });

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: "bar@example.com, baz@example.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//   // Preview only available when sending through an Ethereal account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//   // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// }

// main().catch(console.error);
