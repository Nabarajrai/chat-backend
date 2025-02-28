import jwt from "jsonwebtoken";
import { db } from "../db/connect.js";
import bcrypt from "bcryptjs";

export const register = (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const findUser = "SELECT * FROM users WHERE email=?";
  db.query(findUser, [email], (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Internal Server Error", status: "error" });

    if (data.length > 0)
      return res.status(409).json({ message: "User already exists!" });

    if (!password)
      return res
        .status(400)
        .json({ message: "Password is required !", status: "error" });

    if (!regex.test(password))
      return res.status(400).json({
        status: "error",
        message:
          "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.",
      });

    //hash password
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const values = [firstName, lastName, email, hashPassword];
    const registerQuery =
      "INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)";
    db.query(registerQuery, values, (err, data) => {
      if (err)
        return res
          .status(500)
          .json({ status: "error", message: "Internal Server Error!" });
      return res.status(201).json({
        status: "success",
        message: "User registered successfully!",
        data: {
          firstName,
          lastName,
          email,
        },
      });
    });
  });
};
