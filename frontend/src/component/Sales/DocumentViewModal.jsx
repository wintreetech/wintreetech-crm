import React from "react";
import { Download, Trash, X, FileText, Folders, Loader2 } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { selectDocumentsBucket } from "../../store/slices/Sales.slice";
import {
  fetchDocuments,
  deleteDocument,
} from "../../store/thunks/sales.thunks";

function DocumentViewModal({
  lead,
  title,
  isViewDocumentOpen,
  onViewDocumentClose,
}) {
  const dispatch = useDispatch();

  const bucket = useSelector((state) =>
    selectDocumentsBucket(state, {
      companyName: lead?.companyName ?? "",
      subStatus: title ?? "",
    })
  );

  const { items: documents = [], loading = false, error = null } = bucket || {};

  // Load docs when modal opens (and inputs are ready)
  useEffect(() => {
    if (isViewDocumentOpen && lead?.companyName && title) {
      dispatch(
        fetchDocuments({ companyName: lead.companyName, subStatus: title })
      )
        .unwrap()
        .catch((err) => err && toast.error(err));
    }
  }, [dispatch, isViewDocumentOpen, lead?.companyName, title]);

  const handleDeleteDocument = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this document?");
    if (!ok) return;

    try {
      await dispatch(
        deleteDocument({ id, companyName: lead?.companyName, subStatus: title })
      ).unwrap();
      toast.success("Document deleted successfully!");
    } catch (err) {
      toast.error(err || "Failed to delete document.");
    }
  };

  if (!isViewDocumentOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg text-primary flex items-center justify-center">
              <Folders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Uploaded Documents
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Phase: {title}
              </p>
              {/* {error ? (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              ) : null} */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewDocumentClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No documents found for this phase.
            </p>
          ) : (
            documents.map((doc, idx) => {
              const uploadedAt = new Date(doc.uploadedAt);
              const formattedDate = uploadedAt.toLocaleDateString("en-GB");

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Uploaded By{" "}
                        <span className="font-bold capitalize">
                          {doc.uploadedBy}
                        </span>{" "}
                        on{" "}
                        <span className="font-bold capitalize">
                          {formattedDate}
                        </span>{" "}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash className="w-5 h-5 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentViewModal;
