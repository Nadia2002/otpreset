const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const User = require('../models/user');

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fitifyfitness1@gmail.com',
        pass: "oorc ynqo izro kzzg"
    }
});

// Function to send OTP
async function sendOTP(email) {
  const otp = randomstring.generate({ length: 6, charset: 'numeric' });

    const mailOptions = {
        from: 'FITTY fitness',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`
    };

    await transporter.sendMail(mailOptions);

    return otp;
}

// Function to send OTP for password reset to a user's email
async function sendOTPForPasswordReset(email) {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        const otp = await sendOTP(email);
        user.otp = otp;
        await user.save();

        return otp;
    } catch (error) {
        throw new Error('Error sending OTP for password reset: ' + error.message);
    }
}

module.exports = { sendOTPForPasswordReset };
