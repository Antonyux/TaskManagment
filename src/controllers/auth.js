const bcrypt = require('bcrypt');
const db = require('../models');
// const axios = require('axios');

const generateEmailToken = require('../utils/generateEmailToken');
const generateOTP = require('../utils/generateOTP');
const generateToken = require('../utils/generateToken')

const User = db.User;

const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');



const sendEmail = async (to, subject, text) => {
    console.log(`Sending email to ${to}: ${subject} - ${text}`);
};

const sendSMS = async (phone, message) => {
    console.log(`Sending SMS to ${phone}: ${message}`);
};

exports.register = async (req, res) => {
    try {

        const {
            companyId,
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            dob
          } = req.body;

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phoneNumber }]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: "Email or phone number already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            companyId,
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            joiningDate : new Date(),
            dob
        });

        res.status(201).json({
            message: "User registered successfully! Next please verify via Email or SMS or both.",
            user: { id: user.id, firstName, lastName, email, phoneNumber }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error registering user" });
    }
};


exports.sendES = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email : null;
        const phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : null;

        // Ensure at least one verification method is provided
        if (!email && !phoneNumber) {
            return res.status(400).json({ error: "Either email or phone number is required for verification." });
        }

        // Find user by email or phone number
        const user = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phoneNumber }]
            }
        });

        if (!user || user.status === "deleted") {
            return res.status(404).json({ message: "User not found or deleted" });
        }

        // ✅ Handle email verification
        if (email) {
            const emailToken = generateEmailToken(user.email);
            const verificationLink = `${process.env.BASE_URL}/api/auth/verifyEmail?token=${emailToken}`;
            await sendEmail(email, "Verify Your Email", `Click here to verify your email: <a href="${verificationLink}">Verify Email</a>`);
        }

        // ✅ Handle SMS verification
        if (phoneNumber) {
            const { otp, expiresAt } = generateOTP();
            await user.update({ otp: otp, otpExpiresAt: expiresAt });
            await sendSMS(phoneNumber, `Your OTP code is: ${otp}`);
        }

        res.json({ message: "Verification email or SMS-OTP for registration sent successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending email or SMS OTP" });
    }
};

exports.TFAsendES = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email : null;
        const phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : null;

        // Ensure at least one verification method is provided
        if (!email && !phoneNumber) {
            return res.status(400).json({ error: "Either email or phone number is required for 2FA." });
        }

        // Find user by email or phone number
        const user = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phoneNumber }]
            }
        });

        if (!user || user.status === "deleted") {
            return res.status(404).json({ message: "User not found or deleted" });
        }

        // ✅ Handle email verification
        if (email) {
            const emailToken = generateEmailToken(user.email);
            const verificationLink = `${process.env.BASE_URL}/api/auth/TFAverifyEmail?token=${emailToken}`;
            await sendEmail(email, "Verify Your Email", `Click here to verify your email: <a href="${verificationLink}">Verify Email</a>`);
        }

        // ✅ Handle SMS verification
        if (phoneNumber) {
            const { otp, expiresAt } = generateOTP();
            await user.update({ otp, otpExpiresAt: expiresAt });
            await sendSMS(phoneNumber, `Your OTP code is: ${otp}`);
        }

        res.json({ message: "Verification email or SMS-OTP for 2FA sent successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending email or SMS OTP" });
    }
};



exports.loginTFA = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email && !password) {
            return res.status(400).json({ error: "Email and Password are required for login." });
        }

        const user = await User.findOne({ where: { email } });

        if (!user || user.status === "deleted") {
            return res.status(404).json({ message: "User not found or deleted" });
        }

        // Ensure phone or email is verified
        if (!user.phone_verified && !user.email_verified) {
            return res.status(403).json({ error: "Account not verified. Please verify your phone number or email." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        await user.update({ passwordOK: true });

        res.json({ message: "Password OK. Please use verified Email or Phone number for 2FA" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
};




exports.login = async (req, res) => {
    try {

        const user = req.user;

        if (!user.TFAverifyEmail && !user.TFAverifySMS) {
            return res.status(403).json({ error: "2FA verification required before login." });
        }

        if (!user.passwordOK) {
            return res.status(403).json({ error: "2FA OK. Invalid login. User Password needed." });
        }

        await user.update({ passwordOK: false, last_signed_in_at: new Date(), status: "active", TFAverifyEmail: false, TFAverifySMS: false });

        // Generate JWT token
        const token = generateToken(user);

        // Set cookie
        res.cookie('authToken', token, {
            httpOnly: true,  
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: process.env.COOKIE_EXPIRATION // 30 days
        });

        res.json({ message: "Login successful",
                   user: { id: user.id, firstName:user.firstName, lastName:user.lastName, email:user.email, phoneNumber:user.phoneNumber }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Invalid or missing token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

        // Find user
        const user = await User.findOne({ where: { email: decoded.email } });

        if (!user || user.status === "deleted") {
            return res.status(404).json({ message: "User not found or deleted" });
        }

        await user.update({ email_verified: true, status: "inactive" });

        return res.json({ message: 'Email verified successfully!' });

    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(400).json({ message: "Invalid or expired token" });
    }
};



exports.verifySMS = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        // Find user
        const user = await User.findOne({ where: { phoneNumber } });

        if (!user || user.status === "deleted") {
            return res.status(404).json({ message: "User not found or deleted" });
        }

        // Check OTP validity
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        await user.update({ otp: null, otpExpiresAt: null, phone_verified: true, status: "inactive" });

        return res.json({ message: 'Phone number verified successfully!' });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};





// async function sendSMS(phoneNumber, message) {
//   try {
//     const response = await axios.post('https://textbelt.com/text', {
//       phone: phoneNumber,
//       message: message,
//       key: 'textbelt', // Free key (limited to 1 message per day)
//     });

//     if (response.data.success) {
//       console.log(`SMS sent successfully to ${phoneNumber}`);
//     } else {
//       console.error('Failed to send SMS:', response.data);
//       throw new Error(response.data.error || 'Failed to send SMS');
//     }
//   } catch (error) {
//     console.error('Error sending SMS:', error);
//     throw new Error('Failed to send SMS verification');
//   }
// }

// // Example Usage:
// // sendSMS('+1234567890', 'Hello from Textbelt!');


// // Nodemailer Email Service
// async function sendEmail(to, subject, html) {
// try {
//     // Create a transporter using SMTP
//     const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
//     });

//     // Send email
//     await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: to,
//     subject: subject,
//     html: html
//     });

//     console.log(`Email sent successfully to ${to}`);
// } catch (error) {
//     console.error('Error sending email:', error);
//     throw new Error('Failed to send verification email');
// }
// }


