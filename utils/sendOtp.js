const nodemailer = require("nodemailer");

exports.sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: `"OTP Support" <${process.env.EMAIL}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h3>Your OTP is: <b>${otp}</b></h3>`,
  });
};
