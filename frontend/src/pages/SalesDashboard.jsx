import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash, Pen, Check, X } from "lucide-react";
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

function SalesDashboard() {
  const dispatch = useDispatch();
  const leads = useSelector(selectLeads);
  const loading = useSelector(selectSalesLoading);

  const currentUser = useSelector(selectCurrentUser);

  // Role based permission
  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // Search
  const [search, setSearch] = useState("");

  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 4;

  const [modalOpen, setModalOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Fetch leads on mount
  useEffect(() => {
    dispatch(fetchLeads())
      .unwrap()
      .catch((err) => toast.error(err || "Failed to load leads"));
  }, [dispatch]);

  // Filtered Search results
  const filteredLeads = useMemo(() => {
    // if no search return all the data
    if (!search.trim()) return leads;

    const q = search.toLowerCase();

    // See if any field in lead matches the search term
    return leads.filter((l) => {
      return (
        (l.companyName && l.companyName.toLowerCase().includes(q)) ||
        (l.companyEmail && l.companyEmail.toLowerCase().includes(q)) ||
        (l.companyMobileNo &&
          String(l.companyMobileNo).toLowerCase().includes(q)) ||
        (l.leadSource && l.leadSource.toLowerCase().includes(q)) ||
        (l.partner && l.partner.toLowerCase().includes(q)) ||
        (l.status && l.status.toLowerCase().includes(q)) ||
        (l.subStatus && l.subStatus.toLowerCase().includes(q)) ||
        (l.dealOwner && l.dealOwner.toLowerCase().includes(q)) ||
        (l.contactName && l.contactName.toLowerCase().includes(q))
      );
    });
  }, [leads, search]);

  // Pagination on filtered results
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / leadsPerPage)
  );
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;

  const currentLeads = useMemo(
    () => filteredLeads.slice(indexOfFirstLead, indexOfLastLead),
    [filteredLeads, indexOfFirstLead, indexOfLastLead]
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
        error.response?.data || error.message
      );
      toast.error("Failed to submit lead.");
    }
  };

  // Update Status of a lead
  const handleLeadStatusChange = async (leadId, newStatus) => {
    console.log("function ran ");
    try {
      const { message } = await dispatch(
        updateStatus({ id: leadId, status: newStatus })
      ).unwrap();
      toast.success(message || `Lead status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
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
        updateLead({ id, data: payload })
      ).unwrap();
      toast.success(message || "Lead updated");
      setEditOpen(false);
      setEditingLead(null);
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Update failed"
      );
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
          <div className="relative w-full md:w-1/2 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search leads by name or email or partner..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <InfoTooltip message="You can search leads by company name, email, phone, source, partner, status, sub-status, deal owner, or contact name." />
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg">
          <table className="min-w-max w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 px-4">Lead Name</th>
                <th className="py-2 px-4">Contact</th>
                <th className="py-2 px-4">Source</th>
                <th className="py-2 px-4">Partner</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">SubStatus</th>
                <th className="py-2 px-4">Lead Workflow</th>
                <th className="py-2 px-4">Value</th>
                <th className="py-2 px-4">Created Date</th>
                {hasPermission && <th className="py-2 px-4">Actions</th>}
                <th className="py-2 px-4">Processing</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead) => {
                // For the active and inactive button
                const canShowToggle =
                  ["Open", "Active", "Inactive"].includes(lead.status) &&
                  ["Signed Contract & Complete", "Annexture"].includes(
                    lead.subStatus
                  );

                return (
                  <tr key={lead._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {lead.companyName}
                    </td>
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold
      ${
        lead.status === "Open"
          ? "bg-yellow-100 text-yellow-800"
          : lead.status === "Active"
          ? "bg-green-100 text-green-800"
          : lead.status === "Inactive"
          ? "bg-red-100 text-red-800"
          : lead.status === "Suspended"
          ? "bg-gray-200 text-gray-700"
          : "bg-gray-100 text-gray-800"
      }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs ${
                          lead?.status === "Open" ||
                          lead?.status === "Active" ||
                          lead?.status === "Inactive"
                            ? "bg-yellow-100 text-yellow-800"
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
                    <td className="py-3 px-4">
                      ${lead.monthlyDealSize.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    {/* Actions */}
                    {hasPermission && (
                      <td className="py-3 px-4 flex justify-center items-center">
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingLead(lead); // prefill from store
                            setEditOpen(true);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:scale-95 transition-all duration-150 cursor-pointer"
                          title="Edit Lead"
                          aria-label="Edit Lead"
                        >
                          <Pen className="w-4 h-4" />
                        </button>
                      </td>
                    )}

                    <td className="p-3 text-center relative">
                      {canShowToggle && (
                        <div className="dropdown dropdown-end">
                          <div
                            tabIndex={0}
                            role="button"
                            className={`btn btn-sm w-28 flex justify-center items-center gap-2 ${
                              (lead.status || "Inactive") === "Active"
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          >
                            {loading ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              lead.status || "Inactive"
                            )}
                          </div>

                          {!loading && (
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-28 z-[9999]"
                              style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                              }}
                            >
                              <li>
                                <button
                                  onClick={() =>
                                    handleLeadStatusChange(lead._id, "Active")
                                  }
                                  className="text-green-600 hover:bg-green-100"
                                >
                                  Active
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() =>
                                    handleLeadStatusChange(lead._id, "Inactive")
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
                  </tr>
                );
              })}
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
