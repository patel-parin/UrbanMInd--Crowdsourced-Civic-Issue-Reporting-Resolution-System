// backend/src/server.js
import http from "http";
import app from "./app.js";
import { initNotificationSocket } from "./sockets/notifications.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// initialize websockets
initNotificationSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
