const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.requestWithdraw = async (req, res) => {
  const { 
    userId,
    name,
    bankName,
    ifscCode,
    accountNumber,
    confirmAccountNumber,
    withdrawalAmount,
    upiId 
  } = req.body;

  try {
    // Validate account numbers match
    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ msg: 'Account numbers do not match' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const totalBalance = user.walletBalance + user.currentBalance;
    if (withdrawalAmount > totalBalance) {
      return res.status(400).json({ msg: 'Insufficient balance' });
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
      subject: `Withdrawal Request - ${userId}`,
      html: `
        <h2>New Withdrawal Request</h2>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Bank Details:</strong></p>
        <ul>
          <li>Bank Name: ${bankName}</li>
          <li>IFSC Code: ${ifscCode}</li>
          <li>Account Number: ${accountNumber}</li>
        </ul>
        <p><strong>UPI ID:</strong> ${upiId || 'Not provided'}</p>
        <p><strong>Withdrawal Amount:</strong> ₹${withdrawalAmount}</p>
        <p><strong>Current Balance:</strong> ₹${user.currentBalance}</p>
        <p><strong>Wallet Balance:</strong> ₹${user.walletBalance}</p>
      `
    });

    res.json({ msg: 'Withdrawal request submitted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
};