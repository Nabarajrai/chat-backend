import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; // Correct import for 'socket.io'
//routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import channelRouter from "./routes/channel.js";
import { db } from "./db/connect.js";

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

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} `);
  });
  socket.on("join-room", (roomId) => {
    socket.join(`channel-${roomId}`);
    console.log(`User joined room ${roomId}`);
  });

  socket.on(
    "send-message-to-user",
    async ({ senderId, receiverId, message, fullName }) => {
      const finalMessage = {
        data: message,
        id: new Date().toISOString(),
        senderId,
        receiverId,
        fullName,
      };

      console.log("🟡 Received message to send:", finalMessage);

      const room = `user-${receiverId}`;

      io.to(room)
        .timeout(5000)
        .emit("receive-user-message", finalMessage, () => {
          const query =
            "INSERT INTO private_message (senderId, receiverId, fullName, message) VALUES (?, ?, ?, ?)";
          db.query(
            query,
            [senderId, receiverId, fullName, message],
            (err, result) => {
              if (err) {
                console.error("❌ Failed to save message:", err);
                return;
              }
              console.log("✅ Message saved to DB");
            }
          );
        });
    }
  );

  socket.on(
    "send-message-to-channel",
    async ({ senderId, channelId, message, fullName, is_read }) => {
      const finalNotification = {
        data: message,
        id: new Date().toISOString(),
        fullName,
        channelId,
        is_read: false, // Assuming is_read is false by default
        senderId, // Assuming the sender's ID is the socket ID
      };
      console.log("Received notification:", finalNotification);
      io.to(`channel-${channelId}`)
        .timeout(5000)
        .emit("receive-message-to-channel", finalNotification, () => {
          const query =
            "INSERT INTO channel_message (senderId,channelId,fullName,is_read, message) VALUES (?, ?, ?, ?, ?)";
          db.query(
            query,
            [senderId, channelId, fullName, is_read, message],
            (err, result) => {
              if (err) {
                console.error("❌ Failed to save channel message:", err);
                return;
              }
              console.log("✅ Channel message saved to DB");
            }
          );
        });
    }
  );

  socket.on("message", (message) => {
    const finalMessage = {
      data: message,
      id: new Date().toISOString(),
    };
    console.log("Received message:", message);
    io.emit("message", finalMessage);
  });

  socket.on("error", (error) => {
    console.error(`Socket error: ${error}`); // Fixed incorrect variable
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
  socket.on("disconnect", () => {
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
app.use("/api", userRouter);
app.use("/api", channelRouter);

server.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
