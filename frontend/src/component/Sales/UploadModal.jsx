import { CloudUpload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { selectDocumentsBucket } from "../../store/slices/Sales.slice";
import { uploadDocuments } from "../../store/thunks/Sales.thunks.js";
import { selectCurrentUser } from "../../store/slices/Auth.slice";

function UploadModal({
	title,
	isUploadOpen,
	onUploadClose,
	lead,
	onFirstUpload,
}) {
	const dispatch = useDispatch();
	const [files, setFiles] = useState([]);
	const MAX_FILES = 10;

	const currentUser = useSelector(selectCurrentUser);

	// Use bucket-level loading from Redux (same key the docs view uses)
	const bucket = useSelector((state) =>
		selectDocumentsBucket(state, {
			companyName: lead?.companyName ?? "",
			subStatus: title ?? "",
		})
	);

	const loading = bucket?.loading ?? false;

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);

		if (selectedFiles.length > MAX_FILES) {
			toast.error("You can upload a maximum of 10 files at once.");
			return;
		}

		setFiles(selectedFiles);
	};

	const handleUpload = async () => {
		if (!files?.length || loading) return;

		if (files.length > MAX_FILES) {
			toast.error("Maximum 10 files allowed.");
			return;
		}

		try {
			// Dispatch upload thunk (S3 + MongoDB logic)
			const { isFirstUpload, message } = await dispatch(
				uploadDocuments({
					files,
					companyName: lead.companyName,
					subStatus: title,
					leadId: lead._id,
					uploadedBy: currentUser.username,
				})
			).unwrap();

			// ✅ Show success message
			toast.success(message || "File(s) uploaded successfully!");

			// ✅ Trigger parent callback if first upload for this phase
			if (isFirstUpload && typeof onFirstUpload === "function") {
				onFirstUpload(title);
			}

			// ✅ Clear state and close modal
			setFiles([]);
			onUploadClose?.(); // safer optional chaining
		} catch (err) {
			console.error("Upload failed:", err);

			// ✅ Handle all possible error shapes
			const errorMessage =
				typeof err === "string"
					? err
					: err?.message || "File upload failed. Try again.";

			toast.error(errorMessage);
		}
	};

	if (!isUploadOpen) return null;

	return (
		<div className="fixed h-full inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl relative p-6 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
						Upload Document for {title}
					</h2>
					<button
						onClick={onUploadClose}
						className="cursor-pointer p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
					>
						<X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
					</button>
				</div>

				<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
					Select file(s) from your device to upload to the workflow.
				</p>

				{/* Drag & Drop Area */}
				<label
					htmlFor="file-upload"
					className={`flex flex-col w-full border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
						files.length
							? "border-green-400 bg-green-50"
							: "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40"
					}`}
				>
					<div className="flex flex-col items-center justify-center p-4 text-gray-500 dark:text-gray-400">
						<CloudUpload className="w-10 h-10 mb-2 text-blue-500" />

						{files.length ? (
							<div className="w-full mt-2 max-h-28 overflow-y-auto rounded-md border border-green-200 bg-white dark:bg-gray-800 p-2">
								<ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
									{files.map((file, index) => (
										<li
											key={index}
											className="truncate px-2 py-1 rounded bg-green-50 dark:bg-gray-700"
											title={file.name}
										>
											{file.name}
										</li>
									))}
								</ul>
							</div>
						) : (
							<>
								<p className="mb-1 text-sm text-center">
									<span className="font-semibold text-blue-600 dark:text-blue-400">
										Click to upload
									</span>{" "}
									or drag and drop
								</p>
								<p className="text-xs text-gray-400 dark:text-gray-500 text-center">
									SVG, PNG, JPG, PDF, or DOCX (MAX. 10MB each)
								</p>
							</>
						)}
					</div>

					<input
						id="file-upload"
						type="file"
						className="hidden"
						multiple
						onChange={handleFileChange}
					/>
				</label>

				{/* Submit Button */}
				<div className="flex justify-end mt-4">
					<button
						type="button"
						disabled={!files.length || loading}
						onClick={handleUpload}
						className={`btn btn-primary ${
							loading ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						{loading ? "Uploading..." : "Submit"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default UploadModal;
