import React, { useState } from "react";

function LeadModal({ isOpen, onClose, onSubmit }) {
	const initialFormData = {
		leadSource: "",
		companyName: "",
		companyWebsite: "",
		companyMobileNo: "",
		companyEmail: "",
		partner: "",
		status: "Open",
		subStatus: "Under Discussion",
		monthlyDealSize: "",
		dealOwner: "",
		contactName: "",
		companyNotes: "",
		remarks: "",
	};

	const [formData, setFormData] = useState(initialFormData);

	// Handle input change
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle submit
	const handleSubmit = async (e) => {
		e.preventDefault();
		onSubmit(formData);
		onClose();
		setFormData(initialFormData);
	};

	return (
		<dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
			<div className="modal-box w-11/12 max-w-3xl">
				<h3 className="font-bold text-xl mb-4">Add Lead</h3>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Grid Layout for Inputs */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
							<label className="block text-sm font-medium mb-1">Partners</label>
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

						{/* Company Website */}
						<div>
							<label className="block text-sm font-medium mb-1">
								Company Website
							</label>
							<input
								type="url"
								name="companyWebsite"
								value={formData.companyWebsite}
								onChange={handleChange}
								className="input input-bordered w-full"
								required
							/>
						</div>

						{/* Company Mobile Number */}
						<div>
							<label className="block text-sm font-medium mb-1">
								Company Mobile Number
							</label>
							<input
								type="tel"
								name="companyMobileNo"
								value={formData.companyMobileNo}
								onChange={handleChange}
								className="input input-bordered w-full"
								required
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
								className="input input-bordered w-full"
								required
							/>
						</div>

						{/* Status */}
						{/* <div>
							<label className="block text-sm font-medium mb-1">Status</label>
							<select
								name="status"
								value={formData.status}
								onChange={handleChange}
								className="select select-bordered w-full"
							>
								<option value="Open">Open</option>
								<option value="Active">Active</option>
								<option value="Suspended">Suspended</option>
							</select>
						</div> */}

						{/* SubStatus (Only if Open) */}
						{/* {formData.status === "Open" && (
							<div>
								<label className="block text-sm font-medium mb-1">
									Sub-Status
								</label>
								<select
									name="subStatus"
									value={formData.subStatus}
									onChange={handleChange}
									className="select select-bordered w-full"
								>
									<option value="Under Discussion">Under Discussion</option>
									<option value="Pricing proposal sent">
										Pricing proposal sent
									</option>
									<option value="Docs Review">Docs Review</option>
									<option value="Agreement sent">Agreement sent</option>
									<option value="Agreement Sign">Agreement Sign</option>
									<option value="Integration initiated">
										Integration initiated
									</option>
								</select>
							</div>
						)} */}

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
								className="input input-bordered w-full"
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
								className="input input-bordered w-full"
							/>
						</div>

						{/* Name of the contact */}
						<div>
							<label className="block text-sm font-medium mb-1">
								Name of the Contact
							</label>
							<input
								type="text"
								name="contactName"
								value={formData.contactName}
								onChange={handleChange}
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
								className="textarea textarea-bordered w-full"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="modal-action">
						<button type="button" className="btn" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary">
							Save Lead
						</button>
					</div>
				</form>
			</div>
		</dialog>
	);
}

export default LeadModal;
