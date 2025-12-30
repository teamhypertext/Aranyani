import dotenv from "dotenv";
import app from "./server.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} and accessible at http://0.0.0.0:${PORT}`);
});