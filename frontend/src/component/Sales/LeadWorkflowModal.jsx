import React, { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import axios from "axios";

const LEAD_STATUSES = [
	{ key: "under_discussion", label: "Under Discussion", autoDone: true },
	{ key: "pricing_proposal", label: "Pricing Proposal Sent" },
	{ key: "docs_review", label: "Docs Review" },
	{ key: "agreement_sent", label: "Agreement Sent" },
	{ key: "agreement_signed", label: "Agreement Signed" },
	{
		key: "integration_initiated",
		label: "Integration Initiated",
		noUpload: true,
	},
];

function LeadWorkflowModal({ isOpen, onClose, lead, onUpdateStatus }) {
	const [activeStatus, setActiveStatus] = useState(
		lead?.substatus || "under_discussion"
	);
	const [uploadedFiles, setUploadedFiles] = useState({});
	const [loading, setLoading] = useState(false);

	// ✅ Handle file upload with API call
	const handleFileChange = async (e, statusKey) => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			setLoading(true);
			const formData = new FormData();
			formData.append("file", file);
			formData.append("companyName", lead.companyName);

			const response = await axios.post(
				"http://localhost:3939/api/v1/sales/upload",
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } }
			);

			setUploadedFiles((prev) => ({
				...prev,
				[statusKey]: file.name,
			}));

			console.log("File uploaded:", response.data);
		} catch (error) {
			console.error("Upload error:", error.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	// ✅ Handle status update with API call
	const handleStatusClick = async (statusKey) => {
		try {
			setLoading(true);
			const response = await axios.put(
				`http://localhost:3939/api/v1/sales/${lead._id}`,
				{
					substatus: statusKey,
				}
			);

			setActiveStatus(statusKey);
			onUpdateStatus?.(statusKey); // Notify parent to refresh leads
			console.log("Status updated:", response.data);
		} catch (error) {
			console.error(
				"Status update error:",
				error.response?.data || error.message
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<dialog open={isOpen} className="modal">
			<div className="modal-box w-11/12 max-w-2xl">
				<h3 className="font-bold text-lg mb-4 text-center">
					Lead Workflow - {lead.companyName}
				</h3>

				<div className="space-y-3">
					{LEAD_STATUSES.map((status, idx) => {
						const isActive = activeStatus === status.key;
						const isCompleted =
							LEAD_STATUSES.findIndex((s) => s.key === activeStatus) > idx ||
							status.autoDone;

						return (
							<div
								key={status.key}
								className={`border rounded-lg p-3 flex justify-between items-center ${
									isActive ? "border-blue-500 bg-blue-50" : "border-gray-200"
								}`}
							>
								<div className="flex items-center gap-2">
									{isCompleted ? (
										<CheckCircle2 className="text-green-600 w-5 h-5" />
									) : (
										<span className="w-5 h-5 border border-gray-300 rounded-full" />
									)}
									<span
										className={`font-medium ${isActive ? "text-blue-700" : ""}`}
									>
										{status.label}
									</span>
								</div>

								{/* ✅ Upload + Mark Done (except autoDone & noUpload stages) */}
								{!status.autoDone && !status.noUpload && (
									<div className="flex items-center gap-2">
										<label className="cursor-pointer text-sm text-blue-600 hover:underline">
											<Upload className="w-4 h-4 inline-block mr-1" />
											<input
												type="file"
												className="hidden"
												onChange={(e) => handleFileChange(e, status.key)}
											/>
											{uploadedFiles[status.key] || "Upload"}
										</label>

										{!isCompleted && (
											<button
												disabled={loading}
												className="btn btn-primary btn-xs"
												onClick={() => handleStatusClick(status.key)}
											>
												{loading ? "Saving..." : "Mark Done"}
											</button>
										)}
									</div>
								)}

								{/* ✅ Integration stage has no upload button */}
								{status.noUpload && !isCompleted && (
									<button
										disabled={loading}
										className="btn btn-primary btn-xs"
										onClick={() => handleStatusClick(status.key)}
									>
										{loading ? "Saving..." : "Mark Done"}
									</button>
								)}
							</div>
						);
					})}

					{/* ✅ Final Step: Active / Suspended */}
					<div className="border rounded-lg p-3 flex justify-between items-center">
						<span className="font-medium">Final Lead Status</span>
						<div className="flex gap-2">
							<button
								disabled={loading}
								className={`btn btn-success btn-sm ${
									activeStatus === "active" ? "btn-active" : ""
								}`}
								onClick={() => handleStatusClick("active")}
							>
								Active
							</button>
							<button
								disabled={loading}
								className={`btn btn-error btn-sm ${
									activeStatus === "suspended" ? "btn-active" : ""
								}`}
								onClick={() => handleStatusClick("suspended")}
							>
								Suspended
							</button>
						</div>
					</div>
				</div>

				{/* Close Button */}
				<div className="modal-action">
					<button className="btn" onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</dialog>
	);
}

export default LeadWorkflowModal;
