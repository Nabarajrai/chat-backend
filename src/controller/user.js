import { db } from "../db/connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
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
    const query = "SELECT * FROM users";
    db.query(query, (err, data) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Internal Server Error", status: "error" });
      if (data.length === 0)
        return res
          .status(404)
          .json({ message: "User not found", status: "error" });
      return res.status(200).json({ data, status: "success" });
    });
  });
};

export const getUserById = (req, res) => {
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
    const userId = req.params.id;
    const query = "SELECT * FROM users WHERE userId = ?";
    db.query(query, [userId], (err, data) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Internal Server Error", status: "error" });
      if (data.length === 0)
        return res
          .status(404)
          .json({ message: "User not found", status: "error" });
      const { password, ...user } = data[0];
      return res.status(200).json({ data: user, status: "success" });
    });
  });
};
