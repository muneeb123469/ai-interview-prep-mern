require("dotenv").config();

const app = require("./app");
const connectDB = require("./database/database");

const PORT = process.env.PORT || 3000;

/**
 * Starts the backend server after successfully connecting to MongoDB.
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
