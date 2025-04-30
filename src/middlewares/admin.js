const db = require('../models');
const User = db.User;
const Role = db.Role;

module.exports.verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            include: {
                model: Role,
                attributes: ['name']
            }
        });

        if (!user || user.Role.name !== "Admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        next();
        
    } catch (error) {
        console.error("Error verifying admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

