import express from "express";
//controller: channel.js
import { getChannel, getChannelById } from "../controller/channel.js";

const router = express.Router();

router.get("/channels", getChannel);
router.get("/channel/:channelId", getChannelById);

export default router;
