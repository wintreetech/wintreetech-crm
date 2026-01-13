import React from "react";
import { Download, Trash, X, FileText, Folders, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
	selectDocumentsBucket,
	updateLeadStatus,
} from "../../store/slices/Sales.slice";
import {
	fetchDocuments,
	deleteDocument,
	downloadDocuments,
	docKey,
} from "../../store/thunks/Sales.thunks.js";
import { selectCurrentUser } from "../../store/slices/Auth.slice.js";

function DocumentViewModal({
	lead,
	title,
	isViewDocumentOpen,
	onViewDocumentClose,
}) {
	const dispatch = useDispatch();

	const currentUser = useSelector(selectCurrentUser);

	const hasPermission =
		currentUser?.role === "admin" || currentUser?.role === "superadmin";

	const bucket = useSelector((state) =>
		selectDocumentsBucket(state, {
			companyName: lead?.companyName ?? "",
			subStatus: title ?? "",
		})
	);

	// Separately check if the REAL bucket object exists in state.sales.documents
	const hasBucket = useSelector((state) => {
		const companyName = lead?.companyName ?? "";
		const subStatus = title ?? "";
		if (!companyName || !subStatus) return false;

		const key = docKey({ companyName, subStatus });
		return !!state.sales.documents?.[key]; // true = full object is present
	});

	const [downloadingId, setDownloadingId] = useState(null);

	const { items: documents = [], loading = false, error = null } = bucket || {};

	// Fetch ONLY if the bucket object does NOT exist yet in the slice
	useEffect(() => {
		if (!isViewDocumentOpen || !lead?.companyName || !title) return;

		if (hasBucket) return; // object already exists -> no fetch

		dispatch(
			fetchDocuments({ companyName: lead.companyName, subStatus: title })
		)
			.unwrap()
			.catch((err) => err && toast.error(err));
	}, [dispatch, isViewDocumentOpen, lead?.companyName, title, hasBucket]);

	const handleDeleteDocument = async (documentId) => {
		const ok = window.confirm("Are you sure you want to delete this document?");
		if (!ok) return;

		try {
			await dispatch(
				deleteDocument({
					id: documentId,
					companyName: lead?.companyName,
					subStatus: title,
					leadId: lead?._id,
				})
			).unwrap();
			toast.success("Document deleted successfully!");
		} catch (err) {
			toast.error(err || "Failed to delete document.");
		}
	};

	const handleDownloadDocument = async (id, fileUrl, fileName) => {
		try {
			setDownloadingId(id); // start spinner for this file

			await dispatch(downloadDocuments({ id, fileUrl, fileName })).unwrap(); // wait until thunk finishes
		} catch (err) {
			console.error("Download failed:", err);
		} finally {
			setDownloadingId(null); // stop spinner
		}
	};

	if (!isViewDocumentOpen) return null;

	return (
		<div className="fixed inset-0 h-full bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
											<p className="font-medium text-gray-900 dark:text-white mb-0.5">
												{doc.fileName}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												Uploaded By{" "}
												<span className="capitalize">{doc.uploadedBy}</span> on{" "}
												<span className="capitalize">{formattedDate}</span>{" "}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<a
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
													? "bg-primary/10 dark:bg-primary/20 cursor-wait"
													: "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
											}`}
										>
											{downloadingId === doc._id ? (
												<Loader2 className="w-5 h-5 text-primary animate-spin" />
											) : (
												<Download className="w-5 h-5 text-gray-700 dark:text-gray-200" />
											)}
										</a>
										{hasPermission && (
											<button
												onClick={() => handleDeleteDocument(doc._id)}
												className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors cursor-pointer"
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

export default DocumentViewModal;
