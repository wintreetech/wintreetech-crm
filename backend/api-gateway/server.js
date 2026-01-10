import express from "express";
import http from "http";
import httpProxy from "http-proxy";
import expressProxy from "express-http-proxy";
import cors from "cors";
import { keys } from "./utils/keys.js";

const env = process.env.ENV;

const prodUrl = process.env.CLIENT_URL_PROD;

const app = express();
const server = http.createServer(app);

const { port, app: apigatewayData } = keys;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://crm.wintreetech.com",
  "http://crm.wintreetech.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow no-origin (postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// VERY IMPORTANT: respond to preflight before proxying
app.options(/.*/, cors());

app.use("/crm", expressProxy("http://localhost:3901"));
app.use("/tasks", expressProxy("http://localhost:3902"));

// WebSocket proxy
const wsProxy = httpProxy.createProxyServer({
  target: "http://localhost:3902",
  ws: true,
  changeOrigin: true,
  secure: false,
});

// IMPORTANT: socket.io uses /socket.io by default
server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/socket.io")) {
    wsProxy.ws(req, socket, head, (err) => {
      if (err) {
        console.error("WS upgrade error:", err.message);
        socket.destroy();
      }
    });
  }
});

// Prevent ECONNRESET crashes
wsProxy.on("error", (err, req, socket) => {
  console.log("WS Proxy Error:", err.message);
  if (socket) socket.destroy();
});

server.listen(port, () => {
  console.log(`${apigatewayData.name} App is connected to ${port}`);
});
