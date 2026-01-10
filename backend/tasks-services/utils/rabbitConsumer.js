import amqp from "amqplib";
import UserSync from "../models/UserSync.js";
import Workspace from "../models/workspace.model.js";
import MyTasksBoard from "../models/task.model.js";

const env = process.env.ENV;

export const startUserSyncConsumer = async () => {
  const connection = await amqp.connect(
    env === "prod"
      ? process.env.RABBITMQ_URL_PROD
      : process.env.RABBITMQ_URL_LOCAL
  );
  const channel = await connection.createChannel();
  await channel.assertExchange("user_events", "topic", { durable: true });

  const q = await channel.assertQueue("task_service_sync", { durable: true });
  // Ensure we are bound to listen to "user.#" which includes "user.fullsync"
  await channel.bindQueue(q.queue, "user_events", "user.#");

  console.log("Tasks Service Consumer started. Waiting for sync events...");

  channel.consume(q.queue, async (msg) => {
    if (msg !== null) {
      // Destructure data. Note: userData is used for single events,
      // while allUsers/totalCount comes from FULL_SYNC
      const data = JSON.parse(msg.content.toString());
      const { action, userData, allUsers, totalCount } = data;

      try {
        // --- 1. HANDLE FULL RECONCILE ---
        if (action === "FULL_SYNC") {
          const localCount = await UserSync.countDocuments();

          if (localCount !== totalCount) {
            console.log(
              `Mismatch detected (Tasks: ${localCount}, CRM: ${totalCount}). Syncing...`
            );

            // Clear current collection to maintain SSOT integrity
            await UserSync.deleteMany({});

            // Batch insert the new reference data
            if (allUsers && allUsers.length > 0) {
              await UserSync.insertMany(allUsers);
            }
            console.log("✅ Full reconciliation complete.");
          } else {
            console.log("✅ Data length matches. No reconciliation needed.");
          }
        }

        // --- 2. HANDLE INCREMENTAL UPDATES ---
        else if (action === "CREATE" || action === "UPDATE") {
          await UserSync.findOneAndUpdate(
            { crmUserId: userData.crmUserId },
            userData,
            { upsert: true, new: true }
          );
          console.log(`[${action}] Applied for user: ${userData.username}`);
        }

        // --- 3. HANDLE DELETIONS ---
        else if (action === "DELETE") {
          // Note: In your CRM delete controller, ensure you pass { crmUserId: id }
          // inside the userData object in the message

          const userIdToDelete = userData.crmUserId;
          await UserSync.deleteOne({ crmUserId: userIdToDelete });

          // Remove user from all Workspace members
          await Workspace.updateMany(
            {},
            { $pull: { members: { id: userIdToDelete } } }
          );

          // Delete the user's personal task board
          await MyTasksBoard.deleteMany({ "user.id": userIdToDelete });

          console.log(
            `[DELETE] Removed user with ID: ${userIdToDelete} from UserSync, Workspaces, and Personal Boards.`
          );
        }

        channel.ack(msg);
      } catch (error) {
        console.error("Error processing RabbitMQ message:", error);
        // Do not ack if there is a DB error so the message stays in queue
      }
    }
  });
};
