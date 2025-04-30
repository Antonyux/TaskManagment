const { body, validationResult } = require("express-validator");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const validationRules = [
  body("email")
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  
  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      const phoneNumber = parsePhoneNumberFromString(value);
      if (!phoneNumber.isValid()) {
        throw new Error("Invalid phone number"); // This message will be used
      }
      return true;
    }),

  body("password")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Exporting the array of middlewares 
module.exports = [...validationRules, validate];
