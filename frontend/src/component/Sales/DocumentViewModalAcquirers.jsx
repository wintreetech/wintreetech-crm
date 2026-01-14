import React, { useEffect, useState } from "react";
import { Download, Trash, X, FileText, Folders, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import {
	fetchAcquirerDocuments,
	deleteAcquirerDocument,
	downloadAcquirerDocument,
} from "../../store/thunks/Acquirer.thunks";

import { selectAcquirerDocsBySection } from "../../store/slices/AcquirerDocuments.slice";
import { selectCurrentUser } from "../../store/slices/Auth.slice";

function DocumentViewModalAcquirers({
	lead,
	title,
	isViewDocumentOpen,
	onViewDocumentClose,
}) {
	const dispatch = useDispatch();
	const currentUser = useSelector(selectCurrentUser);

	const hasPermission =
		currentUser?.role === "admin" || currentUser?.role === "superadmin";

	const documents = useSelector(
		selectAcquirerDocsBySection(lead?.bankName, title)
	);

	const loading = useSelector((state) => state.acquirerDocs.loading);

	const [downloadingId, setDownloadingId] = useState(null);

	// -----------------------------
	// FETCH DOCUMENTS ON OPEN
	// -----------------------------
	useEffect(() => {
		if (!isViewDocumentOpen || !lead?.bankName || !title) return;

		dispatch(
			fetchAcquirerDocuments({
				bankName: lead.bankName,
				sectionName: title,
			})
		)
			.unwrap()
			.catch((err) => err && toast.error(err));
	}, [dispatch, isViewDocumentOpen, lead?.bankName, title]);

	// -----------------------------
	// DELETE
	// -----------------------------
	const handleDeleteDocument = async (documentId) => {
		const ok = window.confirm("Are you sure you want to delete this document?");
		if (!ok) return;

		try {
			await dispatch(deleteAcquirerDocument(documentId)).unwrap();
		} catch (err) {
			toast.error(err || "Failed to delete document.");
		}
	};

	// -----------------------------
	// DOWNLOAD
	// -----------------------------
	const handleDownloadDocument = async (id, fileUrl, fileName) => {
		try {
			setDownloadingId(id);
			await dispatch(downloadAcquirerDocument({ fileUrl, fileName })).unwrap();
		} catch (err) {
			toast.error("Download failed");
		} finally {
			setDownloadingId(null);
		}
	};

	if (!isViewDocumentOpen) return null;

	return (
		<div className="fixed inset-0 h-full bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col relative overflow-hidden">
				{/* ---------------- HEADER ---------------- */}
				<header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg text-primary">
							<Folders className="w-6 h-6" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
								Uploaded Documents
							</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Section: {title}
							</p>
						</div>
					</div>
					<button
						onClick={onViewDocumentClose}
						className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
					>
						<X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
					</button>
				</header>

				{/* ---------------- BODY ---------------- */}
				<div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
					{loading ? (
						<div className="flex justify-center items-center py-8">
							<Loader2 className="w-6 h-6 text-primary animate-spin" />
						</div>
					) : documents.length === 0 ? (
						<p className="text-center text-gray-500 dark:text-gray-400">
							No documents found for this section.
						</p>
					) : (
						documents.map((doc) => {
							const uploadedAt = new Date(doc.uploadedAt);
							const formattedDate = uploadedAt.toLocaleDateString("en-GB");

							return (
								<div
									key={doc._id}
									className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
								>
									<div className="flex items-center gap-3">
										<FileText className="w-6 h-6 text-primary" />
										<div>
											<p className="font-medium text-gray-900 dark:text-white mb-0.5">
												{doc.fileName}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												Uploaded by{" "}
												<span className="capitalize">{doc.uploadedBy}</span> on{" "}
												{formattedDate}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										{/* DOWNLOAD */}
										<button
											onClick={() =>
												downloadingId !== doc._id &&
												handleDownloadDocument(
													doc._id,
													doc.fileUrl,
													doc.fileName
												)
											}
											className={`p-2 rounded-lg transition-colors ${
												downloadingId === doc._id
													? "bg-primary/10 cursor-wait"
													: "hover:bg-primary/10"
											}`}
										>
											{downloadingId === doc._id ? (
												<Loader2 className="w-5 h-5 text-primary animate-spin" />
											) : (
												<Download className="w-5 h-5 text-gray-700 dark:text-gray-200" />
											)}
										</button>

										{/* DELETE */}
										{hasPermission && (
											<button
												onClick={() => handleDeleteDocument(doc._id)}
												className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800"
											>
												<Trash className="w-5 h-5 text-red-500 dark:text-red-400" />
											</button>
										)}
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

export default DocumentViewModalAcquirers;
