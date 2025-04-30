const jwt = require('jsonwebtoken');

const generateEmailToken = (email) => {
    return jwt.sign({ email: email }, process.env.EMAIL_SECRET, { expiresIn: '1h' });
};

module.exports = generateEmailToken;
