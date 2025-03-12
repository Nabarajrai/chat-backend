import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
//routers
import authRouter from "./routes/auth.js";
const app = express();
const PORT = "8080";

app.get("/", (req, res) => {
  return res.send("hello world");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//routes
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
