const { User } = require('../models');
const { Task } = require('../models');

const bcrypt = require('bcrypt');
const { Op } = require('sequelize');


exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.status === "deleted") {
            return res.status(404).json({ message: "User not found or deleted" });
        }

        const {
            firstName = null,
            lastName = null,
            email = null,
            phoneNumber = null,
            password = null,
            dob = null
          } = req.body;     

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phoneNumber }]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: "Email or phone number already registered" });
        }
        
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
            }

        const updatedData = Object.fromEntries(
            Object.entries({
              firstName,
              lastName,
              email,
              phoneNumber,
              hashedPassword,
              dob
            }).filter(([_, value]) => value !== null)
          );

        await user.update(updatedData);

        if (email) {
            await user.update({ email_verified: false });
        }
        if (phoneNumber) {
            await user.update({ phone_verified: false });
        }

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating profile" });
    }
};


exports.logout = async (req, res) => {
    
    const user = await User.findByPk(req.user.id);
    
    if (!user || user.status === "deleted") {
        return res.status(404).json({ message: "User not found or deleted" });
    }

    await user.update({ status: "inactive" });

    res.clearCookie('authToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "None" }); 
    return res.status(200).json({ message: "Logged out successfully" });
}



exports.createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            assignedTo,
            status,
            priority
          } = req.body;
        

          const taskData = {
            title,
            description,
            assignedTo,
            createdBy: req.user.id
          };
      
          if (status !== undefined) taskData.status = status;
          if (priority !== undefined) taskData.priority = priority;
      
          const task = await Task.create(taskData);

        res.status(201).json({
            message: "task added successfully!",
            task
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating task" });
    }
};





exports.updateUserTask = async (req, res) => {
    try {

        const {
            id,
            title = null,
            description = null,
            assignedTo = null,
            status = null,
            priority = null
          } = req.body;     

        const task = await Task.findByPk(id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const updatedData = Object.fromEntries(
            Object.entries({
                title,
                description,
                assignedTo,
                status,
                priority
            }).filter(([_, value]) => value !== null)
          );

        await task.update(updatedData);

        res.json({ message: "Task updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating Task" });
    }
};

exports.getMyTasks = async (req, res) => {
    try {

        const user = await User.findByPk(req.user.id);

        const tasks = await user.getAssignedTasks({
        include: {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
        }
        });

        res.json(tasks);

    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
};

exports.createdTasks = async (req, res) => {
    try {

        const user = await User.findByPk(req.user.id);
        
        const tasks = await user.getCreatedTasks({
        include: {
            model: User,
            as: 'assignee',
            attributes: ['id', 'name']
        }
        });

        res.json(tasks);

    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
};