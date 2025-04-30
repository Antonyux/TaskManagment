const db = require('../models');
const { Op } = require('sequelize');

const User = db.User;
const Task = db.Task;
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    try {
        const {
            companyId,
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            roleId,
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
        

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            companyId,
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            roleId,
            joiningDate : new Date(),
            dob
        });

        res.status(201).json({
            message: "User registered successfully! Next please verify via Email or SMS or both.",
            user: { id: user.id, firstName, lastName, email, phoneNumber }
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const {
            companyId = null,
            firstName = null,
            lastName = null,
            email = null,
            phoneNumber = null,
            password = null,
            roleId = null,
            status = null
          } = req.body;


        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phoneNumber }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email or phone number already registered" });
        }

        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
          }

        const updatedData = Object.fromEntries(
            Object.entries({
              companyId,
              firstName,
              lastName,
              email,
              phoneNumber,
              hashedPassword,
              roleId,
              status
            }).filter(([_, value]) => value !== null)
          );

        await user.update(updatedData);

        if (email) {
            await user.update({ email_verified: false });
        }
        if (phoneNumber) {
            await user.update({ phone_verified: false });
        }
          
        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Error updating user" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.update({ status: "deleted" });
        
        res.json({ message: "User deleted successfully", user: { id: user.id, email:user.email } });
    } catch (error) {
        res.status(500).json({ error: "Error deleting user" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; 
        const now = Date.now(); 

        users.forEach(async (user) => {
            if (user.last_signed_in_at) {
                const lastSignedIn = new Date(user.last_signed_in_at);
                if (now - lastSignedIn.getTime() > THIRTY_DAYS_MS) {
                    await user.update({ status: "inactive" });
                }
            }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
};


exports.getTasks = async (req, res) => {
    try {

        const tasks = await Task.findAll();

        res.json(tasks);

    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const {
            id,
            assignedTo = null,
            status = null,
            priority = null,
          } = req.body;



        const task = await Task.findByPk(id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const updatedTask = Object.fromEntries(
            Object.entries({
                id,
                assignedTo,
                status,
                priority
            }).filter(([_, value]) => value !== null)
          );

        await task.update(updatedTask);
          
        res.json({ message: "Task updated successfully", task });
    } catch (error) {
        res.status(500).json({ error: "Error updating task" });
    }
};
