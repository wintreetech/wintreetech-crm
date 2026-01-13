import WorkflowCard from "../Sales/WorkflowCard";
import {
	FileCheck2,
	Files,
	Signature,
	Workflow,
	X,
	CheckSquare,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSalesDocuments } from "../../store/slices/Sales.slice";
import { docKey } from "../../store/thunks/Sales.thunks.js";
import WorkflowCardAcquirer from "./WorkflowCardAcquirer.jsx";
import ChecklistModal from "./CheckListForAcquirer.jsx";
import { selectChecklist } from "../../store/slices/AcquirerChecklist.slice.js";
import { fetchChecklist } from "../../store/thunks/Acquirer.thunks.js";

/* ===============================
   ACQUIRER WORKFLOW PHASES
================================ */
export const acquirerWorkflowPhases = [
	{
		title: "Required KYC Docs",
		description: "Upload and verify all required KYC documents",
		icon: FileCheck2,
		hasChecklist: true, // Add this flag for checklist support
	},
	{
		title: "Initial Contract",
		description: "Upload the initial agreement",
		icon: Files,
	},
	{
		title: "Signed Contract",
		description: "Upload the signed agreement",
		icon: Signature,
	},
	{
		title: "Annexture",
		description: "Upload annexure documents",
		icon: Workflow,
	},
];

// Checklist Modal Component

function AcquirerWorkflowModal({ isOpen, onClose, acquirer }) {
	const dispatch = useDispatch();
	const documents = useSelector(selectSalesDocuments);
	const [showChecklist, setShowChecklist] = useState(false);
	const checklistItems = useSelector(selectChecklist);

	useEffect(() => {
		if (acquirer?.bankName) {
			dispatch(fetchChecklist(acquirer.bankName));
		}
	}, [acquirer, dispatch]);

	if (!isOpen || !acquirer) return null;

	/* ---------- Helpers ---------- */
	const hasDocsForPhase = (phaseTitle) => {
		const key = docKey({
			companyName: acquirer.acquirerBankName,
			subStatus: phaseTitle,
		});
		const bucket = documents[key];
		return !!(bucket && Array.isArray(bucket.items) && bucket.items.length > 0);
	};

	const allPhasesCompleted = useMemo(
		() => acquirerWorkflowPhases.every((phase) => hasDocsForPhase(phase.title)),
		[documents, acquirer.acquirerBankName]
	);

	// Calculate KYC checklist progress for the first phase
	const kycChecklistProgress = useMemo(() => {
		if (!Array.isArray(checklistItems) || checklistItems.length === 0) return 0;

		const completed = checklistItems.filter(
			(item) => item.isCompleted // ✅ FIX
		).length;

		return Math.round((completed / checklistItems.length) * 100);
	}, [checklistItems]);

	const handleFirstPhaseClick = () => {
		// Only make the first phase clickable to open checklist
		if (acquirerWorkflowPhases[0].hasChecklist) {
			setShowChecklist(true);
		}
	};

	return (
		<>
			<dialog open={isOpen} className="modal">
				<div className="modal-box w-11/12 max-w-2xl">
					<h1 className="text-2xl font-bold mb-2">
						Acquirer Onboarding – {acquirer.bankName}
					</h1>

					<p className="text-sm text-gray-500 mb-4">
						Manage onboarding documents for the acquirer.
					</p>

					{/* Workflow Cards - FIXED: Only one map function */}
					<div className="space-y-3">
						{acquirerWorkflowPhases.map((phase, index) => {
							const isFirstPhase = index === 0;
							const hasDocs = hasDocsForPhase(phase.title);

							return (
								<WorkflowCardAcquirer
									key={index}
									title={phase.title}
									description={phase.description}
									icon={phase.icon}
									hasDocs={hasDocs}
									hasChecklist={phase.hasChecklist}
									isClickable={isFirstPhase}
									checklistProgress={isFirstPhase ? kycChecklistProgress : 0}
									onClick={() => setShowChecklist(true)}
									onUploadClick={() => {
										// Handle upload logic for this phase
										console.log("Upload for:", phase.title);
										// You can set your upload modal state here
									}}
									onViewClick={() => {
										// Handle view logic for this phase
										console.log("View for:", phase.title);
										// You can set your view modal state here
									}}
									lead={acquirer}
								/>
							);
						})}
					</div>

					{/* Close Button */}
					<button
						onClick={onClose}
						className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>
						<X />
					</button>
				</div>
			</dialog>

			{/* Checklist Modal */}
			<ChecklistModal
				isOpen={showChecklist}
				onClose={() => setShowChecklist(false)}
				acquirer={acquirer}
				checklistItems={checklistItems}
			/>
		</>
	);
}

export default AcquirerWorkflowModal;
