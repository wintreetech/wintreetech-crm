import { CloudUpload, Eye } from "lucide-react";
import { useState } from "react";
import UploadModal from "./UploadModal";
import DocumentViewModal from "./DocumentViewModal";
import { useDispatch } from "react-redux";
import { updateLeadStatus } from "../../store/slices/Sales.slice";

function WorkflowCard({ title, description, icon: Icon, lead }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [documentViewOpen, setDocumentViewOpen] = useState(false);

  const dispatch = useDispatch();

  const hideIcon = title === "Under Discussion";

  const handleFirstUpload = async (phaseTitle) => {
    if (lead.status !== "Open") {
      console.warn("Cannot update subStatus because status is not Open");
      toast.error("Cannot update subStatus because status is not Open");
      return;
    }

    // Example API call to update lead’s substatus
    try {
      dispatch(
        updateLeadStatus({
          id: lead._id,
          status: phaseTitle,
        })
      );
    } catch (err) {
      console.error("Failed to update substatus:", err);
      toast.error("Failed to update substatus.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-5 bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md hover:bg-base-200 transition-all duration-300">
        {/* Left Section: Icon + Info */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base-content">{title}</h3>
            <p className="text-sm text-base-content/60">{description}</p>
          </div>
        </div>

        {/* Right Section: Buttons */}
        {!hideIcon && (
          <div className="flex gap-2">
            <button
              onClick={() => setUploadOpen(!uploadOpen)}
              className="btn btn-sm bg-blue-50 text-blue-600 border-none hover:bg-blue-100 hover:scale-105 transition-transform"
            >
              <CloudUpload className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDocumentViewOpen(!documentViewOpen)}
              className="btn btn-sm bg-blue-50 text-blue-600 border-none hover:bg-blue-100 hover:scale-105 transition-transform"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {/* Cloud Upload Open Modal */}
      {uploadOpen && title && (
        <UploadModal
          lead={lead}
          title={title}
          isUploadOpen={uploadOpen}
          onUploadClose={() => setUploadOpen(false)}
          onFirstUpload={handleFirstUpload}
        />
      )}
      {/* Cloud Upload Open Modal */}
      {documentViewOpen && title && (
        <DocumentViewModal
          lead={lead}
          title={title}
          isViewDocumentOpen={documentViewOpen}
          onViewDocumentClose={() => setDocumentViewOpen(false)}
        />
      )}
    </>
  );
}

export default WorkflowCard;
