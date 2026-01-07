import store from "../store/index.js";
import { setWorkspaceColumns } from "../store/slices/Workspaces.slice.js";
import { socket } from "./index.js";

/**
 * Listens for remote board updates and updates Redux state.
 * @param {string} workspaceSlug - Required to target the correct workspace in state.
 */
export const registerWorkspaceSocket = (workspaceSlug) => {
  if (!workspaceSlug) return;

  socket.off("workspace:board_sync");

  socket.on("workspace:board_sync", ({ columns }) => {
    store.dispatch(
      setWorkspaceColumns({
        workspaceSlug,
        columns: columns || [],
        isRemote: true, // Prevents the middleware from emitting this change back to the server
      })
    );
  });
};

/**
 * Joins a specific workspace room for real-time updates.
 */
export const joinWorkspaceRoom = (workspaceId) => {
  if (!workspaceId) return;
  socket.emit("join:workspace", { workspaceId });
};

/**
 * Leaves the workspace room and cleans up listeners.
 */
export const leaveWorkspaceRoom = (workspaceId) => {
  if (!workspaceId) return;
  socket.emit("leave:workspace", { workspaceId });
  socket.off("workspace:board_sync");
};

/**
 * Sends the current board state to the server to broadcast to other members.
 */
export const saveWorkspaceBoard = ({ workspaceId, columns, user }) => {
  if (!workspaceId || !Array.isArray(columns) || !user?.id) return;
  socket.emit("workspace:save_board", {
    workspaceId,
    columns,
    senderInfo: { id: user.id, name: user.username },
  });
};
