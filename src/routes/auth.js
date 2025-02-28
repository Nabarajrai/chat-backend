import express from "express";
//controller
import { register, login, logOut } from "../controller/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logOut);

export default router;
