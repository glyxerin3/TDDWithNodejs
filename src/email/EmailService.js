const transporter = require('../config/emailTransporter');

const sendAcoountActivation = async (email, token) => {
  await transporter.sendMail(
    {
      from: 'My App <info@may-app.com>',
      to: email,
      subject: 'Account Activiation',
      html:
        `Token is ${token}`
    }
  );
};

module.exports = {
  sendAcoountActivation
};
