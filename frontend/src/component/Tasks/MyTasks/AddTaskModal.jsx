import { useMemo, useState } from "react";

const AddTaskModal = ({ isOpen, onClose, onSubmit, members = [] }) => {
  if (!isOpen) return null;

  const statusOptions = useMemo(
    () => [
      { value: "todo", label: "Todo" },
      { value: "pending", label: "Pending" },
    ],
    []
  );

  // ✅ ADDED: priority state + options (nothing removed)
  const [priority, setPriority] = useState("urgent");

  const priorities = useMemo(
    () => [
      { value: "urgent", label: "Urgent" },
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
    []
  );

  // ✅ ADDED: today's date for min + validation
  const todayISO = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    const status = "todo";

    const formData = new FormData(e.currentTarget);

    const title = formData.get("title")?.toString().trim();
    const dueDate = formData.get("dueDate");

    if (!title || !dueDate) {
      console.error("There are some fields missing");
      return;
    }

    // ✅ ADDED: manual validation for past date
    if (dueDate < todayISO) {
      console.error("Due date cannot be in the past.");
      return;
    }

    onSubmit({
      title,
      description: formData.get("description")?.toString().trim(),
      status,
      dueDate,
      priority,
      tags: ["New"],
      isCompleted: false,
    });

    e.currentTarget.reset();
    setPriority("urgent");
    onClose?.();
  };

  return (
    <div className="modal modal-open" onClick={onClose}>
      <div
        className="modal-box w-full max-w-lg p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-300">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Add New Task
          </h2>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="form-control w-full">
            <label className="label" htmlFor="task-title">
              <span className="label-text font-medium flex items-center gap-2">
                Task Title
              </span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              required
              placeholder="e.g., Finalize Q4 budget report"
              className="input input-bordered w-full"
            />
          </div>

          {/* Description */}
          <div className="form-control w-full">
            <label className="label" htmlFor="task-description">
              <span className="label-text font-medium flex items-center gap-2">
                Description
              </span>
            </label>
            <textarea
              id="task-description"
              name="description"
              rows={5}
              placeholder="Provide a brief description of the task..."
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Status + Due Date */}
          <div>
            <div className="form-control w-full">
              <label className="label" htmlFor="task-due-date">
                <span className="label-text font-medium flex items-center gap-2">
                  Due Date
                </span>
              </label>
              <input
                id="task-due-date"
                name="dueDate"
                type="date"
                required
                min={todayISO} // ✅ ADDED: blocks past dates in picker
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* ✅ ADDED: Priority field from your layout */}
          <div className="form-control w-full">
            <label className="label" htmlFor="priority">
              <span className="label-text">Priority</span>
            </label>

            <select
              id="priority"
              name="priority"
              className="select select-bordered w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="modal-action mt-2 pt-4 border-t border-base-300">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn btn-primary gap-2">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
