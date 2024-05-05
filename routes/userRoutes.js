const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');



router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
      await user.save();
    }

    const otp = await sendOTPForPasswordReset(email); // Utility function to send OTP
    user.otp = otp;
    await user.save();

    res.status(200).send('OTP sent successfully');
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).send('Error sending OTP');
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.otp !== otp) {
      return res.status(400).send('Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = '';
    await user.save();

    res.status(200).send('Password updated successfully');
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).send('Error resetting password');
  }
});



module.exports = router;
