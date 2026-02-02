import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      // enum: ["New"],
      required: true,
    },
    dueDate: { type: String, default: null, required: true },
    priority: { type: String, default: "urgent", required: true },
    tags: { type: [String], default: [], required: true },
    isCompleted: { type: Boolean, default: false, required: true },
    assignees: { type: [String], default: [] },
    attachments: { type: [String], default: [] },
  },
  { _id: false },
);

const ColumnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    tasks: { type: [TaskSchema], default: [] },
  },
  { _id: false },
);

const MyTasksBoardSchema = new mongoose.Schema(
  {
    user: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },
    columns: {
      type: [ColumnSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// one board per user
MyTasksBoardSchema.index({ "user.id": 1 }, { unique: true });

export default mongoose.model("MyTasksBoard", MyTasksBoardSchema);
