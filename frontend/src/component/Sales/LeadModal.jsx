import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function LeadModal({
  isLoading,
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create",
}) {
  const initialFormData = {
    leadSource: "",
    partner: "",
    companyName: "",
    legalName: "",
    companyWebsite: "",
    username: "",
    companyEmail: "",
    status: "Open",
    subStatus: "Under Discussion",
    monthlyDealSize: "",
    dealOwner: "",
    contactName: "",
    companyNotes: "",
    remarks: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ ...initialFormData, ...initialData });
    } else {
      setFormData(initialFormData);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.monthlyDealSize < 0) {
      toast.error("Monthly deal size should not be negative");
    }

    const payload =
      mode === "create"
        ? {
            ...formData,
            status: formData.status || "Open",
            subStatus: formData.subStatus || "Under Discussion",
          }
        : { ...formData };

    await onSubmit(payload);

    onClose();
    setFormData(initialFormData);

    if (!isOpen) return null;
  };

  return (
    <dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
      {/* ✅ Desktop stays EXACTLY same, only mobile becomes full-screen */}
      <div
        className="
          modal-box w-11/12 max-w-3xl
          max-sm:w-screen max-sm:h-screen max-sm:max-w-none
          max-sm:rounded-2xl max-sm:m-0
        "
      >
        <h3 className="font-bold text-xl mb-6 text-center">
          {mode === "edit" ? "Edit" : "Add"} Lead
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <>
              {/* Lead Source */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lead Source
                </label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select source</option>
                  <option value="Website">Website</option>
                  <option value="Email Campaign">Email Campaign</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>
              {/* Partner */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Partner
                </label>
                <select
                  name="partner"
                  value={formData.partner}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select Partner</option>
                  <option value="Dreamzpay">Dreamzpay</option>
                  <option value="Transactworld">Transactworld</option>
                </select>
              </div>
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name (DBA)
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              {/* Legal Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Legal Name
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              {/* Company Website */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Website
                </label>
                <input
                  type="text"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="input input-bordered w-full"
                />
              </div>
              {/* Username or Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username or email"
                  className="input input-bordered w-full"
                />
              </div>
              {/* Company Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Email
                </label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className="input input-bordered w-full"
                />
              </div>
              {/* Monthly Deal Size */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Monthly Deal Size
                </label>
                <input
                  type="number"
                  name="monthlyDealSize"
                  value={formData.monthlyDealSize}
                  onChange={handleChange}
                  placeholder="Enter deal size in USD"
                  className="input input-bordered w-full"
                  min={0}
                />
              </div>
              {/* Deal Owner */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Deal Owner
                </label>
                <input
                  type="text"
                  name="dealOwner"
                  value={formData.dealOwner}
                  onChange={handleChange}
                  placeholder="Enter deal owner's name"
                  className="input input-bordered w-full"
                />
              </div>
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Enter primary contact"
                  className="input input-bordered w-full"
                />
              </div>
              {/* Company Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Company Notes
                </label>
                <textarea
                  name="companyNotes"
                  value={formData.companyNotes}
                  onChange={handleChange}
                  placeholder="Enter notes about the company"
                  className="textarea textarea-bordered w-full"
                />
              </div>
              {/* Remarks */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Any additional remarks"
                  className="textarea textarea-bordered w-full"
                />
              </div>{" "}
            </>
          </div>

          {/* Actions */}
          <div className="modal-action justify-end">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading
                ? mode === "edit"
                  ? "Updating..."
                  : "Saving..."
                : mode === "edit"
                ? "Update Lead"
                : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default LeadModal;
