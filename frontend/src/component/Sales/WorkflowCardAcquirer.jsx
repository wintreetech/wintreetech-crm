import { CloudUpload, Eye, CheckSquare } from "lucide-react";
import { useState } from "react";

import { useDispatch } from "react-redux";
import { uploadAcquirerDocuments } from "../../store/thunks/Acquirer.thunks";

import UploadModalAcquirers from "./UploadModalAcquirers";
import DocumentViewModalAcquirers from "./DocumentViewModalAcquirers";
function WorkflowCardAcquirer({
	title,
	description,
	icon: Icon,
	hasDocs,
	isClickable,
	hasChecklist,
	checklistProgress,
	onClick,
	lead, // Added to pass lead data to modals
	onUploadClick, // Callback for upload button
	onViewClick, // Callback for view button
	...props
}) {
	const [uploadOpen, setUploadOpen] = useState(false);
	const [documentViewOpen, setDocumentViewOpen] = useState(false);
	const dispatch = useDispatch();

	const handleCardClick = () => {
		if (isClickable && onClick) {
			onClick();
		}
	};

	// For first KYC phase with checklist
	const isFirstKYCPhase = hasChecklist && isClickable;

	const handleUpload = (files) => {
		dispatch(
			uploadAcquirerDocuments({
				bankName: lead.bankName,
				sectionName: title,
				files,
				uploadedBy: currentUser.username,
			})
		).then(() => setUploadOpen(false));
	};

	const handleAcquirerUpload = (payload) => {
		const { files, companyName, subStatus, uploadedBy } = payload;

		return dispatch(
			uploadAcquirerDocuments({
				files,
				bankName: companyName, // map
				sectionName: subStatus, // map
				uploadedBy,
			})
		);
	};

	return (
		<>
			<div
				className={`flex items-center justify-between p-5 bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md hover:bg-base-200 transition-all duration-300 ${
					isClickable ? "cursor-pointer" : ""
				}`}
				onClick={handleCardClick}
			>
				{/* Left Section: Icon + Info */}
				<div className="flex items-center gap-4">
					<div className="bg-blue-50 text-blue-600 dark:bg-blue-800 dark:text-blue-200 p-3 rounded-xl shadow-sm">
						<Icon className="w-5 h-5" />
					</div>
					<div>
						<h3 className="font-semibold text-base-content">{title}</h3>
						<p className="text-sm text-base-content/60">{description}</p>

						{/* Checklist progress indicator - placed below description */}
					</div>
				</div>

				{/* Right Section: Buttons and Status */}
				<div className="flex items-center gap-3">
					{/* Buttons */}
					<div className="flex gap-2">
						{/* For first KYC phase: Only show checklist button */}
						{isFirstKYCPhase ? (
							<>
								{hasChecklist && checklistProgress !== undefined && (
									<div className="flex items-center gap-2 mt-1">
										<CheckSquare size={16} className="text-blue-600" />
										<span className="text-sm font-medium text-blue-600">
											{checklistProgress}% complete
										</span>
									</div>
								)}
								<button
									onClick={handleCardClick}
									className="btn btn-sm bg-blue-50 text-blue-600 border-none hover:bg-blue-100 hover:scale-105 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-transform"
								>
									<CheckSquare className="w-4 h-4" />
								</button>
							</>
						) : (
							// For other phases: Show both upload and view buttons
							<>
								<button
									onClick={() => setUploadOpen(!uploadOpen)}
									className="btn btn-sm bg-blue-50 text-blue-600 border-none hover:bg-blue-100 hover:scale-105 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-transform"
								>
									<CloudUpload className="w-4 h-4" />
								</button>
								<button
									onClick={() => setDocumentViewOpen(!documentViewOpen)}
									className="btn btn-sm bg-blue-50 text-blue-600 border-none hover:bg-blue-100 hover:scale-105 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-transform"
								>
									<Eye className="w-4 h-4" />
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Cloud Upload Open Modal */}
			{uploadOpen && title && (
				<UploadModalAcquirers
					lead={lead}
					title={title}
					isUploadOpen={uploadOpen}
					onUploadClose={() => setUploadOpen(false)}
					onFirstUpload={handleUpload}
				/>
			)}
			{/* Cloud Upload Open Modal */}
			{documentViewOpen && title && (
				<DocumentViewModalAcquirers
					lead={lead}
					title={title}
					isViewDocumentOpen={documentViewOpen}
					onViewDocumentClose={() => setDocumentViewOpen(false)}
				/>
			)}
		</>
	);
}

export default WorkflowCardAcquirer;
