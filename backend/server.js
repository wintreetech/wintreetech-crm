import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnection from "./dbConnection/dbConnection.js";
import { keys } from "./utils/keys.js";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://crm.wintreetech.com",
  "http://crm.wintreetech.com",
];

// Applicattion Level Middleware
app.use(express.json());

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
app.use(cookieParser());

app.use(routes);

// Serve uploaded files
app.use("/merchant", express.static(path.join(__dirname, "merchant")));

// Optional: default fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const { port } = keys;
app.listen(port, () => {
  console.log(`App is connected to ${port}`);
  dbConnection();
});
