import express from "express";
import { getMessagesByUser } from "../controller/message.js";

const router = express.Router();

router.get("/userMessage", getMessagesByUser);
export default router;
