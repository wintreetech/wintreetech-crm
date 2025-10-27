import { CloudUpload, X } from "lucide-react";
import React, { useState } from "react";
import api from "../../api.js";
import { toast } from "react-hot-toast";
import axios from "axios";

function UploadModal({
	title,
	isUploadOpen,
	onUploadClose,
	lead,
	onFirstUpload,
}) {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleFileChange = (e) => {
		if (e.target.files) {
			setFiles(Array.from(e.target.files)); // Accept multiple files
		}
	};

	const handleUpload = async () => {
		if (!files.length) return;

		const formData = new FormData();
		files.forEach((file) => formData.append("file", file));
		formData.append("companyName", lead.companyName);
		formData.append("subStatus", title);

		try {
			setLoading(true);

			// 🧠 Step 1 — Check if this phase already has documents
			let isFirstUpload = false;
			try {
				const checkRes = await axios.get(
					`http://localhost:3939/api/v1/sales/${lead.companyName}/${title}`
				);
				const existingUploads =
					checkRes.data?.upload ||
					checkRes.data?.companyData?.flatMap((d) => d.upload) ||
					[];

				if (existingUploads.length === 0) {
					isFirstUpload = true;
				}
			} catch (err) {
				// If company not found (first ever upload), treat as first upload
				if (err.response?.status === 404) {
					isFirstUpload = true;
				} else {
					console.error("Error checking existing uploads:", err);
				}
			}

			// 🧾 Step 2 — Upload files
			const res = await axios.post(
				"http://localhost:3939/api/v1/sales/upload",
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } }
			);

			toast.success("File(s) uploaded successfully!");
			console.log("Upload response:", res.data);

			// 🚀 Step 3 — Only call onFirstUpload() if it’s the first upload for this phase
			if (isFirstUpload && onFirstUpload) {
				onFirstUpload(title);
			}

			setFiles([]);
			onUploadClose();
		} catch (err) {
			console.error(err.response || err.message);
			toast.error("File upload failed. Try again.");
		} finally {
			setLoading(false);
		}
	};

	if (!isUploadOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
					className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
						files.length
							? "border-green-400 bg-green-50"
							: "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40"
					}`}
				>
					<div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
						<CloudUpload className="w-12 h-12 mb-3 text-blue-500" />
						{files.length ? (
							<ul className="text-green-600 text-sm">
								{files.map((file, index) => (
									<li key={index}>{file.name}</li>
								))}
							</ul>
						) : (
							<>
								<p className="mb-2 text-sm">
									<span className="font-semibold text-blue-600 dark:text-blue-400">
										Click to upload
									</span>{" "}
									or drag and drop
								</p>
								<p className="text-xs text-gray-400 dark:text-gray-500">
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
