import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import { keys } from "./utils/keys.js";
import dbConnection from "./dbConnection/dbConnection.js";

import routes from "./routes/index.js";
import { initSocket } from "./socket/index.js";
import { startUserSyncConsumer } from "./utils/rabbitConsumer.js";

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://crm.wintreetech.com",
  "http://crm.wintreetech.com",
];

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin like Postman or mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, // allow cookies
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

app.use("/", routes);

const { port, app: tasksData } = keys;

const server = http.createServer(app);
initSocket(server);

server.listen(port, async () => {
  console.log(`${tasksData.name} App is connected to ${port}`);
  dbConnection();

  // Start listening for deletions/updates from CRM
  try {
    startUserSyncConsumer();
    console.log("RabbitMQ Consumer is ready.");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
  }
});
