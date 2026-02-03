import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AddTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask = null,
  submitLabel = "Add Task",
}) => {
  const todayISO = new Date().toISOString().split("T")[0];

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayISO);
  const [priority, setPriority] = useState("urgent");

  const priorities = useMemo(
    () => [
      { value: "urgent", label: "Urgent" },
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
    [],
  );

  // Sync state with initialTask for editing
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTask?.title || "");
      setDescription(initialTask?.description || "");
      setDueDate(initialTask?.dueDate || todayISO);
      setPriority(initialTask?.priority || "urgent");
    }
  }, [isOpen, initialTask, todayISO]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (dueDate < todayISO) {
      toast.error("Due date cannot be in the past");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      status: initialTask?.status || "todo",
      tags: initialTask?.tags || ["New"],
      isCompleted: initialTask?.isCompleted || false,
      assignees: initialTask?.assignees || [],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div
        className="modal-box w-full max-w-lg p-0 bg-white dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {initialTask ? "Update Task" : "Add New Task"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-control">
            <label className="label font-medium text-gray-700 dark:text-gray-300">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Finalize Q4 report"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the task details..."
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label font-medium text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                required
                min={todayISO}
                className="input input-bordered w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
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
          </div>

          {/* Actions */}
          <div className="modal-action pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-8">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
