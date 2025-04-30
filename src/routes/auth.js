const express = require('express');
const validation = require('../middlewares/validation');
const nullValidation = require('../middlewares/nullValidation');
const { register, sendES, TFAsendES , loginTFA, login, verifyEmail, verifySMS } = require('../controllers/auth');
const { TFAverifySMS, TFAverifyEmail } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', validation, register);
router.post('/verifySMS', nullValidation, verifySMS);
router.post('/verifyEmail', verifyEmail);
router.post('/login', nullValidation, loginTFA);
router.post('/TFAverifySMS', nullValidation, TFAverifySMS, login);
router.post('/TFAverifyEmail', TFAverifyEmail, login);
router.post('/sendES', nullValidation, sendES);
router.post('/TFAsendES', nullValidation, TFAsendES);
    
module.exports = router;
