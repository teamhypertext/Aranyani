import express from "express";
import cors from "cors";
import animalRoutes from "./src/routes/animalrecord.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Aranyani Backend API is running!",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/v1/animal-records", animalRoutes);

import userRoutes from "./src/routes/user.routes.js";
app.use("/api/v1/users", userRoutes);


export default app;