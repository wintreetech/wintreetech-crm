import React, { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import LeadModal from "../component/Sales/LeadModal";
import LeadWorkflowModal from "../component/Sales/LeadWorkflowModal";
import axios from "axios";
import toast from "react-hot-toast";
function SalesDashboard() {
	const [currentPage, setCurrentPage] = useState(1);
	const leadsPerPage = 4;

	const [modalOpen, setModalOpen] = useState(false);
	const [workflowOpen, setWorkflowOpen] = useState(false);
	const [selectedLead, setSelectedLead] = useState(null);
	const [leads, setLeads] = useState([]);
	const [avatarOpen, setAvatarOpen] = useState(false);

	// Calculate indices
	const indexOfLastLead = currentPage * leadsPerPage;
	const indexOfFirstLead = indexOfLastLead - leadsPerPage;
	const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);

	const totalPages = Math.ceil(leads.length / leadsPerPage);

	const fetchLeads = async () => {
		try {
			const res = await axios.get("http://localhost:3939/api/v1/sales");
			setLeads(res.data.data.reverse()); // make sure your API returns { data: [...] }
		} catch (error) {
			console.error("Error fetching leads:", error);
			toast.error("Failed to load leads");
		}
	};

	// ✅ Fetch leads when component mounts
	useEffect(() => {
		fetchLeads();
	}, []);

	// ✅ Handle form submit (create lead)
	const handleLeadSubmit = async (data) => {
		try {
			const payload = {
				...data,
				monthlyDealSize: Number(data.monthlyDealSize),
			};

			const response = await axios.post(
				"http://localhost:3939/api/v1/sales",
				payload
			);

			// Append new lead to list without refetching entire data
			setLeads((prev) => [...prev, response.data.data]);

			toast.success("Lead added successfully 🎉");
			fetchLeads();
			setModalOpen(false);
		} catch (error) {
			console.error(
				"Error submitting form:",
				error.response?.data || error.message
			);
			toast.error("Failed to submit lead.");
		}
	};

	const updateLeadStatus = async (leadId, newStatus) => {
		try {
			const response = await axios.patch(
				`http://localhost:3939/api/v1/sales/${leadId}`,
				{ status: newStatus }
			);

			// Update local leads state
			setLeads((prev) =>
				prev.map((lead) =>
					lead._id === leadId ? { ...lead, status: newStatus } : lead
				)
			);

			toast.success(`Lead status updated to ${newStatus}`);
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error("Failed to update status");
		}
	};

	return (
		<div className="p-4 bg-gray-50 min-h-screen">
			{/* Add Lead Button */}
			<div className="flex justify-end mb-4">
				<button
					onClick={() => setModalOpen(true)}
					className="btn btn-primary flex items-center gap-2"
				>
					<Plus className="w-4 h-4" />
					Add Lead
				</button>

				<LeadModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					onSubmit={handleLeadSubmit}
				/>
			</div>
			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div className="bg-white rounded-xl p-4 shadow-sm">
					<h3 className="text-gray-500 text-sm">Total Leads</h3>
					<p className="text-2xl font-bold">{leads?.length}</p>
					<p className="text-gray-400 text-xs">0 new this period</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm">
					<h3 className="text-gray-500 text-sm">In Progress</h3>
					<p className="text-2xl font-bold">
						{leads?.filter((l) => l.status !== "lost")?.length}
					</p>
					<p className="text-gray-400 text-xs">Active opportunities</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm">
					<h3 className="text-gray-500 text-sm">Total Value</h3>
					<p className="text-2xl font-bold">
						$
						{leads
							.reduce((sum, l) => sum + l.monthlyDealSize, 0)
							.toLocaleString()}
					</p>
					<p className="text-gray-400 text-xs">$0 won</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm">
					<h3 className="text-gray-500 text-sm">Conversion Rate</h3>
					<p className="text-2xl font-bold">0%</p>
					<p className="text-gray-400 text-xs">
						0 of {leads?.length} leads won
					</p>
				</div>
			</div>
			{/* Lead Management Section */}
			<div className="bg-white rounded-xl shadow-sm p-4">
				<h2 className="text-lg font-semibold mb-4">Lead Management</h2>

				{/* Search & Filters */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
					<div className="relative w-full">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search leads by name or email..."
							className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				{/* Leads Table */}
				<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg">
					<table className="min-w-max text-left text-xs sm:text-sm">
						<thead>
							<tr className="text-gray-500 border-b">
								<th className="py-2 px-4">Lead Name</th>
								<th className="py-2 px-4">Contact</th>
								<th className="py-2 px-4">Source</th>
								<th className="py-2 px-4">Partner</th>
								<th className="py-2 px-4">Status</th>
								<th className="py-2 px-4">SubStatus</th>
								<th className="py-2 px-4">Lead Workflow</th>
								<th className="py-2 px-4 hidden md:table-cell">Value</th>
								<th className="py-2 px-4 hidden md:table-cell">Created Date</th>
								<th className="p-3 border-b font-medium hidden sm:table-cell">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{currentLeads.map((lead) => (
								<tr key={lead._id} className="border-b hover:bg-gray-50">
									<td className="py-3 px-4 font-medium">{lead.companyName}</td>
									<td className="py-3 px-4 text-gray-600">
										{lead.companyEmail} <br /> {lead.companyMobileNo}
									</td>
									<td className="py-3 px-4">
										<span className="px-1 sm:px-2 py-1 rounded-full text-[10px] sm:text-xs md:text-sm">
											{lead.leadSource}
										</span>
									</td>
									<td className="py-3 px-4">
										<span className="px-1  rounded-full text-[10px] sm:text-xs md:text-sm">
											{lead.partner}
										</span>
									</td>
									<td className="py-3 px-4">
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												lead.status === "Open"
													? "bg-yellow-100 text-yellow-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{lead.status}
										</span>
									</td>
									<td className="py-3 px-4">
										<span
											className={`px-2 py-1 text-xs ${
												lead.status === "Open"
													? "bg-yellow-100 text-yellow-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{lead?.status === "Open" ? `${lead.subStatus}` : "NA"}
										</span>
									</td>
									<td className="py-3 px-4">
										<button
											className="btn btn-primary btn-sm "
											onClick={() => {
												setSelectedLead(lead);
												setWorkflowOpen(true);
											}}
										>
											View Lead Workflow
										</button>
									</td>
									<td className="py-3 px-4 hidden md:table-cell">
										${lead.monthlyDealSize.toLocaleString()}
									</td>
									<td className="py-3 px-4 hidden md:table-cell">
										{new Date(lead.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</td>
									{/* Actions */}
									<td className="p-3 hidden sm:flex gap-2">
										{lead.status === "Open" &&
											lead.subStatus === "Annexture" && (
												<>
													<button
														onClick={() => updateLeadStatus(lead._id, "Active")}
														className="px-2 py-1 bg-gray-100 rounded text-gray-800 hover:bg-gray-200 transition"
													>
														✅
													</button>
													<button
														onClick={() =>
															updateLeadStatus(lead._id, "Suspended")
														}
														className="px-2 py-1 bg-gray-100 rounded text-gray-800 hover:bg-gray-200 transition"
													>
														❌
													</button>
												</>
											)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination Controls */}
				<div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
					<button
						onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1}
						className="px-3 py-1 border rounded-lg disabled:opacity-50"
					>
						Previous
					</button>
					<span className="text-sm">
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() =>
							setCurrentPage((prev) => Math.min(prev + 1, totalPages))
						}
						disabled={currentPage === totalPages}
						className="px-3 py-1 border rounded-lg disabled:opacity-50"
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
		</div>
	);
}

export default SalesDashboard;
