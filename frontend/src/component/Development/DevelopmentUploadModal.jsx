import { CloudUpload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/Auth.slice.js";
import { selectDevelopmentDocumentsBucket } from "../../store/slices/Development.slice.js";
import { uploadDevelopmentDocuments } from "../../store/thunks/Development.thunks.js";

function DevelopmentUploadModal({ title, isOpen, onClose, record }) {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const MAX_FILES = 10;

  const currentUser = useSelector(selectCurrentUser);

  const bucket = useSelector((state) =>
    selectDevelopmentDocumentsBucket(state, {
      developmentId: record?._id ?? "",
      sectionName: title ?? "",
    })
  );

  const loading = bucket?.loading ?? false;

  const setSelectedFiles = (selectedFiles) => {
    if (!selectedFiles.length) return;

    if (selectedFiles.length > MAX_FILES) {
      toast.error(`You can upload a maximum of ${MAX_FILES} files at once.`);
      return;
    }

    setFiles(selectedFiles);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setSelectedFiles(selectedFiles);
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

    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    setSelectedFiles(droppedFiles);
  };

  const handleUpload = async () => {
    if (!files?.length || loading) return;

    try {
      const { message } = await dispatch(
        uploadDevelopmentDocuments({
          files,
          developmentId: record._id,
          companyName: record.companyName,
          sectionName: title,
          uploadedBy: currentUser.username,
        })
      ).unwrap();

      toast.success(message || "File(s) uploaded successfully!");
      setFiles([]);
      onClose?.();
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "File upload failed. Try again."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-full bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl relative p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Files for {title}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select file(s) from your device to attach to this development section.
        </p>

        <label
          htmlFor={`development-file-upload-${title}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col w-full border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
              : files.length
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40"
          }`}
        >
          <div className="flex flex-col items-center justify-center p-4 text-gray-500 dark:text-gray-400">
            <CloudUpload className="w-10 h-10 mb-2 text-blue-500" />

            {files.length ? (
              <div className="w-full mt-2 max-h-28 overflow-y-auto rounded-md border border-green-200 bg-white dark:bg-gray-800 p-2">
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="truncate px-2 py-1 rounded bg-green-50 dark:bg-gray-700"
                      title={file.name}
                    >
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <p className="mb-1 text-sm text-center">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  PDF, DOCX, XLSX, PNG, JPG or ZIP files up to 100MB each
                </p>
              </>
            )}
          </div>

          <input
            id={`development-file-upload-${title}`}
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
        </label>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            disabled={!files.length || loading}
            onClick={handleUpload}
            className={`btn btn-primary ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DevelopmentUploadModal;
