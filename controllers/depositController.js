const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.requestDeposit = async (req, res) => {
  try {
    const { userId } = req.body;
    const paymentProof = req.file;

    if (!paymentProof) {
      return res.status(400).json({ msg: 'Payment screenshot is required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: `Deposit Request - ${userId}`,
      html: `
        <h2>New Deposit Request</h2>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>User Email:</strong> ${user.email}</p>
        <p><strong>Current Balance:</strong> ₹${user.currentBalance}</p>
        <p><strong>Wallet Balance:</strong> ₹${user.walletBalance}</p>
      `,
      attachments: [{
        filename: paymentProof.originalname,
        content: paymentProof.buffer
      }]
    });

    res.json({ msg: 'Deposit request submitted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
};