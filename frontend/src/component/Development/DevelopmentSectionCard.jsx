import { CloudUpload, Eye } from "lucide-react";
import { useState } from "react";
import DevelopmentDocumentViewModal from "./DevelopmentDocumentViewModal.jsx";
import DevelopmentUploadModal from "./DevelopmentUploadModal.jsx";

function DevelopmentSectionCard({ title, description, icon: Icon, record }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [documentViewOpen, setDocumentViewOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-5 bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md hover:bg-base-200 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 dark:bg-blue-800 dark:text-blue-200 p-3 rounded-xl shadow-sm">
            <Icon className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-semibold text-base-content">{title}</h3>
            <p className="text-sm text-base-content/60">{description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="btn btn-sm bg-blue-50 text-blue-600 border-none hover:bg-blue-100 hover:scale-105 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-transform"
          >
            <CloudUpload className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setDocumentViewOpen(true)}
            className="btn btn-sm bg-blue-50 text-blue-600 border-none hover:bg-blue-100 hover:scale-105 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-transform"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {uploadOpen && (
        <DevelopmentUploadModal
          title={title}
          record={record}
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
        />
      )}

      {documentViewOpen && (
        <DevelopmentDocumentViewModal
          title={title}
          record={record}
          isOpen={documentViewOpen}
          onClose={() => setDocumentViewOpen(false)}
        />
      )}
    </>
  );
}

export default DevelopmentSectionCard;
