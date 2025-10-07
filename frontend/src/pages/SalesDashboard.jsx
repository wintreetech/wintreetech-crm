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

	// ✅ Fetch leads when component mounts
	useEffect(() => {
		const fetchLeads = async () => {
			try {
				const res = await axios.get("http://localhost:3939/api/v1/sales");
				setLeads(res.data.data.reverse()); // make sure your API returns { data: [...] }
			} catch (error) {
				console.error("Error fetching leads:", error);
				toast.error("Failed to load leads");
			}
		};

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

	const handleStatusUpdate = (newStatus) => {
		console.log(`Lead ${selectedLead?.companyName} status updated:`, newStatus);
		// Call API to update lead status
	};

	const handleDocumentUpload = (statusKey, file) => {
		console.log(
			`File uploaded for ${selectedLead?.companyName}, step: ${statusKey}`,
			file
		);
		// Call API to upload document
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
					<div className="relative w-full md:w-1/2">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search leads by name or email..."
							className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="flex gap-2">
						<button className="border rounded-lg px-3 py-2 flex items-center gap-2">
							<Filter className="w-4 h-4" />
							All Status
						</button>
						<button className="border rounded-lg px-3 py-2">
							Date Created
						</button>
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
							</tr>
						</thead>
						<tbody>
							{currentLeads.map((lead) => (
								<tr key={lead.id} className="border-b hover:bg-gray-50">
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
												lead.status === "status"
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
												lead.status === "open"
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
					onUpdateStatus={handleStatusUpdate}
					onUploadDocument={handleDocumentUpload}
				/>
			)}
		</div>
	);
}

export default SalesDashboard;
