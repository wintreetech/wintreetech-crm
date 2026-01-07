import express from "express";
import expressProxy from "express-http-proxy";
import { keys } from "./utils/keys.js";

const env = process.env.ENV;

const prodUrl = process.env.CLIENT_URL_PROD;

const app = express();

app.use("/crm", expressProxy("http://localhost:3901"));
app.use("/tasks", expressProxy("http://localhost:3902"));

const { port, app: apigatewayData } = keys;

app.listen(port, () => {
  console.log(`${apigatewayData.name} App is connected to ${port}`);
});
