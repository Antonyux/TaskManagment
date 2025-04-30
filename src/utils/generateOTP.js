function generateOtp(length = 6) {
    const otp = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    return { otp, expiresAt };
}

module.exports = generateOtp;
