import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; // Correct import for 'socket.io'
//routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import channelRouter from "./routes/channel.js";
import messageRouter from "./routes/message.js";
import { setupSocket } from "./config/socket.js";

const app = express();
const PORT = "8080";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from your frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocket(io);
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
app.use("/api", userRouter);
app.use("/api", channelRouter);
app.use("/api", messageRouter);
server.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
