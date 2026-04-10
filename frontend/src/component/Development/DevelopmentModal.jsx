import { useEffect, useState } from "react";

const initialFormState = {
  companyName: "",
  website: "",
  registrarPlatform: "",
  address: "",
  companyDirector: "",
  landline: "",
  mainIp: "",
  merchantCountry: "",
  expiredOn: "",
};

const formatDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

function DevelopmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create",
  isLoading = false,
}) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        ...initialFormState,
        ...initialData,
        expiredOn: formatDateForInput(initialData.expiredOn),
      });
      return;
    }

    setFormData(initialFormState);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSubmit({
      ...formData,
      expiredOn: formData.expiredOn || null,
    });
  };

  if (!isOpen) return null;

  return (
    <dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
      <div
        className="
          modal-box w-11/12 max-w-4xl
          max-sm:w-screen max-sm:h-screen max-sm:max-w-none
          max-sm:rounded-2xl max-sm:m-0
        "
      >
        <h3 className="font-bold text-xl mb-6 text-center">
          {mode === "edit" ? "Edit" : "Add"} Development Record
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Name
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

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Registrar Platform
              </label>
              <input
                type="text"
                name="registrarPlatform"
                value={formData.registrarPlatform}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Company Director
              </label>
              <input
                type="text"
                name="companyDirector"
                value={formData.companyDirector}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Landline</label>
              <input
                type="text"
                name="landline"
                value={formData.landline}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Main IP</label>
              <input
                type="text"
                name="mainIp"
                value={formData.mainIp}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Merchant Country
              </label>
              <input
                type="text"
                name="merchantCountry"
                value={formData.merchantCountry}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Expired On
              </label>
              <input
                type="date"
                name="expiredOn"
                value={formData.expiredOn}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                rows={4}
              />
            </div>
          </div>

          <div className="modal-action justify-end">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading
                ? mode === "edit"
                  ? "Updating..."
                  : "Saving..."
                : mode === "edit"
                  ? "Update Record"
                  : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default DevelopmentModal;
