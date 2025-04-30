const sequelize = require('../config/db');
const User = require('./user');
const Role = require('./role');
const Task = require('./task');

// Associations
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

User.hasMany(Task, { foreignKey: 'createdBy' });
Task.belongsTo(User, { foreignKey: 'createdBy' });

User.hasMany(Task, { foreignKey: 'assignedTo' });
Task.belongsTo(User, { foreignKey: 'assignedTo' });

// DB object
const db = { sequelize, User, Role, Task };
module.exports = db;

