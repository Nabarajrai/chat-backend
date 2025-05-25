import express from "express";
//controller: channel.js
import { getChannel } from "../controller/channel.js";

const router = express.Router();

router.get("/channels", getChannel);

export default router;
