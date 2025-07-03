import express from "express";
//controller
import { getUser, getUserById } from "../controller/user.js";

const router = express.Router();

router.get("/users", getUser);
router.get("/users/:id", getUserById);

export default router;
