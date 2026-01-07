export const EVENTS = {
  MYTASKS: {
    JOIN: "join:mytasks",
    LEAVE: "leave:mytasks",

    SAVE_BOARD: "mytasks:save_board",
    DELETE_TASK: "mytasks:delete_task",
    UPDATE_TASK: "mytasks:update_task",

    BOARD_SYNC: "mytasks:board_sync",
  },

  WORKSPACE: {
    JOIN: "join:workspace",
    LEAVE: "leave:workspace",
    SAVE_BOARD: "workspace:save_board",
    UPDATE_TASK: "workspace:update_task",
    DELETE_TASK: "workspace:delete_task",
    BOARD_SYNC: "workspace:board_sync",
  },

  NOTIFICATION: {
    JOIN: "join:notifications",
    RECEIVED: "notification:received",
    MARK_READ: "notification:mark_read",
    SYNC_READ: "notification:sync_read",
  },
};
