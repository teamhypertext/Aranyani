import express from "express";
import { createUser, updateUserLocation } from "../controller/user.controller.js";
import { verifyDevice } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create", createUser);
router.patch("/location", verifyDevice, updateUserLocation);

export default router;
