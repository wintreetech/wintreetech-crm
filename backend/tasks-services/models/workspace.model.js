import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["New"],
      required: true,
    },
    dueDate: { type: String, required: true },
    priority: { type: String, default: "urgent" },
    tags: { type: [String], default: [] },
    isCompleted: { type: Boolean, default: false },
    assignees: { type: [String], default: [] }, // Array of member usernames/names
    attachments: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const ColumnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // "todo", "inprogress", "completed"
    tasks: { type: [TaskSchema], default: [] },
  },
  { _id: false }
);

const WorkspaceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
    createdOn: { type: String, required: true },
    createdBy: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },
    members: [
      {
        id: { type: String, required: true }, // "u-103"
        username: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true },
        department: { type: String, required: true },
      },
    ],
    columns: {
      type: [ColumnSchema],
      default: [
        { id: "todo", tasks: [] },
        { id: "inprogress", tasks: [] },
        { id: "completed", tasks: [] },
      ],
    },
  },
  { timestamps: true }
);

WorkspaceSchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // Removes the __v field
  transform: (doc, ret) => {
    ret.id = ret._id.toString(); // Map _id to id for frontend compatibility
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("Workspace", WorkspaceSchema);
