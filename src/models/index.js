const sequelize = require('../config/db');
const User = require('./user');
const Role = require('./role');
const Task = require('./task');

// Associations
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// DB object
const db = { sequelize, User, Role, Task };
module.exports = db;

