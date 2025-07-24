import { db } from "../db/connect.js";

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("join-user", (userId) => {
      socket.join(`user-${userId}`);
      const query = `
    SELECT
      pm.id,
      pm.senderId,
      pm.receiverId,
      pm.message,
      pm.is_read,
      CONCAT(u.firstName, ' ', u.lastName) AS senderFullName
    FROM private_message pm
    JOIN users u ON pm.senderId = u.userId where receiverId = ? and is_read = false`;
      db.query(query, [userId], (err, data) => {
        if (err) {
          console.error("Error fetching user data:", err);
          return;
        }
        console.log(`Fetched messages for user ${userId}:`, data);
        if (data.length > 0) {
          data.forEach((message) => {
            io.to(`user-${userId}`)
              .timeout(5000)
              .emit("receive-user-message", message);
          });
        }
        const userIds = data.map((message) => message.id);
        console.log(`User IDs to update: ${userIds}`);
        const placeholders = userIds.map(() => "?").join(",");
        const updateQuery = `UPDATE private_message SET is_read = true WHERE id IN (${placeholders})`;
        if (userIds.length === 0) {
          console.log(`No messages to update for user ${userId}`);
          return;
        }
        db.query(updateQuery, userIds, (err) => {
          if (err) {
            console.error("Error updating message status:", err);
            console.log(`Updated messages for user ${userId} to read status.`);
          }
        });
      });
      console.log(`User ${userId} `);
    });
    socket.on("join-room", (roomId) => {
      socket.join(`channel-${roomId}`);
      // select;
      // c.id,
      // c.senderId,
      // c.channelId,
      // c.message,
      // c.is_read,
      // concat(u.firstName,' ',u.lastName)as senderFullName,
      // c.created_at
      // from channel_message c
      // join users u on c.senderId=u.userId
      // where channelId="C3";

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
                     where c.channelId = ?`;

      db.query(query, [roomId], (err, data) => {
        if (err) {
          console.error("Error fetching channel messages:", err);
          return;
        }
        if (data.length > 0) {
          data.forEach((message) => {
            io.to(`channel-${roomId}`)
              .timeout(5000)
              .emit("receive-message-to-channel", message);
          });
        }
        console.log(`Fetched messages for channel ${roomId}:`, data);
        const messageIds = data.map((msg) => msg.id); // trusted, validated input
        const placeholders = messageIds.map(() => "?").join(",");
        const sql = `UPDATE channel_message SET is_read = true WHERE id IN (${placeholders})`;

        db.query(sql, messageIds, (err, result) => {
          if (err) {
            console.error("Error updating channel message status:", err);
            return;
          }
          console.log("Updated successfully");
        });
        console.log(`Fetched messages for channel ${roomId}:`, data);
      });
    });

    socket.on(
      "send-message-to-user",
      async ({
        senderId,
        receiverId,
        message,
        senderFullName,
        is_read = false,
      }) => {
        const finalMessage = {
          message: message,
          id: new Date().toISOString(),
          senderId,
          receiverId,
          senderFullName,
          is_read,
        };

        console.log("🟡 Received message to send:", finalMessage);

        const room = `user-${receiverId}`;
        const clients = io.sockets.adapter.rooms.get(room);
        const userOnline = clients && clients.size > 0;
        if (userOnline) {
          finalMessage.is_read = true; // If user is online, mark as read
        }
        const query =
          "INSERT INTO private_message (senderId, receiverId, message,is_read) VALUES (?, ?, ?, ?)";
        const values = [senderId, receiverId, message, is_read];

        db.query(query, values, (err) => {
          if (err) {
            console.error("❌ Failed to save message:", err);
            return;
          }
          console.log(
            "✅ Message saved to DB (delivered:",
            finalMessage.isDelivered,
            ")"
          );
          if (userOnline) {
            io.to(room)
              .timeout(5000)
              .emit("receive-user-message", finalMessage);
          } else {
            console.log(
              "User is offline, message will be delivered when they come online."
            );
          }
        });
      }
    );

    socket.on(
      "send-message-to-channel",
      async ({ senderId, channelId, message, fullName, is_read }) => {
        const finalNotification = {
          message: message,
          id: new Date().toISOString(),
          fullName,
          channelId,
          is_read: false, // Assuming is_read is false by default
          senderId, // Assuming the sender's ID is the socket ID
        };
        const clients = io.socket.adapter.room(`channel-${channelId}`);
        const userOnlineOnChannel = clients && clients.size > 0;
        const query =
          "INSERT INTO channel_message (senderId,channelId,fullName,is_read, message) VALUES (?, ?, ?, ?, ?)";
        if (userOnlineOnChannel) {
          finalNotification.is_read = true; // If user is online, mark as read
        }
        const values = [senderId, channelId, fullName, is_read, message];
        db.query(query, values, (err) => {
          if (err) {
            console.error("❌ Failed to save channel message:", err);
            return;
          }
          console.log(
            "✅ Channel message saved to DB (delivered:",
            finalNotification.isDelivered,
            ")"
          );
          if (userOnlineOnChannel) {
            io.to(`channel-${channelId}`)
              .timeout(5000)
              .emit("receive-message-to-channel", finalNotification);
          } else {
            console.log(
              "User is offline, message will be delivered when they come online."
            );
          }
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
};
