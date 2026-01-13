import React, { useMemo, useState, useEffect } from "react";
import {
	X,
	Link as LinkIcon,
	Trash,
	Plus,
	FileSpreadsheet,
	Search,
	Copy,
} from "lucide-react";
import toast from "react-hot-toast";

// import CRM_API_BASE from "../../config";

import { useDispatch, useSelector } from "react-redux";
import {
	addProcessingUrls,
	deleteProcessingUrl,
	fetchProcessingUrls,
} from "../../store/thunks/Sales.thunks.js";
import { api } from "../../api.js";
import { CRM_API_BASE } from "../../config.js";

const LeadUrlModal = ({ isOpen, onClose, lead }) => {
	if (!isOpen || !lead) return null;

	// State management
	const dispatch = useDispatch();

	// Redux state
	const { processingUrls, loading, error } = useSelector(
		(state) => state.sales
	);

	const urls = processingUrls || { trusted: [], ftd: [] };

	// Local UI state
	const [activeTab, setActiveTab] = useState("trusted");
	const [newUrls, setNewUrls] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const itemsPerPage = 5;

	// Fetch URLs for selected lead
	useEffect(() => {
		if (!isOpen || !lead?._id) return;
		dispatch(fetchProcessingUrls(lead._id))
			.unwrap()
			.catch((err) => {
				console.error(err);
				toast.error(err || "Failed to load processing URLs");
			});
	}, [dispatch, isOpen, lead?._id]);

	// Show error from Redux if any
	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	// Filter based on search
	const filtered = useMemo(() => {
		const list = urls[activeTab] || [];
		if (!search) return list;
		return list.filter((u) => u.toLowerCase().includes(search.toLowerCase()));
	}, [urls, activeTab, search]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
	const current = filtered.slice(
		(page - 1) * itemsPerPage,
		page * itemsPerPage
	);

	// Add new URLs
	const handleAdd = async () => {
		const parsed = newUrls
			.split("\n")
			.map((u) => u.trim())
			.filter((u) => u.length > 0);
		if (!parsed.length) return toast.error("Enter valid URLs.");

		try {
			dispatch(
				addProcessingUrls({
					leadId: lead._id,
					urls: parsed,
					type: activeTab,
				})
			);
			toast.success("URLs added successfully");
			setNewUrls("");
			setPage(1);
		} catch (err) {
			console.error(err);
			toast.error("Failed to add URLs");
		}
	};

	// Delete one URL
	const handleDelete = async (url) => {
		try {
			dispatch(
				deleteProcessingUrl({
					leadId: lead._id,
					url,
					type: activeTab,
				})
			).unwrap();
			toast.success("Deleted successfully");
		} catch {
			console.error(err);
			toast.error("Failed to delete URL");
		}
	};

	// Download Excel by type
	const handleDownload = (type) => {
		window.open(
			`${CRM_API_BASE}/processing-urls/download/${lead._id}?type=${type}`,
			"_blank"
		);
	};

	if (!isOpen || !lead) return null;

	return (
		<dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
			{/* ✅ Mobile full-screen, desktop unchanged */}
			<div
				className="
          modal-box bg-base-100 dark:bg-gray-900 shadow-lg relative
          w-screen h-screen max-w-none rounded-2xl p-4
          sm:w-11/12 sm:max-w-3xl sm:h-auto sm:p-6
          overflow-y-auto
        "
			>
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
					<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
						<span className="break-words">
							Processing URLs — {lead.companyName}
						</span>

						{/* 🏷 Partner badge */}
						<span
							className={`badge ${
								lead.partner === "Dreamzpay"
									? "bg-blue-100 text-blue-700"
									: lead.partner === "Transactworld"
									? "bg-orange-100 text-orange-700"
									: "bg-gray-100 text-gray-700"
							} text-xs px-3 py-2 font-medium w-fit`}
						>
							{lead.partner || "Unknown Partner"}
						</span>
					</h3>

					<div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
						{/* ✅ Download buttons */}
						<button
							onClick={() => handleDownload("trusted")}
							className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none"
							title="Download Trusted Excel"
						>
							<FileSpreadsheet size={18} />
							<span className="ml-1">Trusted</span>
						</button>
						{lead.partner === "Dreamzpay" && (
							<button
								onClick={() => handleDownload("ftd")}
								className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
								title="Download FTD Excel"
							>
								<FileSpreadsheet size={18} />
								<span className="ml-1">FTD</span>
							</button>
						)}
						<button
							onClick={onClose}
							className="btn btn-sm btn-circle hover:bg-gray-200 hover:text-black transition-colors"
							title="Close"
						>
							<X size={18} />
						</button>
					</div>
				</div>

				{/* Tabs */}
				{/* Tabs — DaisyUI radio style */}
				<div className="tabs-box tabs mb-4">
					{/* Trusted tab */}
					<input
						type="radio"
						name="processing_tabs"
						className="tab"
						aria-label="Trusted"
						checked={activeTab === "trusted"}
						onChange={() => {
							setActiveTab("trusted");
							setPage(1);
						}}
					/>

					{/* FTD tab (only for Dreamzpay) */}
					{lead.partner === "Dreamzpay" && (
						<>
							<input
								type="radio"
								name="processing_tabs"
								className="tab"
								aria-label="FTD"
								checked={activeTab === "ftd"}
								onChange={() => {
									setActiveTab("ftd");
									setPage(1);
								}}
							/>
						</>
					)}
				</div>

				{/* Add URLs */}
				<div className="mb-4">
					<textarea
						className="textarea textarea-bordered w-full h-28 rounded-lg focus:ring-2 focus:ring-primary transition"
						placeholder="Paste URLs (one per line)..."
						value={newUrls}
						onChange={(e) => setNewUrls(e.target.value)}
					/>
					<button
						onClick={handleAdd}
						className="btn btn-primary w-full mt-3 rounded-lg"
						disabled={loading}
					>
						<Plus size={16} /> Add {activeTab === "trusted" ? "Trusted" : "FTD"}{" "}
						URLs
					</button>
				</div>

				{/* Search */}
				<div className="relative mb-4">
					<Search
						className="absolute left-3 top-1/2 z-10 -translate-y-1/2 w-5 text-gray-400"
						size={18}
					/>
					<input
						className="input input-bordered w-full pl-10 rounded-lg focus:ring-2 focus:ring-primary"
						placeholder={`Search ${activeTab.toUpperCase()} URLs...`}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</div>

				{/* List */}
				<div className="max-h-[55vh] sm:max-h-[45vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
					{loading ? (
						<p className="p-4 text-center text-gray-500">Loading...</p>
					) : current.length > 0 ? (
						current.map((url, i) => (
							<div
								key={i}
								className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
							>
								<div className="flex items-center gap-2 w-10/12 truncate">
									<LinkIcon size={16} className="text-blue-500 shrink-0" />
									<span className="truncate text-gray-700 dark:text-gray-300">
										{url}
									</span>
								</div>
								<div className="flex gap-2 shrink-0">
									<button
										onClick={() => navigator.clipboard.writeText(url)}
										className="btn btn-xs btn-ghost hover:bg-gray-200 dark:hover:bg-gray-700"
										title="Copy"
									>
										<Copy size={14} />
									</button>
									<button
										onClick={() => handleDelete(url)}
										className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
										title="Delete"
									>
										<Trash size={14} />
									</button>
								</div>
							</div>
						))
					) : (
						<p className="p-4 text-center text-gray-500">No URLs found</p>
					)}
				</div>

				{/* Pagination */}
				{filtered.length > itemsPerPage && (
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-4 text-sm">
						<span className="text-gray-600 dark:text-gray-400 order-1 sm:order-none text-center sm:text-left">
							Page {page} of {totalPages} :- Total{" "}
							{urls[activeTab]?.length || 0}
						</span>

						<div className="flex justify-between sm:justify-end gap-2 order-2 sm:order-none">
							<button
								onClick={() => setPage((p) => Math.max(p - 1, 1))}
								disabled={page === 1}
								className="btn btn-sm btn-outline rounded-lg w-1/2 sm:w-auto"
							>
								Prev
							</button>
							<button
								onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
								disabled={page === totalPages}
								className="btn btn-sm btn-outline rounded-lg w-1/2 sm:w-auto"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>
		</dialog>
	);
};

export default LeadUrlModal;
