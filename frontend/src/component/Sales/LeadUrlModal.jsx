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
import api from "../../api";
import API_BASE_URL from "../../config";

const LeadUrlModal = ({ isOpen, onClose, lead }) => {
	if (!isOpen || !lead) return null;

	// 🌐 State management
	const [urls, setUrls] = useState({ trusted: [], ftd: [] });
	const [activeTab, setActiveTab] = useState("trusted");
	const [newUrls, setNewUrls] = useState("");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const itemsPerPage = 5;

	// ✅ Fetch URLs for selected lead
	useEffect(() => {
		if (!lead?._id) return;
		const fetchUrls = async () => {
			try {
				setLoading(true);
				const { data } = await api.get(`/processing-urls/${lead._id}`);
				setUrls({
					trusted: data?.data?.trustedUrls || [],
					ftd: data?.data?.ftdUrls || [],
				});
			} catch (err) {
				console.error(err);
				toast.error("Failed to load processing URLs");
			} finally {
				setLoading(false);
			}
		};
		fetchUrls();
	}, [lead]);

	// ✅ Filter based on search
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

	// ✅ Add new URLs
	const handleAdd = async () => {
		const parsed = newUrls
			.split("\n")
			.map((u) => u.trim())
			.filter((u) => /^https?:\/\//i.test(u));
		if (!parsed.length) return toast.error("Enter valid URLs.");

		try {
			setLoading(true);
			const { data } = await api.post(`/processing-urls/${lead._id}`, {
				urls: parsed,
				type: activeTab,
			});
			setUrls({
				trusted: data.data.trustedUrls,
				ftd: data.data.ftdUrls,
			});
			toast.success("URLs added successfully");
			setNewUrls("");
		} catch (err) {
			console.error(err);
			toast.error("Failed to add URLs");
		} finally {
			setLoading(false);
		}
	};

	// ✅ Delete one URL
	const handleDelete = async (url) => {
		try {
			const { data } = await api.delete(`/processing-urls/${lead._id}`, {
				data: { url, type: activeTab },
			});
			setUrls({
				trusted: data.data.trustedUrls,
				ftd: data.data.ftdUrls,
			});
			toast.success("Deleted successfully");
		} catch {
			toast.error("Failed to delete URL");
		}
	};

	// ✅ Download Excel by type
	const handleDownload = (type) => {
		window.open(
			`${API_BASE_URL}/processing-urls/download/${lead._id}?type=${type}`,
			"_blank"
		);
	};

	return (
		<dialog open={isOpen} className="modal">
			<div className="modal-box w-11/12 max-w-3xl bg-base-100 dark:bg-gray-900 rounded-2xl shadow-lg relative p-6">
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
						<span>Processing URLs — {lead.companyName}</span>

						{/* 🏷 Partner badge */}
						<span
							className={`badge ${
								lead.partner === "Dreamzpay"
									? "badge-primary"
									: lead.partner === "Transactworld"
									? "badge-success"
									: "badge-neutral"
							} text-white text-xs px-3 py-2 font-medium`}
						>
							{lead.partner || "Unknown Partner"}
						</span>
					</h3>
					<div className="flex items-center gap-2">
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
							className="btn btn-sm btn-circle hover:bg-red-500 hover:text-white transition-colors"
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
				<div className="max-h-[45vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
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
								<div className="flex gap-2">
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
					<div className="flex justify-between items-center mt-4 text-sm">
						<button
							onClick={() => setPage((p) => Math.max(p - 1, 1))}
							disabled={page === 1}
							className="btn btn-sm btn-outline rounded-lg"
						>
							Prev
						</button>
						<span className="text-gray-600 dark:text-gray-400">
							Page {page} of {totalPages}
						</span>
						<button
							onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
							disabled={page === totalPages}
							className="btn btn-sm btn-outline rounded-lg"
						>
							Next
						</button>
					</div>
				)}
			</div>
		</dialog>
	);
};

export default LeadUrlModal;
