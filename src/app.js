import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; // Correct import for 'socket.io'
//routers
import authRouter from "./routes/auth.js";

const app = express();
const PORT = "8080";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("message", (message) => {
    console.log(`Received message: ${JSON.stringify(message)}`);
    socket.send({
      reply: "Hello, you sent",
      message,
    });
  });
  socket.on("error", (error) => {
    console.error(`Socket error: ${message}`);
  });
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

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

server.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
