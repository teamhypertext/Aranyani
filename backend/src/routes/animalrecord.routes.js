import express from "express";
import { addAnimalRecord, getNearbyAnimals } from "../controller/animal.controller.js";
import { verifyDevice } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", addAnimalRecord);

router.get("/nearby", verifyDevice, getNearbyAnimals);

export default router;
