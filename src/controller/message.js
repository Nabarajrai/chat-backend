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
      console.log("err", err);
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
    const query = `
SELECT *
FROM (
  SELECT
    pm.id,
    pm.senderId,
    pm.receiverId,
    pm.message,
    pm.is_read,
    CONCAT(u.firstName, ' ', u.lastName) AS senderFullName,
    pm.created_at
  FROM private_message pm
  JOIN users u ON pm.senderId = u.userId     
  WHERE (senderId = ? AND receiverId = ?)
     OR (senderId = ? AND receiverId = ?)
  ORDER BY pm.created_at DESC
  LIMIT 10
) AS latest
ORDER BY latest.created_at ASC;

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

    const query = `select 
                     c.id,
                     c.senderId,
                     c.channelId,
                     c.message,
                     c.is_read,
                     concat(u.firstName,' ',u.lastName)as senderFullName,
                     c.created_at 
                     from channel_message c 
                     join users u on c.senderId=u.userId 
                     where c.channelId = ?
                      order by c.created_at desc limit 10
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
