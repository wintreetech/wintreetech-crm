import express from "express";
import { keys } from "./utils/keys.js";
import dbConnection from "./dbConnection/dbConnection.js";

const app = express();

app.use(express.json());

// app.use("/tasks", )

const { port, app: tasksData } = keys;

app.listen(port, () => {
	console.log(`${tasksData.name} App is connected to ${port}`);
	dbConnection();
});
