import express from "express";
import expressProxy from "express-http-proxy";
import { keys } from "./utils/keys.js";

const app = express();

app.use("/crm", expressProxy("http://localhost:3901", { limit: "50mb" }));
app.use("/tasks", expressProxy("http://localhost:3902", { limit: "50mb" }));

const { port, app: apigatewayData } = keys;

app.listen(port, () => {
	console.log(`${apigatewayData.name} App is connected to ${port}`);
});
