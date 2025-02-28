import express from "express";
//controller
import { register } from "../controller/auth.js";

const router = express.Router();

router.post("/register", register);

export default router;
