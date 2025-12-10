import WorkflowCard from "./WorkflowCard";
import {
  MessageSquare,
  FileKey2,
  ScanEye,
  Files,
  Signature,
  Workflow,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSalesDocuments } from "../../store/slices/Sales.slice";
import { docKey } from "../../store/thunks/Sales.thunks.js";

export const workflowPhases = [
  {
    title: "Under Discussion",
    description: "Under Discuss project details and requirements",
    icon: MessageSquare,
  },
  {
    title: "Pricing Proposal",
    description: " the pricing proposal for review",
    icon: FileKey2,
  },
  {
    title: "KYC Docs",
    description: "Review and approve the pricing proposal",
    icon: ScanEye,
  },
  {
    title: "Upload Contract",
    description: "Upload the final contract for signing",
    icon: Files,
  },
  {
    title: "Signed Contract & Complete",
    description: "Signed the contract electronically",
    icon: Signature,
  },
  {
    title: "Annexture",
    description: "Amendments and additions to the contract",
    icon: Workflow,
  },
];

function LeadWorkflowModal({ isOpen, onClose, lead }) {
  const dispatch = useDispatch();
  const documents = useSelector(selectSalesDocuments);

  const [dismissedLeadWarning, setDismissedLeadWarning] = useState(false);

  const rawLeadKey = `${lead?.companyName || "unknown"}_${
    lead?.createdAt || ""
  }`;
  const normalizedLeadKey = rawLeadKey
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  const warningKey = `wf_lead_warn_${normalizedLeadKey}`;

  // Load per-lead "don't show again" state
  useEffect(() => {
    const dismissed = localStorage.getItem(warningKey) === "1";
    setDismissedLeadWarning(dismissed);
  }, [warningKey]);

  const hasDocsForPhase = (phaseTitle) => {
    const key = docKey({
      companyName: lead.companyName,
      subStatus: phaseTitle,
    });
    const bucket = documents[key];
    return !!(bucket && Array.isArray(bucket.items) && bucket.items.length > 0);
  };

  // This now uses ALL documents in Redux, including previously uploaded ones
  const allPhasesHaveDocs = useMemo(
    () =>
      workflowPhases
        .filter(
          (phase) =>
            phase.title !== "Under Discussion" && phase.title !== "Annexture"
        )
        .every((phase) => hasDocsForPhase(phase.title)),
    [documents, lead.companyName]
  );

  const shouldShowLeadWarning =
    lead.status === "Active" && !allPhasesHaveDocs && !dismissedLeadWarning;

  const handleDismissLeadWarning = () => {
    localStorage.setItem(warningKey, "1");
    setDismissedLeadWarning(true);
  };

  return (
    <dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
      {/* ✅ Mobile full-screen, Desktop unchanged */}
      <div
        className="
          modal-box
          w-screen h-screen max-w-none
          sm:w-11/12 sm:max-w-2xl sm:h-auto sm:max-h-none
          overflow-y-auto
          rounded-lg
        "
      >
        <h1 className="text-2xl font-bold mb-2">
          Workflow Phases for {lead.companyName}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Manage the document workflow for your projects.
        </p>

        {/* SINGLE per-lead warning */}
        {shouldShowLeadWarning && (
          <div className="p-3 rounded-lg bg-yellow-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" />
            <span className="text-sm">
              Lead is <b>Active</b>, but some phases have missing documents.
            </span>
            <button
              className="px-2 py-1 rounded-lg bg-amber-300 hover:bg-yellow-400 text-yellow-800 cursor-pointer ml-auto text-sm"
              onClick={handleDismissLeadWarning}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-3">
          {workflowPhases.map((phase, index) => (
            <WorkflowCard
              key={index}
              {...phase}
              lead={lead}
              hasDocs={hasDocsForPhase(phase.title)}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X />
        </button>
      </div>
    </dialog>
  );
}

export default LeadWorkflowModal;
