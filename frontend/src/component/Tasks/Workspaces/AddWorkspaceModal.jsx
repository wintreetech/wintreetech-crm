import { useState } from "react";
import { Info, Loader2 } from "lucide-react";

const AddWorkspaceModal = ({ open, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    const payload = {
      title: formData.get("workspaceTitle")?.toString().trim(),
      description: formData.get("workspaceDescription")?.toString().trim(),
    };

    if (!payload.title) return;

    try {
      setLoading(true);

      // ✅ send to parent (redux dispatch there)
      await onSubmit?.(payload);

      formEl.reset();
      handleClose();
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open" onClick={handleClose}>
      <div
        className="modal-box w-full max-w-lg p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">
              Create a Workspace
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control w-full">
              <label className="label" htmlFor="workspace-title">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                id="workspace-title"
                name="workspaceTitle"
                type="text"
                required
                placeholder="e.g., Q4 Marketing Campaign"
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>

            <div className="form-control w-full">
              <label className="label" htmlFor="workspace-description">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                id="workspace-description"
                name="workspaceDescription"
                rows={4}
                placeholder="Add a brief description of what this workspace is for..."
                className="textarea textarea-bordered w-full"
                disabled={loading}
              />
            </div>

            <div className="flex items-start gap-2 bg-base-200 p-3 rounded-lg">
              <Info className="mt-0.5" size={18} />
              <span className="text-sm text-base-content/70">
                To add members to this workspace, please visit the{" "}
                <b>"Team Members"</b> section.
              </span>
            </div>

            <div className="flex justify-end items-center gap-3 pt-6 border-t border-base-300">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Creating...
                  </span>
                ) : (
                  "Create Workspace"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWorkspaceModal;
