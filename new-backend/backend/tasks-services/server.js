import express from "express";
import http from "http";
import cors from "cors";

import { keys } from "./utils/keys.js";
import dbConnection from "./dbConnection/dbConnection.js";

import routes from "./routes/index.js";
import { initSocket } from "./socket/index.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/", routes);

const { port, app: tasksData } = keys;

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`${tasksData.name} App is connected to ${port}`);
  dbConnection();
});
