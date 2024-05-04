const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

const { sendOTPForPasswordReset  } = require('../utils/passwordReset');
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Check if user with the provided email already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
          return res.status(400).send('User with this email already exists');
      }

      // Create a new user with the provided email and password
      const newUser = new User({ email, password });
      await newUser.save();

      res.status(201).send('User registered successfully');
  } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).send('Error signing up');
  }
});

// Route for sending OTP for password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
      let user = await User.findOne({ email });

      // If user doesn't exist, create a new user with the provided email
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
// Route for resetting password with OTP
router.post('/reset-password', async (req, res) => {
  const { otp, newPassword } = req.body;

  try {
      // Find the user by OTP
      const user = await User.findOne({ otp });

      if (!user) {
          return res.status(404).send('Invalid OTP');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the OTP
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
