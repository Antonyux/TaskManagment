require('dotenv').config();
const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 5000;

(async () => {
  try {

    await db.sequelize.sync({ force: true });
    console.log("✅ Database synced successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error syncing database:", error);
    process.exit(1);
  }
})();
