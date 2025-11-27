import { Server } from "socket.io";

let io;

export const initNotificationSocket = (server) => {
  io = new Server(server, {
    cors: "*",
  });

  io.on("connection", (socket) => {
    console.log("🔔 User connected:", socket.id);
  });
};

export const notifyUser = (userId, message) => {
  io.emit(userId, message);
};
