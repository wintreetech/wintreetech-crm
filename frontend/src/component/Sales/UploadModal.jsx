import { CloudUpload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { selectDocumentsBucket } from "../../store/slices/Sales.slice";
import { uploadDocuments } from "../../store/thunks/sales.thunks";
import { selectCurrentUser } from "../../store/slices/Auth.slice";

function UploadModal({
  title,
  isUploadOpen,
  onUploadClose,
  lead,
  onFirstUpload,
}) {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);

  const currentUser = useSelector(selectCurrentUser);

  // Use bucket-level loading from Redux (same key the docs view uses)
  const bucket = useSelector((state) =>
    selectDocumentsBucket(state, {
      companyName: lead?.companyName ?? "",
      subStatus: title ?? "",
    })
  );

  const loading = bucket?.loading ?? false;

  const handleFileChange = (e) => {
    if (e.target.files) setFiles(Array.from(e.target.files)); // Accept multiple files
  };

  const handleUpload = async () => {
    if (!files.length || loading) return;

    try {
      const { isFirstUpload, message } = await dispatch(
        uploadDocuments({
          files,
          companyName: lead.companyName,
          subStatus: title,
          leadId: lead._id,
          uploadedBy: currentUser.username,
        })
      ).unwrap();

      toast.success(message || "File(s) uploaded successfully!");
      if (isFirstUpload && onFirstUpload) onFirstUpload(title);

      setFiles([]);
      onUploadClose();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err || "File upload failed. Try again.");
    }
  };

  if (!isUploadOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl relative p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Document for {title}
          </h2>
          <button
            onClick={onUploadClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select file(s) from your device to upload to the workflow.
        </p>

        {/* Drag & Drop Area */}
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
            files.length
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40"
          }`}
        >
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <CloudUpload className="w-12 h-12 mb-3 text-blue-500" />
            {files.length ? (
              <ul className="text-green-600 text-sm">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            ) : (
              <>
                <p className="mb-2 text-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  SVG, PNG, JPG, PDF, or DOCX (MAX. 10MB each)
                </p>
              </>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
        </label>

        {/* Submit Button */}
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

export default UploadModal;
