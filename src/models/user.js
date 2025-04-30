const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const Role = require('./role');


const User = sequelize.define('Users', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    references: {
      model: Role,
      key: 'id'
    }
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  TFAverifyEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  TFAverifySMS: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  joiningDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted', 'inactive', 'not_verified'),
    defaultValue: 'not_verified'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordOK: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp: {
      type: DataTypes.STRING,
      allowNull: true
  },
  otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
  },
  last_signed_in_at: {
      type: DataTypes.DATE,
      allowNull: true
  }

}, {
  timestamps: true
});



User.afterSync(async () => {
  try {
    const companyId = "0000";
    const firstName = "Admin";
    const lastName = "One";
    const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';;
    const phoneNumber = process.env.ADMIN_PHONENO || '+911234567890';;
    const password = String(process.env.ADMIN_PASS) || '1234567890';
    const roleId = "1";
    const dob = "2000-01-01";
    const joiningDate = "2025-01-01";
    const email_verified = true;
    const phone_verified = true;
    const status = "inactive";

    const hashedPassword = await bcrypt.hash(password, 10); // ✅ Await now works

    const [created] = await User.findOrCreate({
      where: { email },
      defaults: {
        companyId,
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        roleId,
        joiningDate,
        dob,
        email_verified,
        phone_verified,
        status,
      },
    });

    if (created) {
      console.log("✅ Admin user created.");
    } else {
      console.log("✅ Admin already exists.");
    }
  } catch (error) {
    console.error("❌ Error inserting admin user:", error);
  }
});



module.exports = User;