import amqp from "amqplib";
import Auth from "../models/auth.model.js";

const env = process.env.ENV;

let channel;
export const initRabbitMQ = async () => {
  const connection = await amqp.connect(
    env === "prod"
      ? process.env.RABBITMQ_URL_PROD
      : process.env.RABBITMQ_URL_LOCAL,
  );
  channel = await connection.createChannel();
  await channel.assertExchange("user_events", "topic", { durable: true });
};

// Function to publish the entire DB only once
export const publishAllUsers = async () => {
  if (!channel) return;

  const users = await Auth.find({});
  const data = {
    action: "FULL_SYNC",
    totalCount: users.length,
    allUsers: users.map((user) => ({
      crmUserId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
    })),
  };

  channel.publish(
    "user_events",
    "user.fullsync",
    Buffer.from(JSON.stringify(data)),
    { persistent: true },
  );

  console.log(`CRM Published ${users.length} users for initial sync.`);
};

// Function to call whenever a user is Created or Updated
export const publishUserSync = (user, actionType) => {
  if (!channel) return;

  const data = {
    action: actionType,
    userData: {
      crmUserId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  };

  channel.publish(
    "user_events",
    `user.${actionType.toLowerCase()}`,
    Buffer.from(JSON.stringify(data)),
  );
};
