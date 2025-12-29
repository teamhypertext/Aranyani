import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Aranyani Backend API is running!",
    timestamp: new Date().toISOString(),
  });
});

import animalRoutes from "./src/routes/animalrecord.routes.js";

app.use("/api/v1/animal-records", animalRoutes);

import userRoutes from "./src/routes/user.routes.js";
app.use("/api/v1/users", userRoutes);


export default app;