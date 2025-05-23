import express from "express";
//controller
import { getUser } from "../controller/user.js";

const router = express.Router();

router.get("/users", getUser);

export default router;
