import {
  X,
  CalendarDays,
  Clock,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { downloadWorkspaceDocs } from "../../../store/slices/Workspaces.slice";
import { useState } from "react";

const TaskDetailsModal = ({ open, task, onClose }) => {
  if (!open || !task) return null;

  const dispatch = useDispatch();

  const [downloadingId, setDownloadingId] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (file) => {
    setDownloadingId(file.key);
    try {
      await dispatch(
        downloadWorkspaceDocs({
          fileUrl: file.url,
          fileName: file.name,
        })
      ).unwrap();
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl overflow-visible">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {task.title}
          </h2>

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full cursor-pointer dark:hover:bg-gray-700"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Description */}
          <div className="overflow-hidden whitespace-normal">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed break-words">
              {task.description || "No description added."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {task.columnTitle || task.status || "Todo"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Due Date
              </h3>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {task.dueDate || "—"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Time Remaining
              </h3>
              <div
                className={`flex items-center gap-2 ${
                  task.finalStatusColor || "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Clock className="w-4 h-4" />
                <p className="font-medium">{task.dueLabel}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Assigned Team
            </h3>

            <div className="flex flex-wrap gap-2">
              {task.assignees?.length ? (
                task.assignees.map((name, i) => (
                  <div
                    key={i}
                    className="px-3 py-1 rounded-full bg-primary dark:bg-base-300 
                   text-sm font-medium text-white 
                   border border-base-300"
                  >
                    {name}
                  </div>
                ))
              ) : (
                <p
                  className="px-3 py-1 rounded-full bg-primary dark:bg-base-300 
                   text-sm font-medium text-white 
                   border border-base-300"
                >
                  Self
                </p>
              )}
            </div>
          </div>

          {/* Completed indicator */}
          {task.isCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}

          {/* Attachments (unchanged) */}
          {task?.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Attachments
              </h3>

              <div className="space-y-3">
                {task.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon OR image preview */}
                      <div className="flex items-center justify-center size-10 bg-primary/10 dark:bg-primary/20 rounded-lg overflow-hidden">
                        <FileText className="w-5 h-5 text-primary dark:text-primary-300" />
                      </div>

                      {/* File name + size */}
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    {/* Download button */}
                    <button
                      onClick={() =>
                        downloadingId !== file.key && handleDownload(file)
                      }
                      disabled={downloadingId === file.key}
                      className={`p-2 rounded-md transition-colors ${
                        downloadingId === file.key
                          ? "bg-primary/10 dark:bg-primary/20 cursor-wait"
                          : "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                      }`}
                    >
                      {downloadingId === file.key ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <Download className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* backdrop click close */}
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};

export default TaskDetailsModal;
