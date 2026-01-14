import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectEntityLoading } from "../../store/slices/Entity.slice"; // 👈 selector

function AddEntityModal({
	isOpen,
	onClose,
	onSubmit,
	existingEntities = [],
	onDelete,
}) {
	const [bulkText, setBulkText] = useState("");
	const [savedEntities, setSavedEntities] = useState([]);
	const [searchText, setSearchText] = useState("");

	const entityLoading = useSelector(selectEntityLoading); // 👈 redux loading

	const filteredEntities = savedEntities.filter((e) =>
		e.toLowerCase().includes(searchText.toLowerCase())
	);

	useEffect(() => {
		setSavedEntities(existingEntities);
	}, [existingEntities]);

	if (!isOpen) return null;

	const handleSubmit = (e) => {
		e.preventDefault();

		const entities = bulkText
			.split(/\n|,/)
			.map((e) => e.trim())
			.filter((e) => e.length > 0);

		if (!entities.length) return;

		onSubmit(entities);
		setBulkText("");
		onClose();
	};

	const handleDelete = (entity) => {
		if (!onDelete) return;

		if (window.confirm(`Delete entity "${entity}"?`)) {
			onDelete(entity);
		}
	};

	return (
		<dialog open className="modal modal-middle sm:modal-middle">
			<div className="modal-box w-11/12 max-w-xl p-4 sm:p-6">
				<h3 className="font-bold text-lg text-center">Add Entities</h3>

				<p className="text-xs text-gray-500 text-center mb-2">
					Add multiple entities (use new line or comma to separate)
				</p>

				<form onSubmit={handleSubmit} className="space-y-3">
					<textarea
						rows={5}
						placeholder={`Example:\nIndia\nSingapore\nUAE`}
						value={bulkText}
						onChange={(e) => setBulkText(e.target.value)}
						className="textarea textarea-bordered w-full resize-none text-sm"
						required
						disabled={entityLoading}
					/>

					<div className="modal-action mt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
						<button
							type="button"
							className="btn btn-sm w-full sm:w-auto"
							onClick={onClose}
							disabled={entityLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-sm btn-primary w-full sm:w-auto disabled:opacity-50"
							disabled={entityLoading}
						>
							{entityLoading ? "Saving..." : "Save Entities"}
						</button>
					</div>
				</form>

				{/* ===== Existing Entities Section ===== */}
				<div className="mt-4 border-t pt-3">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
						<h4 className="font-semibold text-sm text-gray-700">
							Already Added Entities
						</h4>

						<input
							type="text"
							placeholder="Search entity..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="input input-sm input-bordered w-full sm:w-64"
							disabled={entityLoading}
						/>
					</div>

					{/* ===== LOADING STATE ===== */}
					{entityLoading ? (
						<div className="space-y-2 animate-pulse">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-6 bg-gray-200 rounded" />
							))}
						</div>
					) : savedEntities.length > 0 ? (
						<div className="max-h-40 overflow-y-auto overflow-x-auto rounded-lg border bg-gray-50">
							<table className="table table-xs w-full min-w-[420px] text-sm">
								<thead className="bg-gray-100 sticky top-0 z-10">
									<tr>
										<th className="text-left px-2 py-1 w-10">#</th>
										<th className="text-left px-2 py-1">Entity Name</th>
										<th className="text-center px-2 py-1 w-14">Action</th>
									</tr>
								</thead>
								<tbody>
									{filteredEntities.map((entity, idx) => (
										<tr key={idx} className="bg-white border-t">
											<td className="px-2 py-1">{idx + 1}</td>
											<td className="px-2 py-1 font-medium break-words">
												{entity}
											</td>
											<td className="px-2 py-1 text-center">
												<button
													onClick={() => handleDelete(entity)}
													className="btn btn-ghost btn-xs text-red-600 disabled:opacity-40"
													title="Delete entity"
													disabled={entityLoading}
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-xs text-gray-400 text-center py-3">
							No entities added yet
						</p>
					)}
				</div>
			</div>
		</dialog>
	);
}

export default AddEntityModal;
