import { CheckSquare, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
	addChecklistItem,
	deleteChecklistItem,
	toggleChecklistItem,
} from "../../store/thunks/Acquirer.thunks.js";
import { useDispatch } from "react-redux";

function ChecklistModal({
	isOpen,
	onClose,
	acquirer,
	checklistItems,
	setChecklistItems,
}) {
	const [newItem, setNewItem] = useState("");
	const dispatch = useDispatch();

	const handleAddItem = () => {
		if (!newItem.trim()) return;

		dispatch(
			addChecklistItem({
				bankName: acquirer.bankName,
				title: newItem,
			})
		);

		setNewItem("");
	};

	const handleToggleItem = (id) => {
		dispatch(
			toggleChecklistItem({
				bankName: acquirer.bankName,
				itemId: id,
			})
		);
	};

	const handleDeleteItem = (id) => {
		dispatch(
			deleteChecklistItem({
				bankName: acquirer.bankName,
				itemId: id,
			})
		);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleAddItem();
		}
	};

	const completedCount = checklistItems.filter(
		(item) => item.isCompleted
	).length;

	const totalCount = checklistItems.length;

	if (!isOpen) return null;

	return (
		<dialog open={isOpen} className="modal modal-open">
			<div className="modal-box w-11/12 max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">
						KYC Checklist - {acquirer.bankName}
					</h2>
					<button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
						<X size={20} />
					</button>
				</div>

				{/* Progress */}
				<div className="mb-6">
					<div className="flex justify-between text-sm mb-1">
						<span className="text-gray-600">Progress</span>
						<span className="font-medium">
							{completedCount} of {totalCount} completed
						</span>
					</div>
					<progress
						className="progress progress-primary w-full"
						value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0}
						max="100"
					></progress>
				</div>

				{/* Add New Item */}
				<div className="flex gap-2 mb-6">
					<input
						type="text"
						value={newItem}
						onChange={(e) => setNewItem(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Add a new checklist item..."
						className="input input-bordered flex-1"
					/>
					<button
						onClick={handleAddItem}
						className="btn btn-primary"
						disabled={!newItem.trim()}
					>
						<Plus size={20} />
					</button>
				</div>

				{/* Checklist Items */}
				<div className="space-y-3 max-h-96 overflow-y-auto">
					{checklistItems.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
							<p>No checklist items yet. Add your first item above.</p>
						</div>
					) : (
						checklistItems.map((item) => (
							<div
								key={item._id}
								className="flex items-center gap-3 p-3 border rounded"
							>
								<input
									type="checkbox"
									checked={item.isCompleted} // ✅
									onChange={() => handleToggleItem(item._id)}
									className="checkbox checkbox-primary"
								/>

								<span
									className={`flex-1 ${
										item.isCompleted ? "line-through text-gray-500" : ""
									}`}
								>
									{item.title}
								</span>

								<button
									onClick={() => handleDeleteItem(item._id)}
									className="btn btn-ghost btn-sm text-error"
								>
									<Trash2 size={16} />
								</button>
							</div>
						))
					)}
				</div>
			</div>
			<div className="modal-backdrop" onClick={onClose}></div>
		</dialog>
	);
}

export default ChecklistModal;
