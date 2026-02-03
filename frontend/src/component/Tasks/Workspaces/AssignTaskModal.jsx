import { ChevronDown, Paperclip, X } from "lucide-react";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";

const AssignTaskModal = ({
  open,
  onClose,
  members = [],
  onAssign,
  initialData = null,
  isSubmitting,
}) => {
  const isEdit = !!initialData;

  const isBusy = isSubmitting || false;

  const [priority, setPriority] = useState("urgent");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [assignError, setAssignError] = useState("");

  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // ✅ controlled inputs for prefilling on edit
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);

  const priorities = useMemo(
    () => [
      { value: "urgent", label: "Urgent", className: "text-red-900" },
      { value: "high", label: "High", className: "text-red-600" },
      { value: "medium", label: "Medium", className: "text-orange-600" },
      { value: "low", label: "Low", className: "text-green-600" },
    ],
    [],
  );

  const filteredMembers = useMemo(() => {
    const q = assignSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      (m.username || m.name || "").toLowerCase().includes(q),
    );
  }, [members, assignSearch]);

  const toggleMember = (name) => {
    setSelectedMembers((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...new Set([...prev, name])],
    );
    setAssignError("");
  };

  const removeSelected = (name) => {
    setSelectedMembers((prev) => prev.filter((n) => n !== name));
  };

  const addFiles = useCallback((files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setAttachments((prev) => [...prev, ...arr]);
  }, []);

  const handleFilesPicked = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  // ✅ PREFILL WHEN EDITING
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTaskName(initialData.title || initialData.taskName || "");
      setDescription(initialData.description || "");
      setDueDate(initialData.dueDate || "");

      setPriority(initialData.priority || "urgent");

      // assignees can be strings or objects — normalize to display names
      const initialAssignees = (
        initialData.assignees ||
        initialData.assignedTo ||
        []
      )
        .map((a) => (typeof a === "string" ? a : a?.username || a?.name || ""))
        .filter(Boolean);

      setSelectedMembers(initialAssignees);

      // attachments may be serialized objects or Files
      setAttachments(initialData.attachments || []);
      setShowAttachments((initialData.attachments || []).length > 0);
    } else {
      // reset to add mode defaults
      setTaskName("");
      setDescription("");
      setDueDate("");
      setPriority("urgent");
      setSelectedMembers([]);
      setAttachments([]);
      setShowAttachments(false);
    }

    setAssignSearch("");
    setAssignOpen(false);
    setIsDragging(false);
    setAssignError("");
  }, [open, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onAssign || isBusy) return;

    if (selectedMembers.length === 0) {
      setAssignError("Please select at least one member.");
      return;
    }

    if (!dueDate || dueDate < todayStr) return;

    onAssign({
      taskId: initialData?.id || null, // ✅ send id when editing
      taskName: taskName.trim(),
      description: description.trim(),
      assignees: selectedMembers,
      dueDate,
      priority,
      attachments,
      isEdit, // ✅ optional flag for parent
    });

    // reset after add (not after edit unless you want to)
    // e.currentTarget.reset();
    // setAssignSearch("");
    // setSelectedMembers([]);
    // setPriority("urgent");
    // setAssignOpen(false);
    // setShowAttachments(false);
    // setAttachments([]);
    // setIsDragging(false);
    // setAssignError("");
  };

  const handleClose = () => {
    setAssignSearch("");
    setSelectedMembers([]);
    setPriority("urgent");
    setAssignOpen(false);
    setShowAttachments(false);
    setAttachments([]);
    setIsDragging(false);
    setAssignError("");
    onClose?.();
  };

  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setAssignOpen(false);
        setAssignSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div
        className="modal-box w-full max-w-xl overflow-y-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {isEdit ? "Edit Task" : "Assign a New Task"}
          </h3>

          <button
            type="button"
            title="Add Attachment"
            onClick={() => setShowAttachments((v) => !v)}
            className={`cursor-pointer p-2 rounded-lg transition ${
              showAttachments
                ? "text-gray-500 bg-gray-200"
                : "text-gray-400 hover:bg-gray-200 hover:text-gray-500"
            }`}
          >
            <Paperclip className="-rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {showAttachments && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Add Attachments (optional)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFilesPicked}
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition
                  ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 dark:border-gray-600 bg-base-100"
                  }`}
              >
                <p className="text-sm font-medium">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You can add multiple files.
                </p>
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, i) => (
                    <div
                      key={`${file.name || file?.url || "file"}-${i}`}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-base-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[260px]">
                          {file.name || file.filename || "Attachment"}
                        </span>
                        {file.size && (
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>

                      {(!isEdit || file instanceof File) && (
                        <button
                          type="button"
                          onClick={() => removeAttachment(i)}
                          className="p-2 hover:bg-gray-200 rounded-md cursor-pointer dark:hover:bg-gray-700"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-control w-full">
            <label className="label" htmlFor="task-name">
              <span className="label-text">Task Name</span>
            </label>
            <input
              id="task-name"
              name="taskName"
              type="text"
              required
              placeholder="Enter a descriptive task name..."
              className="input input-bordered w-full"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          <div className="form-control w-full">
            <label className="label" htmlFor="description">
              <span className="label-text">Description (optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Add a short description..."
              className="textarea textarea-bordered w-full min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {selectedMembers.length > 0 && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Selected Members</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((name) => (
                  <div
                    key={name}
                    className="badge badge-primary badge-outline gap-1 py-3 px-3"
                  >
                    <span className="truncate max-w-[140px]">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeSelected(name)}
                      className="ml-1 hover:text-red-500 cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full relative" ref={wrapperRef}>
              <label className="label" htmlFor="assign-to">
                <span className="label-text">Assign To</span>
              </label>

              <div
                id="assign-to"
                className="input input-bordered w-full flex items-center justify-between cursor-pointer"
                onClick={() => setAssignOpen((v) => !v)}
              >
                <span
                  className={
                    selectedMembers.length ? "text-base" : "text-gray-400"
                  }
                >
                  {selectedMembers.length
                    ? `${selectedMembers.length} member(s) selected`
                    : "Select member(s)"}
                </span>

                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    assignOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {assignError && (
                <p className="mt-1 text-xs text-red-500">{assignError}</p>
              )}

              {assignOpen && (
                <div className="absolute bottom-full mb-1 w-full bg-base-100 border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto p-1">
                  <input
                    className="input input-ghost input-sm w-full mb-2"
                    placeholder="Search members..."
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                    autoFocus
                  />

                  {filteredMembers.length === 0 ? (
                    <p className="p-3 text-center text-gray-400 text-sm">
                      No matches
                    </p>
                  ) : (
                    filteredMembers.map((m) => {
                      const displayName = m.username || m.name;
                      const checked = selectedMembers.includes(displayName);

                      return (
                        <div
                          key={m._id || m.email || displayName}
                          onClick={() => toggleMember(displayName)}
                          className={`flex items-center justify-between px-3 py-2 mb-1 text-sm cursor-pointer rounded-lg hover:bg-primary/10 transition ${
                            checked ? "bg-primary/20" : ""
                          }`}
                        >
                          <span>{displayName}</span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={checked}
                            readOnly
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label" htmlFor="due-date">
                <span className="label-text">Due Date</span>
              </label>
              <input
                id="due-date"
                name="dueDate"
                type="date"
                required
                min={todayStr}
                className="input input-bordered w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

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

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isBusy}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isBusy}>
              {isBusy ? (
                <>
                  <span className="loading loading-spinner"></span>
                  {isEdit ? "Updating" : "Assigning"}
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Assign"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskModal;
