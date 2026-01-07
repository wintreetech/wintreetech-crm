import MyTasksBoard from "../models/task.model.js";

// GET /tasks/mytasks?userId=1&username=demo
export const getMyTasksBoard = async (req, res) => {
  const { userId, username } = req.query;

  if (!userId) return res.status(400).json({ message: "userId required" });

  const board = await MyTasksBoard.findOne({ "user.id": userId }).lean();

  // if exists return columns
  if (board) {
    return res.json({ user: board.user, columns: board.columns });
  }

  // else return empty
  return res.json({
    user: { id: userId, username: username || "" },
    columns: [],
  });
};

// POST /tasks/mytasks
export const createMyTaskBoard = async (req, res) => {
  const { user, columns } = req.body;

  if (!user?.id || !user?.username) {
    return res.status(400).json({ message: "users id and username required" });
  }

  const incomingCols = Array.isArray(columns) ? columns : [];

  const existing = await MyTasksBoard.findOne({ "user.id": user.id });
  if (existing) {
    const existingCols = Array.isArray(existing.columns)
      ? existing.columns
      : [];

    if (existingCols.length === 0 && incomingCols.length > 0) {
      existing.columns = incomingCols;
      await existing.save();
    }

    return res.json({
      user: existing.user,
      columns: existing.columns || [],
      message: "Space exists",
    });
  }

  const board = await MyTasksBoard.create({
    user,
    columns: incomingCols,
  });

  return res.status(201).json({
    user: board.user,
    columns: board.columns,
    message: "Space created successfully",
  });
};
