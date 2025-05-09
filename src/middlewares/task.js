const db = require('../models');
const Task = db.Task;

module.exports.verifyTaskUpdate = async (req, res, next) => {
    try {

        const task = await Task.findOne({ where: { id:req.body.id } });

        if (req.user.id != task.createdBy)
        {
            return res.status(403).json({ error: "Task Update failed. Task not created by the current user" });
        }

        next();
        
    } catch (error) {
        console.error("Error verifying whether the task was created by the user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports.verifyTaskDelete = async (req, res, next) => {
    try {

        const task = await Task.findOne({ where: { id:req.params.id } });

        if (req.user.id != task.createdBy)
        {
            return res.status(403).json({ error: "Task deletion failed. Task not created by the current user" });
        }

        next();
        
    } catch (error) {
        console.error("Error verifying whether the task was created by the user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

