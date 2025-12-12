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

function SalesDashboard() {
  const dispatch = useDispatch();
  const leads = useSelector(selectLeads);
  const loading = useSelector(selectSalesLoading);

  const currentUser = useSelector(selectCurrentUser);

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
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [comboOpen, setComboOpen] = useState(false);

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
        error,
        error.response?.data || error.message
      );
      toast.error("Failed to submit lead.");
    }
  };

  // Update Status of a lead
  const handleLeadStatusChange = async (leadId, newStatus) => {
    try {
      setLoadingLeadId(leadId);
      const { message } = await dispatch(
        updateStatus({ id: leadId, status: newStatus })
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
    <div className="p-4 bg-gray-50 dark:bg-gray-800 min-h-screen">
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
                (l) => l.status === "Active"
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
        <h2 className="text-lg font-semibold mb-4">Lead Management</h2>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* 🔍 Search Input */}
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
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <InfoTooltip message="You can search leads by company name, email, phone, source, partner, status, sub-status, deal owner, or contact name." />
          </div>

          {/* 📥 Download All Processing URLs */}
          <div className="flex justify-end w-full md:w-auto">
            <button
              onClick={() =>
                window.open(
                  `${CRM_API_BASE}/processing-urls/download-all`,
                  "_blank"
                )
              }
              className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none"
              title="Download all processing URLs"
            >
              <FileSpreadsheet size={18} />
              <span className="ml-1">Download All URLs</span>
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg overflow-y-visible">
          <table className="min-w-max w-full text-left text-xs sm:text-sm text-black dark:text-white">
            <thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="py-2 px-4">Partner</th>
                <th className="py-2 px-4">Merchant</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">SubStatus</th>
                <th className="py-2 px-4">Lead Workflow</th>
                <th className="py-2 px-4">Value</th>
                <th className="py-2 px-4">Created Date</th>
                <th className="py-2 px-4">Processing</th>
                <th className="py-2 px-4 text-center">More Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead, index) => {
                // For the active and inactive button
                const canShowToggle =
                  ["Open", "Active", "Inactive"].includes(lead.status) &&
                  ["Signed Contract & Complete", "Annexture"].includes(
                    lead.subStatus
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
        lead.partner === "Dreamzpay"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100"
          : lead.partner === "Transactworld"
          ? "bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100"
          : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
      }
    `}
                      >
                        {lead.partner || "Unknown Partner"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium capitalize">
                      {lead.companyName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
      ${
        lead.status === "Open"
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
          : lead.status === "Active"
          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
          : lead.status === "Inactive"
          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
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
                            </li>
                          )}
                          {/* The 'Processing' column (toggle button) outside this dropdown already has its own logic. */}
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Payment */}

      {comboOpen && selectedLead && (
        <CurrencySettingsModal
          isOpen={comboOpen}
          onClose={() => setComboOpen(false)}
          lead={selectedLead}
        />
      )}
    </div>
  );
}

export default SalesDashboard;
