require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

/**
 * Starts the Express server.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
