import { db } from "../db/connect.js";
import jwt from "jsonwebtoken";

export const getMessagesByUser = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access",
      status: "error",
    });
  }

  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid token",
        status: "error",
      });
    }

    const { senderId, receiverId } = req.query;
    console.log("Query parameters:", req.query);
    // Basic validation
    if (!senderId || !receiverId) {
      return res.status(400).json({
        message: "senderId and receiverId are required",
        status: "error",
      });
    }
    // SELECT
    //   pm.id,
    //   pm.senderId,
    //   pm.receiverId,
    //   pm.message,
    //   pm.is_read,
    //   CONCAT(u.firstName, ' ', u.lastName) AS senderFullName
    // FROM private_message pm
    // JOIN users u ON pm.senderId = u.userId
    // where senderId = "D5" and receiverId = "D7" or senderId = "D7" and receiverId="D5" ;
    const query = `
    SELECT
      pm.id,
      pm.senderId,
      pm.receiverId,
      pm.message,
      pm.is_read,
      CONCAT(u.firstName, ' ', u.lastName) AS senderFullName
    FROM private_message pm
    JOIN users u ON pm.senderId = u.userId     
    WHERE (senderId = ? AND receiverId = ?) 
         OR (senderId = ? AND receiverId = ?)
    `;

    const values = [senderId, receiverId, receiverId, senderId];

    db.query(query, values, (err, data) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Internal Server Error",
          status: "error",
        });
      }

      if (data.length === 0) {
        return res.status(404).json({
          message: "No messages found",
          status: "error",
        });
      }

      return res.status(200).json({
        data,
        status: "success",
      });
    });
  });
};

export const getMessageByChanneLId = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access",
      status: "error",
    });
  }

  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid token",
        status: "error",
      });
    }

    const { channelId } = req.query;

    // Basic validation
    if (!channelId) {
      return res.status(400).json({
        message: "channelId is required",
        status: "error",
      });
    }

    const query = `
      SELECT * FROM channel_message 
      WHERE channelId = ?
    `;

    db.query(query, [channelId], (err, data) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Internal Server Error",
          status: "error",
        });
      }

      if (data.length === 0) {
        return res.status(404).json({
          message: "No messages found for this channel",
          status: "error",
        });
      }

      return res.status(200).json({
        data,
        status: "success",
      });
    });
  });
};
