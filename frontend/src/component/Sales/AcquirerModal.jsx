import { useEffect, useState } from "react";

function AcquirerFormModal({
	isOpen,
	onClose,
	onSubmit,
	partnerOptions = [],
	entityOptions = [],
	initialData = null, // 👈 NEW
	mode = "create", // 👈 NEW ("create" | "edit")
}) {
	const [formData, setFormData] = useState({
		acquirerBankName: "",
		partnerName: "",
		entityName: [],
		acquirerContact: "",
		acquirerEmail: "",
	});

	// ✅ Prefill form when editing
	useEffect(() => {
		if (mode === "edit" && initialData) {
			setFormData({
				acquirerBankName: initialData.bankName || "",
				partnerName: initialData.partnerName || "",
				entityName: Array.isArray(initialData.entityName)
					? initialData.entityName
					: initialData.entityName
					? [initialData.entityName]
					: [],
				acquirerContact: initialData.contactPerson || "",
				acquirerEmail: initialData.contactEmail || "",
			});
		}
	}, [mode, initialData]);

	if (!isOpen) return null;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((p) => ({ ...p, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(formData);

		// reset only in create mode
		if (mode === "create") {
			setFormData({
				acquirerBankName: "",
				partnerName: "",
				entityName: [],
				acquirerContact: "",
				acquirerEmail: "",
			});
		}

		onClose();
	};

	return (
		<dialog open className="modal modal-middle">
			<div className="modal-box w-11/12 max-w-xl">
				<h3 className="font-bold text-lg mb-6 text-center">
					{mode === "edit" ? "Edit Acquirer" : "Add New Acquirer"}
				</h3>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* 1. Acquirer Bank Name */}
					<div>
						<label className="block text-sm font-medium mb-1">
							Acquirer Bank Name
						</label>
						<input
							type="text"
							name="acquirerBankName"
							value={formData.acquirerBankName}
							onChange={handleChange}
							className="input input-bordered w-full"
							required
						/>
					</div>

					{/* 2. Partner Name */}
					<div>
						<label className="block text-sm font-medium mb-1">
							Partner Name
						</label>
						<select
							name="partnerName"
							value={formData.partnerName}
							onChange={handleChange}
							className="select select-bordered w-full"
							required
						>
							<option value="" disabled>
								Select Partner
							</option>
							{partnerOptions.map((partner) => (
								<option key={partner} value={partner}>
									{partner}
								</option>
							))}
						</select>
					</div>

					{/* 3. Entity Name */}

					<div className="form-control w-full relative">
						<label className="block text-sm font-medium mb-2">
							Entity Name
						</label>

						<div className="dropdown w-full relative">
							{/* Dropdown button */}
							<button
								type="button"
								tabIndex={0}
								className="btn btn-bordered w-full justify-between text-left rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							>
								{formData.entityName.length
									? formData.entityName.join(", ")
									: "Select Entities"}
								<svg
									className="w-4 h-4 ml-2 shrink-0"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>

							{/* Dropdown menu */}
							<ul
								tabIndex={0}
								className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-full max-h-60 overflow-y-auto mt-1 border border-gray-200 z-50"
							>
								{entityOptions.map((entity) => (
									<li key={entity}>
										<label className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-100 transition-colors">
											<input
												type="checkbox"
												className="checkbox checkbox-sm"
												value={entity}
												checked={formData.entityName.includes(entity)}
												onChange={(e) => {
													const { checked, value } = e.target;
													setFormData((prev) => ({
														...prev,
														entityName: checked
															? [...prev.entityName, value]
															: prev.entityName.filter((v) => v !== value),
													}));
												}}
											/>
											<span className="text-sm">{entity}</span>
										</label>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* 4. Contact Person */}
					<div>
						<label className="block text-sm font-medium mb-1">
							Contact Person
						</label>
						<input
							type="text"
							name="acquirerContact"
							value={formData.acquirerContact}
							onChange={handleChange}
							className="input input-bordered w-full"
							required
						/>
					</div>

					{/* 5. Contact Email */}
					<div>
						<label className="block text-sm font-medium mb-1">
							Contact Email
						</label>
						<input
							type="email"
							name="acquirerEmail"
							value={formData.acquirerEmail}
							onChange={handleChange}
							className="input input-bordered w-full"
							required
						/>
					</div>

					<div className="modal-action">
						<button type="button" className="btn" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary">
							{mode === "edit" ? "Update Acquirer" : "Save Acquirer"}
						</button>
					</div>
				</form>
			</div>
		</dialog>
	);
}

export default AcquirerFormModal;
