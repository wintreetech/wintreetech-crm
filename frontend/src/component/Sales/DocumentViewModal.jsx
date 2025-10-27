import React from "react";
import {
	Download,
	Trash,
	UploadCloud,
	X,
	FileText,
	Folders,
	Loader2,
} from "lucide-react";
import api from "../../api";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

function DocumentViewModal({
	lead,
	title,
	isViewDocumentOpen,
	onViewDocumentClose,
}) {
	const [documents, setDocuments] = useState([]);
	const [loading, setLoading] = useState(false);

	const getDataOfCompany = async (companyName, subStatus) => {
		try {
			setLoading(true);
			const res = await api.get(
				`/sales/${encodeURIComponent(companyName)}/${encodeURIComponent(
					subStatus
				)}`
			);

			if (res.data && res.data.upload) {
				setDocuments(res.data.upload);
			} else if (res.data && res.data.companyData) {
				setDocuments(res.data.companyData.flatMap((d) => d.upload || []));
			} else {
				setDocuments([]);
			}
		} catch (error) {
			if (error.response?.status === 404) {
				// Company not found yet, no uploads made
				setDocuments([]);
				return;
			}

			console.error("Error fetching documents:", error);
			toast.error(
				error.response?.data?.error || "Failed to fetch company documents."
			);
			setDocuments([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isViewDocumentOpen && lead?.companyName && title) {
			getDataOfCompany(lead.companyName, title);
		}
	}, [isViewDocumentOpen, lead, title]);

	const handleDeleteDocument = async (id) => {
		try {
			const confirmDelete = window.confirm(
				"Are you sure you want to delete this document?"
			);
			if (!confirmDelete) return;

			const res = await api.delete(`/sales/document/${id}`);

			if (res.data.success) {
				toast.success("Document deleted successfully!");
				// Remove the deleted document from state
				setDocuments((prev) => prev.filter((doc) => doc._id !== id));
			} else {
				toast.error(res.data.error || "Failed to delete document.");
			}
		} catch (error) {
			console.error("Delete document error:", error);
			toast.error(
				error.response?.data?.error || "Something went wrong while deleting."
			);
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
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
							<UploadCloud className="w-4 h-4" />
							Upload
						</button>
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
						documents.map((doc, idx) => (
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
											Uploaded By Shubham Makwana On{" "}
											{new Date(doc.uploadedAt).toLocaleDateString()}
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
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default DocumentViewModal;
