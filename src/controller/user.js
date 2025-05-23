import { db } from "../db/connect.js";

export const getUser = (req, res) => {
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
};
