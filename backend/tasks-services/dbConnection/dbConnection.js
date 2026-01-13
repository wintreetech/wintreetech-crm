import mongoose from "mongoose";
import { keys } from "../utils/keys.js";

const { mongoUrl } = keys.app;

const dbConnection = async () => {
	try {
		const connect = await mongoose.connect(mongoUrl);
		console.log("mongodb is connect", connect.connection.host);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

export default dbConnection;
