import express from "express";
import {
  getMessagesByUser,
  getMessageByChanneLId,
} from "../controller/message.js";

const router = express.Router();

router.get("/userMessage", getMessagesByUser);
router.get("/channelMessage", getMessageByChanneLId);
export default router;
