import { db } from "../db/connect.js";
import jwt from "jsonwebtoken";

export const getChannel = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized access", status: "error" });
  }
  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Invalid token", status: "error" });
    }
    const query = "SELECT * FROM channels";
    db.query(query, (err, data) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Internal Server Error", status: "error" });
      if (data.length === 0)
        return res
          .status(404)
          .json({ message: "Channel not found", status: "error" });
      return res.status(200).json({ data, status: "success" });
    });
  });
};

export const getChannelById = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized access", status: "error" });
  }
  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Invalid token", status: "error" });
    }
    const channelId = req.params.channelId;
    const query = "SELECT * FROM channels WHERE id = ?";
    db.query(query, [channelId], (err, data) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Internal Server Error", status: "error" });
      if (data.length === 0)
        return res
          .status(404)
          .json({ message: "Channel not found", status: "error" });
      return res.status(200).json({ data, status: "success" });
    });
  });
};
