import React, { useState } from "react";
import WorkflowCard from "./WorkflowCard";
import {
	MessageSquare,
	FileKey2,
	ScanEye,
	Files,
	Signature,
	Workflow,
} from "lucide-react";

const workflowPhases = [
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
	return (
		<dialog open={isOpen} className="modal">
			<div className="modal-box w-11/12 max-w-2xl">
				<h1 className="text-2xl font-bold mb-2">
					Workflow Phases for {lead.companyName}
				</h1>
				<p className="text-sm text-gray-500 mb-4">
					Manage the document workflow for your projects.
				</p>

				<div className="space-y-3">
					{workflowPhases.map((phase, index) => (
						<WorkflowCard key={index} {...phase} lead={lead} />
					))}
				</div>

				<button
					onClick={onClose}
					className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>
					✕
				</button>
			</div>
		</dialog>
	);
}

export default LeadWorkflowModal;
