import dotenv from "dotenv";
import app from "./server.js";
import connectDB from "./src/config/db.js";
import PORT from "./src/config/app.config.js"

dotenv.config();
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});