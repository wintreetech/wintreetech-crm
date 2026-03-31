import { sendEmail } from "./utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();
sendEmail(
	"yourpersonalemail@gmail.com",
	"Test Email",
	"<h2>Email working successfully 🚀</h2>",
);
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
