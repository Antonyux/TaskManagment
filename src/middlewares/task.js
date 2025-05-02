const db = require('../models');
const User = db.User;
const Task = db.Task;

module.exports.verifyTaskUpdate = async (req, res, next) => {
    try {

        const task =   Task.findOne({
            where: { id: req.user.id },
            include: {
                model: User,
                attributes: ['id']
            }
        });

        if (req.user.id != task.createdBy)
        {
            return res.status(403).json({ error: "Task Update failed. Task not created by the current user" });
        }

        next();
        
    } catch (error) {
        console.error("Error verifying admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

