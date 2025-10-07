import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnection from "./dbConnection/dbConnection.js";
import { keys } from "./utils/keys.js";
import routes from "./routes/index.js";

dotenv.config();
const app = express();

const allowedOrigins = [
	"http://localhost:5173", // your frontend dev URL
	"https://wintreetech-crm-frontend.onrender.com/", // production frontend URL
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
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true, // allow cookies
	})
);
app.use(cookieParser());
app.use(routes);

const { port } = keys;
app.listen(port, () => {
	console.log(`App is connected to ${port}`);
	dbConnection();
});
