import { useEffect, useMemo, useState } from "react";
import {
	Plus,
	Search,
	Trash,
	Pen,
	Check,
	X,
	Link2,
	FileSpreadsheet,
	MoreVertical,
	CircleDollarSign,
	CheckCircle,
	XCircle,
	Loader,
} from "lucide-react";
import LeadModal from "../component/Sales/LeadModal";
import LeadWorkflowModal from "../component/Sales/LeadWorkflowModal";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
	createLead,
	deleteLead,
	fetchLeads,
	selectLeads,
	selectSalesLoading,
	updateStatus,
} from "../store/slices/Sales.slice";
import { updateLead } from "../store/thunks/Sales.thunks.js";
import { selectCurrentUser } from "../store/slices/Auth.slice";
import InfoTooltip from "../component/InfoTooltip";
import LeadUrlModal from "../component/Sales/LeadUrlModal.jsx";
import { CRM_API_BASE } from "../config.js";
import CurrencySettingsModal from "../component/Sales/CurrencySettingsModal.jsx";
import AcquirerWorkflowModal from "../component/Sales/AcquirerWorkflowModal.jsx";

import AcquirerFormModal from "../component/Sales/AcquirerModal.jsx";
import AddEntityModal from "../component/Sales/AddEntityModal.jsx";
import {
	createAcquirer,
	fetchAcquirers,
	updateAcquirer,
	deleteAcquirer,
	fetchEntities,
	addEntities,
	deleteEntity,
} from "../store/thunks/Acquirer.thunks.js";

import {
	selectAcquirers,
	selectAcquirerLoading,
	selectAcquirerLoaded,
} from "../store/slices/Acquirer.slice.js";

import {
	selectEntities,
	selectEntityLoading,
} from "../store/slices/Entity.slice.js";
import downloadExcel from "../utils/downloadExcel.js";

const TableLoader = ({ columns = 7, message = "Loading..." }) => (
	<tr>
		<td colSpan={columns} className="py-10">
			<div className="flex flex-col items-center justify-center gap-3">
				<span className="loading loading-spinner loading-md text-primary"></span>
				<p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
			</div>
		</td>
	</tr>
);

function SalesDashboard() {
	const dispatch = useDispatch();
	const leads = useSelector(selectLeads);
	const loading = useSelector(selectSalesLoading);

	const currentUser = useSelector(selectCurrentUser);

	// acquirer selector
	const acquirers = useSelector(selectAcquirers);
	const acquirerLoading = useSelector(selectAcquirerLoading);
	const acquirerLoaded = useSelector(selectAcquirerLoaded);

	// Entity selector
	const entitiesFromDB = useSelector(selectEntities);
	const entityLoading = useSelector(selectEntityLoading);

	const [loadingLeadId, setLoadingLeadId] = useState(null);

	// Role based permission
	const hasPermission =
		currentUser?.role === "admin" || currentUser?.role === "superadmin";

	// Search
	const [search, setSearch] = useState("");

	// UI state
	const [currentPage, setCurrentPage] = useState(1);
	const leadsPerPage = 10;

	const [modalOpen, setModalOpen] = useState(false);
	const [workflowOpen, setWorkflowOpen] = useState(false);

	const [acquirerFormOpen, setAcquirerFormOpen] = useState(false);

	const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
	const [selectedLead, setSelectedLead] = useState(null);
	const [editOpen, setEditOpen] = useState(false);
	const [editingLead, setEditingLead] = useState(null);

	const [comboOpen, setComboOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("merchant");
	const [acquirerWorkflowOpen, setacquirerWorkflowOpen] = useState(false);

	const [entityModalOpen, setEntityModalOpen] = useState(false);

	// Fetch leads on mount
	useEffect(() => {
		dispatch(fetchLeads())
			.unwrap()
			.catch((err) => toast.error(err || "Failed to load leads"));
	}, [dispatch]);

	useEffect(() => {
		if (activeTab === "acquirer" && !acquirerLoaded) {
			dispatch(fetchAcquirers())
				.unwrap()
				.catch((err) => toast.error(err || "Failed to load acquirers"));
		}
	}, [activeTab, acquirerLoaded, dispatch]);

	useEffect(() => {
		if (activeTab === "acquirer") {
			dispatch(fetchEntities())
				.unwrap()
				.catch((err) => toast.error(err || "Failed to load entities"));
		}
	}, [activeTab, dispatch]);

	// Reset search when tab changes
	useEffect(() => {
		setSearch("");
		setCurrentPage(1);
	}, [activeTab]);

	// -------- SEARCH LOGIC --------

	// Merchant search
	const filteredMerchantLeads = useMemo(() => {
		if (!search.trim()) return leads;

		const q = search.toLowerCase();

		return leads.filter((l) => {
			return (
				l.partner !== "Acquirer" &&
				(l.companyName?.toLowerCase().includes(q) ||
					l.companyEmail?.toLowerCase().includes(q) ||
					String(l.companyMobileNo || "").includes(q) ||
					l.leadSource?.toLowerCase().includes(q) ||
					l.partner?.toLowerCase().includes(q) ||
					l.status?.toLowerCase().includes(q) ||
					l.subStatus?.toLowerCase().includes(q) ||
					l.dealOwner?.toLowerCase().includes(q) ||
					l.contactName?.toLowerCase().includes(q))
			);
		});
	}, [leads, search]);

	// Acquirer search
	const filteredAcquirers = useMemo(() => {
		if (!search.trim()) return acquirers;

		const q = search.toLowerCase();

		return acquirers.filter((a) => {
			return (
				a.bankName?.toLowerCase().includes(q) ||
				a.contactEmail?.toLowerCase().includes(q) ||
				a.contactPerson?.toLowerCase().includes(q) ||
				(Array.isArray(a.entityName) &&
					a.entityName.join(" ").toLowerCase().includes(q))
			);
		});
	}, [acquirers, search]);

	// Pick correct dataset
	const activeData =
		activeTab === "acquirer" ? filteredAcquirers : filteredMerchantLeads;

	// -------- PAGINATION --------

	const totalPages = Math.max(1, Math.ceil(activeData.length / leadsPerPage));

	const indexOfLastLead = currentPage * leadsPerPage;
	const indexOfFirstLead = indexOfLastLead - leadsPerPage;

	const currentLeads = useMemo(
		() => activeData.slice(indexOfFirstLead, indexOfLastLead),
		[activeData, indexOfFirstLead, indexOfLastLead],
	);

	// Keep page in range if the filter shrinks the list
	useEffect(() => {
		if (currentPage > totalPages) setCurrentPage(totalPages);
	}, [currentPage, totalPages]);

	// Create lead (from modal)
	const handleLeadSubmit = async (data) => {
		try {
			const { message } = await dispatch(createLead(data)).unwrap();
			toast.success(message || "Lead added successfully 🎉");
			setModalOpen(false);
		} catch (error) {
			console.error(
				"Error submitting form:",
				error,
				error.response?.data || error.message,
			);
			toast.error("Failed to submit lead.");
		}
	};

	// Update Status of a lead
	const handleLeadStatusChange = async (leadId, newStatus) => {
		try {
			setLoadingLeadId(leadId);
			const { message } = await dispatch(
				updateStatus({ id: leadId, status: newStatus }),
			).unwrap();
			toast.success(message || `Lead status updated to ${newStatus}`);
		} catch (err) {
			toast.error("Failed to update status");
			console.error(err);
		} finally {
			setLoadingLeadId(null); // stop spinner for this lead
		}
	};

	// Edit and update lead data
	const handleLeadUpdate = async (payload) => {
		const id = payload._id;

		if (!id) {
			toast.error("Missing lead id");
			return;
		}

		try {
			const { message } = await dispatch(
				updateLead({ id, data: payload }),
			).unwrap();
			toast.success(message || "Lead updated");
			setEditOpen(false);
			setEditingLead(null);
		} catch (err) {
			toast.error(
				typeof err === "string" ? err : err?.message || "Update failed",
			);
		}
	};

	const handleDeleteAcquirer = async (id) => {
		if (!window.confirm("Are you sure you want to delete this acquirer?"))
			return;

		try {
			const res = await dispatch(deleteAcquirer(id)).unwrap();
		} catch (err) {
			toast.error(err || "Delete failed");
		}
	};

	const handleLeadDelete = async (leadId) => {
		if (!leadId) return toast.error("Missing lead id");

		const ok = window.confirm("Are you sure you want to delete this lead?");
		if (!ok) return;

		try {
			const { message } = await dispatch(deleteLead(leadId)).unwrap();
			toast.success(message || "Deleted");
		} catch (err) {
			toast.error(
				typeof err === "string" ? err : err?.message || "Delete failed",
			);
		}
	};

	return (
		<div className="p-4 bg-gray-50 dark:bg-gray-800 min-h-screen">
			{/* Add Lead Button */}
			{/* <div className="flex justify-end mb-4"> */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
				<h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
					Lead Management
				</h1>
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
					{activeTab === "acquirer" && hasPermission && (
						<button
							onClick={() => setEntityModalOpen(true)}
							className="btn btn-outline btn-primary flex items-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Add Entity
						</button>
					)}
					<button
						onClick={() =>
							activeTab === "acquirer"
								? setAcquirerFormOpen(true)
								: setModalOpen(true)
						}
						className="btn btn-primary flex items-center gap-2"
					>
						<Plus className="w-4 h-4" />
						{activeTab === "acquirer" ? "Add Acquirer" : "Add Merchant"}
					</button>
				</div>
			</div>

			{/* Create */}
			<LeadModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				onSubmit={handleLeadSubmit}
			/>

			{/* Edit Lead Modal */}
			{editingLead && (
				<LeadModal
					isLoading={loading}
					isOpen={editOpen}
					onClose={() => {
						setEditOpen(false);
						setEditingLead(null);
					}}
					onSubmit={handleLeadUpdate}
					initialData={editingLead}
					mode="edit"
				/>
			)}
			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-black">
				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">Total Leads</h3>
					<p className="text-2xl font-bold">{leads?.length}</p>
					<p className="text-gray-400 text-xs">0 new this period</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">In Progress</h3>
					<p className="text-2xl font-bold">
						{leads?.filter((l) => l.status === "Open")?.length}
					</p>
					<p className="text-gray-400 text-xs">Active opportunities</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">Total Value</h3>
					<p className="text-2xl font-bold">
						$
						{leads
							.filter((l) => l.status === "Active")
							.reduce((sum, l) => sum + l.monthlyDealSize, 0)
							.toLocaleString()}
					</p>
					<p className="text-gray-400 text-xs">won</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">Conversion Rate</h3>
					<p className="text-2xl font-bold">
						{(() => {
							const totalLeads = leads.length;
							const activeLeads = leads.filter(
								(l) => l.status === "Active",
							).length;
							const conversionRate =
								totalLeads > 0 ? (activeLeads / totalLeads) * 100 : 0;
							return `${conversionRate.toFixed(1)}%`;
						})()}
					</p>
					<p className="text-gray-400 text-xs">
						{leads.filter((e) => e.status !== ("Open" || "Inactive")).length} of{" "}
						{leads?.length} leads won
					</p>
				</div>
			</div>
			{/* Lead Management Section */}
			<div className="bg-white rounded-xl shadow-sm p-4 dark:bg-gray-900">
				{/* Tabs */}
				<div className="tabs tabs-border mb-4 w-fit">
					<a
						className={`tab ${activeTab === "merchant" ? "tab-active" : ""}`}
						onClick={() => {
							setActiveTab("merchant");
							setCurrentPage(1);
						}}
					>
						Merchants
					</a>

					<a
						className={`tab ${activeTab === "acquirer" ? "tab-active" : ""}`}
						onClick={() => {
							setActiveTab("acquirer");
							setCurrentPage(1);
						}}
					>
						Acquirers
					</a>
				</div>
				{/* Search & Filters */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
					{/* 🔍 Search Input */}
					<div className="relative w-full md:w-1/2 flex items-center gap-2">
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
							<input
								type="text"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setCurrentPage(1);
								}}
								placeholder="Search leads by name or email or partner..."
								className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>

						<InfoTooltip message="You can search leads by company name, email, phone, source, partner, status, sub-status, deal owner, or contact name." />
					</div>

					{/* 📥 Download All Processing URLs */}

					<div className="flex flex-col w-full gap-2 sm:flex-row sm:justify-end sm:w-auto">
						<button
							onClick={() => {
								let data = [];
								let filename = "";

								if (activeTab === "merchant") {
									data = leads.map((lead) => ({
										Partner: lead.partner,
										Merchant: lead.companyName,
									}));
									filename = "Merchant_Partners.xlsx";
								} else if (activeTab === "acquirer") {
									acquirers.forEach((acq) => {
										const entities =
											Array.isArray(acq.entityName) && acq.entityName.length
												? acq.entityName
												: [""];
										entities.forEach((entity) => {
											data.push({
												Partner: acq.partnerName,
												Acquirer: acq.bankName,
												Entity: entity,
											});
										});
									});
									filename = "Acquirer_Partners.xlsx";
								}

								if (data.length === 0) {
									toast.error("No data to download");
									return;
								}

								downloadExcel(data, filename);
							}}
							className="btn btn-sm sm:btn-sm w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center justify-center gap-2"
						>
							<FileSpreadsheet size={18} />
							<span className="whitespace-nowrap">
								{activeTab === "merchant"
									? "Download Merchants"
									: "Download Acquirers"}
							</span>
						</button>

						{activeTab !== "acquirer" && (
							<button
								onClick={() =>
									window.open(
										`${CRM_API_BASE}/processing-urls/download-all`,
										"_blank",
									)
								}
								className="btn btn-sm sm:btn-sm w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center justify-center gap-2"
								title="Download all processing URLs"
							>
								<FileSpreadsheet size={18} />
								<span className="whitespace-nowrap">Download All URLs</span>
							</button>
						)}
					</div>
				</div>
				{/* Leads Table */}
				<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg overflow-y-visible border border-gray-200 dark:border-gray-700">
					<table className="min-w-max w-full text-left text-xs sm:text-sm text-black dark:text-white">
						<thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="py-2 px-4">Partner</th>
								{activeTab === "merchant" ? (
									<>
										<th className="py-2 px-4">Merchant</th>
										<th className="py-2 px-4">Status</th>
										<th className="py-2 px-4">SubStatus</th>
										<th className="py-2 px-4">Lead Workflow</th>
										<th className="py-2 px-4">Value</th>
										<th className="py-2 px-4">Created Date</th>
										<th className="py-2 px-4">Processing</th>
										<th className="py-2 px-4 text-center">More Actions</th>
									</>
								) : (
									<>
										<th className="py-2 px-4">Acquirer</th>
										<th className="py-2 px-4">Email</th>
										<th className="py-2 px-4">Contact</th>
										<th className="py-2 px-4">Entity</th>
										<th className="py-2 px-4">Status</th>
										<th className="py-2 px-4">Phases</th>
										<th className="py-2 px-4">Created Date</th>
										<th className="py-2 px-4">Actions</th>
									</>
								)}
							</tr>
						</thead>
						<tbody>
							{loading || (activeTab === "acquirer" && acquirerLoading) ? (
								<TableLoader
									columns={activeTab === "merchant" ? 9 : 7}
									message={
										activeTab === "acquirer"
											? "Loading acquirers..."
											: "Loading leads..."
									}
								/>
							) : currentLeads.length > 0 ? (
								currentLeads.map((lead, index) => {
									// For the active and inactive button
									const canShowToggle =
										["Open", "Active", "Inactive"].includes(lead.status) &&
										["Signed Contract & Complete", "Annexture"].includes(
											lead.subStatus,
										);

									return (
										<tr
											key={lead._id}
											className="bg-white border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900"
										>
											<td className="py-3 px-4">
												<span
													className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
	${
		(activeTab === "merchant" ? lead.partner : lead.partnerName) === "Dreamzpay"
			? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100"
			: (activeTab === "merchant" ? lead.partner : lead.partnerName) ===
				  "Transactworld"
				? "bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100"
				: (activeTab === "merchant" ? lead.partner : lead.partnerName) ===
					  "Visa"
					? "bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100"
					: (activeTab === "merchant" ? lead.partner : lead.partnerName) ===
						  "Mastercard"
						? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100"
						: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
	}`}
												>
													{activeTab === "merchant"
														? lead.partner
														: lead.partnerName}
												</span>
											</td>

											{/* Merchant Fields */}
											{activeTab === "merchant" && (
												<>
													{/* Merchant */}
													<td className="py-3 px-4 font-medium capitalize">
														{lead.companyName}
													</td>

													{/* Status */}
													<td className="py-3 px-4">
														<span
															className={`px-3 py-1 rounded-full text-xs font-semibold
																									${
																										lead.status === "Open"
																											? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
																											: lead.status === "Active"
																												? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
																												: lead.status ===
																													  "Inactive"
																													? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
																													: lead.status ===
																														  "Suspended"
																														? "bg-gray-200 text-gray-700"
																														: "bg-gray-100 text-gray-800"
																									}`}
														>
															{lead.status}
														</span>
													</td>

													{/* SubStatus */}
													<td className="py-3 px-4">
														<span
															className={`px-2 py-1 text-xs rounded-full ${
																lead?.status === "Open" ||
																lead?.status === "Active" ||
																lead?.status === "Inactive"
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
																	: "bg-red-100 text-red-800"
															}`}
														>
															{lead?.status === "Open" ||
															lead?.status === "Active" ||
															lead?.status === "Inactive"
																? `${lead.subStatus}`
																: "NA"}
														</span>
													</td>

													{/* Merchant Phases */}
													<td className="py-3 px-4">
														<button
															className="btn btn-primary btn-sm"
															onClick={() => {
																setSelectedLead(lead);
																setWorkflowOpen(true);
															}}
														>
															Phases
														</button>
													</td>

													{/* Merchant Deal Size */}
													<td className="py-3 px-4">
														${lead.monthlyDealSize?.toLocaleString?.() || 0}
													</td>

													{/* Created At */}
													<td className="py-3 px-4">
														{new Date(lead.createdAt).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "short",
																day: "numeric",
															},
														)}
													</td>

													{/* Merchant Processing */}
													<td className="p-3 text-center relative overflow-visible">
														{canShowToggle && (
															<div className="dropdown dropdown-left dropdown-end">
																{/* Trigger Button */}
																<div
																	tabIndex={0}
																	role="button"
																	className={`btn btn-sm w-20 flex justify-center items-center gap-2 ${
																		lead.status === "Active"
																			? "bg-green-500 border-green-500 text-white hover:bg-green-600"
																			: "bg-red-500 border-red-500 text-white hover:bg-red-600"
																	}`}
																>
																	{loadingLeadId === lead._id ? (
																		<span className="loading loading-spinner loading-xs"></span>
																	) : lead.status === "Open" ? (
																		"Inactive"
																	) : (
																		lead.status || "Inactive"
																	)}
																</div>

																{/* Dropdown Menu */}
																{!loading && (
																	<ul
																		tabIndex={0}
																		className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-28 z-[9999]"
																		style={{
																			marginBottom: "0.25rem", // gives breathing room from header
																		}}
																	>
																		<li>
																			<button
																				onClick={() =>
																					handleLeadStatusChange(
																						lead._id,
																						"Active",
																					)
																				}
																				className="text-green-600 hover:bg-green-100"
																			>
																				Active
																			</button>
																		</li>
																		<li>
																			<button
																				onClick={() =>
																					handleLeadStatusChange(
																						lead._id,
																						"Inactive",
																					)
																				}
																				className="text-red-600 hover:bg-red-100"
																			>
																				Inactive
																			</button>
																		</li>
																	</ul>
																)}
															</div>
														)}
													</td>

													{/* Merchant More Action */}
													<td className="p-3 text-center relative overflow-visible z-[50]">
														<div
															className={`dropdown dropdown-left ${
																index === 0 ? "dropdown-center" : "dropdown-end"
															} relative z-[60]`}
														>
															{/* Trigger Button (The three dots) - This remains visible to ALL users */}
															<div
																tabIndex={0}
																role="button"
																className="btn btn-sm btn-ghost p-1 text-gray-500 hover:text-gray-800 dark:text-gray-100 dark:hover:text-gray-200"
																title="More actions"
															>
																<MoreVertical className="w-5 h-5" />
															</div>

															{/* Dropdown Menu Content */}
															<ul
																tabIndex={0}
																className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 text-xs z-[9999]"
															>
																{hasPermission && (
																	<li>
																		<button
																			onClick={() => {
																				setEditingLead(lead);
																				setEditOpen(true);
																			}}
																			className="flex items-center"
																		>
																			<Pen className="w-4 h-4 mr-2" />
																			Edit Lead
																		</button>
																	</li>
																)}
																{/* 2. Add URLs Action - VISIBLE ONLY IF hasPermission is TRUE */}
																{hasPermission && (
																	<li>
																		<button
																			onClick={() => {
																				setSelectedLead(lead);
																				setIsUrlModalOpen(true);
																			}}
																			className="flex items-center"
																		>
																			<Link2 className="w-4 h-4 mr-2" />
																			URLs
																		</button>

																		<button
																			onClick={() => {
																				setSelectedLead(lead);
																				setComboOpen(true);
																			}}
																			className="flex items-center"
																		>
																			<CircleDollarSign className="w-4 h-4 mr-2" />
																			Currency
																		</button>

																		<button
																			onClick={() => handleLeadDelete(lead._id)}
																			className="flex items-center text-red-500"
																		>
																			<Trash className="w-4 h-4 mr-2" />
																			Delete
																		</button>
																	</li>
																)}
																{/* The 'Processing' column (toggle button) outside this dropdown already has its own logic. */}
															</ul>
														</div>
													</td>
												</>
											)}

											{/* ===== ACQUIRER FIELDS ===== */}
											{activeTab === "acquirer" && (
												<>
													{/* Acquirer Bankname */}
													<td className="py-3 px-4">{lead.bankName || "-"}</td>

													{/* Acquirer BankEmail */}
													<td className="py-3 px-4">
														{lead.contactEmail || "-"}
													</td>

													{/* Acquirer Contact */}
													<td className="py-3 px-4">
														{lead.contactPerson || "-"}
													</td>

													{/* Acquirer Entity */}
													<td className="py-3 px-4 relative">
														{Array.isArray(lead.entityName) &&
														lead.entityName.length > 0 ? (
															<div className="inline-block">
																{/* Show first item */}
																<span>{lead.entityName[0]}</span>

																{/* Show +N if more */}
																{lead.entityName.length > 1 && (
																	<div className="dropdown inline-block ml-2">
																		<label
																			tabIndex={0}
																			className="cursor-pointer text-blue-500"
																		>
																			+{lead.entityName.length - 1}
																		</label>

																		{/* Dropdown content */}
																		<ul
																			tabIndex={0}
																			className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 mt-1 border"
																		>
																			{lead.entityName
																				.slice(1)
																				.map((entity, idx) => (
																					<li
																						key={idx}
																						className="px-2 py-1 hover:bg-gray-100 rounded"
																					>
																						{entity}
																					</li>
																				))}
																		</ul>
																	</div>
																)}
															</div>
														) : (
															"—"
														)}
													</td>

													{/* Acquirer status  */}
													<td className="py-3 px-4">
														<span
															className={`px-3 py-1 rounded-full text-xs font-semibold ${
																lead.status === "Active"
																	? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
																	: lead.status === "Inactive"
																		? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
																		: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
															}`}
														>
															{lead.status || "Processing"}
														</span>
													</td>

													{/* Acquirer Phases */}
													<td className="py-3 px-4">
														<button
															className="btn btn-primary btn-sm"
															onClick={() => {
																setSelectedLead(lead);
																setacquirerWorkflowOpen(true);
															}}
														>
															Acquirer Phases
														</button>
													</td>

													{/* Created Date */}
													<td className="py-3 px-4">
														{new Date(lead.createdAt).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "short",
																day: "numeric",
															},
														)}
													</td>

													{/* Acquirer Actions */}
													<td className="py-3 px-4 text-center">
														<div className="flex justify-center gap-3">
															<td>
																<div className="dropdown dropdown-end ">
																	<label
																		tabIndex={0}
																		className="cursor-pointer"
																	>
																		{lead.status === "Active" ? (
																			<CheckCircle className="w-5 h-5 text-green-600" />
																		) : lead.status === "Inactive" ? (
																			<XCircle className="w-5 h-5 text-red-600" />
																		) : (
																			<Loader className="w-5 h-5 text-yellow-500 animate-spin" />
																		)}
																	</label>

																	<ul
																		tabIndex={0}
																		className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40"
																	>
																		<li>
																			<button
																				onClick={() =>
																					dispatch(
																						updateAcquirer({
																							id: lead._id,
																							data: { status: "Processing" },
																						}),
																					)
																				}
																			>
																				Processing
																			</button>
																		</li>

																		<li>
																			<button
																				onClick={() =>
																					dispatch(
																						updateAcquirer({
																							id: lead._id,
																							data: { status: "Active" },
																						}),
																					)
																				}
																			>
																				Active
																			</button>
																		</li>

																		<li>
																			<button
																				onClick={() =>
																					dispatch(
																						updateAcquirer({
																							id: lead._id,
																							data: { status: "Inactive" },
																						}),
																					)
																				}
																			>
																				Inactive
																			</button>
																		</li>
																	</ul>
																</div>
															</td>

															{/* ✏️ Edit */}
															<button
																onClick={() => {
																	setEditingLead(lead);
																	setAcquirerFormOpen(true);
																}}
																className="text-blue-600 cursor-pointer hover:text-blue-800"
																title="Edit Acquirer"
															>
																<Pen className="w-4 h-4" />
															</button>

															{/* 🗑 Delete */}
															<button
																onClick={() => handleDeleteAcquirer(lead._id)}
																className="text-red-600 cursor-pointer hover:text-red-800"
																title="Delete Acquirer"
															>
																<Trash className="w-4 h-4" />
															</button>
														</div>
													</td>
												</>
											)}
										</tr>
									);
								})
							) : (
								<tr>
									<td
										colSpan={9}
										className="text-center py-6 text-gray-500 dark:text-gray-400"
									>
										<div className="flex flex-col items-center gap-2">
											<span className="text-base font-medium">
												No leads found
											</span>
											<p className="text-sm opacity-70">
												{search && "Try adjusting your search"}
											</p>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				{/* Pagination Controls */}
				<div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<button
						onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1}
						className="
      w-full sm:w-auto
      px-4 py-2 border rounded-lg disabled:opacity-50
      text-sm sm:text-base
    "
					>
						Previous
					</button>

					<span className="text-sm sm:text-base text-center w-full sm:w-auto">
						Page {currentPage} of {totalPages}
					</span>

					<button
						onClick={() =>
							setCurrentPage((prev) => Math.min(prev + 1, totalPages))
						}
						disabled={currentPage === totalPages}
						className="
      w-full sm:w-auto
      px-4 py-2 border rounded-lg disabled:opacity-50
      text-sm sm:text-base
    "
					>
						Next
					</button>
				</div>
			</div>

			{/* Single Global Workflow Modal */}
			{workflowOpen && selectedLead && (
				<LeadWorkflowModal
					isOpen={workflowOpen}
					onClose={() => setWorkflowOpen(false)}
					lead={selectedLead}
				/>
			)}

			{/* Processing URL */}
			{isUrlModalOpen && selectedLead && (
				<LeadUrlModal
					isOpen={isUrlModalOpen}
					onClose={() => setIsUrlModalOpen(false)}
					lead={selectedLead}
				/>
			)}

			{/* Payment Currency */}
			{comboOpen && selectedLead && (
				<>
					<CurrencySettingsModal
						isOpen={comboOpen}
						onClose={() => setComboOpen(false)}
						lead={selectedLead}
					/>
				</>
			)}

			{/* Acquire Workflow Modal */}
			{acquirerWorkflowOpen && selectedLead && (
				<AcquirerWorkflowModal
					isOpen={acquirerWorkflowOpen}
					onClose={() => setacquirerWorkflowOpen(false)}
					acquirer={selectedLead}
				/>
			)}

			{/* Acquire Field   */}
			{acquirerFormOpen && (
				<AcquirerFormModal
					isOpen={acquirerFormOpen}
					onClose={() => {
						setAcquirerFormOpen(false);
						setEditingLead(null);
					}}
					onSubmit={(data) => {
						if (editingLead?._id) {
							dispatch(updateAcquirer({ id: editingLead._id, data }));
						} else {
							dispatch(createAcquirer(data));
						}
					}}
					initialData={editingLead} // ✅ pass data for edit
					mode={editingLead ? "edit" : "create"}
					partnerOptions={["Transactworld", "Dreamzpay"]}
					entityOptions={entitiesFromDB}
				/>
			)}

			{/* Add Entity */}
			{entityModalOpen && (
				<AddEntityModal
					isOpen={entityModalOpen}
					onClose={() => setEntityModalOpen(false)}
					existingEntities={entitiesFromDB}
					onSubmit={(entities) => {
						dispatch(addEntities(entities))
							.unwrap()

							.catch((err) => toast.error(err || "Failed to add entities"));
					}}
					onDelete={(entity) => {
						dispatch(deleteEntity(entity))
							.unwrap()

							.catch((err) => toast.error(err || "Delete failed"));
					}}
				/>
			)}
		</div>
	);
}

export default SalesDashboard;
