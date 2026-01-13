import { useState, useRef, useEffect } from "react";
import { X, Trash2, Edit2 } from "lucide-react";
import { api } from "../../api.js";
import {
	currencyList,
	payModeList,
	cardTypeList,
} from "../../utils/CurrencyList.js";
import toast from "react-hot-toast";

export default function CurrencySettingsModal({ isOpen, onClose, lead }) {
	const [currency, setCurrency] = useState([]);
	const [payMode, setPayMode] = useState([]);
	const [cardType, setCardType] = useState([]);

	const [originalCurrency, setOriginalCurrency] = useState([]);
	const [originalPayMode, setOriginalPayMode] = useState([]);
	const [originalCardType, setOriginalCardType] = useState([]);

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const companyId = lead?._id;
	const arrEqual = (a = [], b = []) =>
		a.length === b.length && a.every((x) => b.includes(x));

	// Load data
	useEffect(() => {
		if (!companyId || !isOpen) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const res = await api.get(`/currency/${companyId}`);
				const payload = res?.data?.data ?? res?.data ?? null;

				if (!cancelled && payload) {
					setCurrency(payload.currency || []);
					setPayMode(payload.payMode || []);
					setCardType(payload.cardType || []);

					setOriginalCurrency(payload.currency || []);
					setOriginalPayMode(payload.payMode || []);
					setOriginalCardType(payload.cardType || []);
				} else if (!cancelled && !payload) {
					setCurrency([]);
					setPayMode([]);
					setCardType([]);
					setOriginalCurrency([]);
					setOriginalPayMode([]);
					setOriginalCardType([]);
				}
			} catch (err) {
				console.error(err);
				toast.error("Failed to load payment settings");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [companyId, isOpen]);

	const handleSave = async () => {
		if (!companyId) return toast.error("Invalid company");
		if (!currency.length || !payMode.length || !cardType.length)
			return toast.error("Pick at least one value in all fields.");

		setSaving(true);
		try {
			const res = await api.post(`/currency/${companyId}`, {
				currency,
				payMode,
				cardType,
			});
			const payload = res?.data?.data ?? res?.data ?? null;
			if (payload) {
				setCurrency(payload.currency || []);
				setPayMode(payload.payMode || []);
				setCardType(payload.cardType || []);
				setOriginalCurrency(payload.currency || []);
				setOriginalPayMode(payload.payMode || []);
				setOriginalCardType(payload.cardType || []);
			}
			toast.success("Currency Saved successfully!");
		} catch (err) {
			console.error(err);
			toast.error("Save failed");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!companyId) return toast.error("Invalid company");
		if (!confirm("Delete these payment settings?")) return;

		setSaving(true);
		try {
			await api.delete(`/currency/${companyId}`);
			setCurrency([]);
			setPayMode([]);
			setCardType([]);
			setOriginalCurrency([]);
			setOriginalPayMode([]);
			setOriginalCardType([]);
			toast.success("Currency Deleted Successfully");
		} catch (err) {
			console.error(err);
			toast.error("Currency Delete failed");
		} finally {
			setSaving(false);
		}
	};

	const handleClose = () => {
		if (
			!arrEqual(currency, originalCurrency) ||
			!arrEqual(payMode, originalPayMode) ||
			!arrEqual(cardType, originalCardType)
		) {
			if (!confirm("You have unsaved changes. Close anyway?")) return;
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<dialog open className="modal modal-bottom sm:modal-middle modal-open">
			{/* ✅ Mobile full-screen, desktop unchanged */}
			<div
				className="
          modal-box bg-base-100 shadow-xl overflow-visible
          w-screen h-screen max-w-none rounded-2xl p-4
          sm:max-w-4xl sm:rounded-lg sm:p-6 sm:h-auto
          overflow-y-auto
        "
			>
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
					<h2 className="text-lg font-semibold">Payment Settings</h2>
					<button
						className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
						onClick={handleClose}
					>
						<X size={18} />
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
					<MultiSelect
						label="Currency"
						options={currencyList}
						selected={currency}
						onChange={setCurrency}
					/>
					<MultiSelect
						label="Pay Mode"
						options={payModeList}
						selected={payMode}
						onChange={setPayMode}
					/>
					<MultiSelect
						label="Card Type"
						options={cardTypeList}
						selected={cardType}
						onChange={setCardType}
					/>
				</div>

				<div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
					<button
						className="btn btn-sm bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white  disabled:!border-gray-300 disabled:!text-gray-400"
						onClick={handleDelete}
						disabled={
							saving ||
							loading ||
							(!currency.length && !payMode.length && !cardType.length)
						}
					>
						<Trash2 size={14} /> Delete
					</button>
					<button
						className="btn btn-primary btn-sm"
						onClick={handleSave}
						disabled={saving || loading}
					>
						{saving ? "Saving..." : <Edit2 size={14} />} Save
					</button>
				</div>

				<div className="bg-base-200 rounded-md p-3 border">
					<div className="flex flex-wrap gap-2 mb-2">
						<p className="text-xs text-gray-400 w-full">Currency:</p>
						<p className="font-medium">
							{currency.length ? currency.join(", ") : "-"}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<p className="text-xs text-gray-400">Pay Mode:</p>
							<p className="font-medium">
								{payMode.length ? payMode.join(", ") : "-"}
							</p>
						</div>
						<div>
							<p className="text-xs text-gray-400">Card Type:</p>
							<p className="font-medium">
								{cardType.length ? cardType.join(", ") : "-"}
							</p>
						</div>
					</div>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop"></form>
		</dialog>
	);
}

export function MultiSelect({ label, options, selected, onChange }) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const ref = useRef(null);

	useEffect(() => {
		const handler = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const toggle = (v) => {
		if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
		else onChange([...selected, v]);
	};

	const filtered = options.filter((o) =>
		o.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="relative w-full" ref={ref}>
			<label className="text-sm font-medium">{label}</label>

			{/* Input box / selected tags */}
			<div
				className="mt-1 p-2 border rounded-lg min-h-[42px] flex flex-wrap gap-1 items-center cursor-pointer bg-base-100 hover:ring-1 hover:ring-primary transition"
				onClick={() => setOpen(!open)}
			>
				{selected.length === 0 ? (
					<span className="text-gray-400 text-sm">Select {label}</span>
				) : (
					selected.map((item) => (
						<span
							key={item}
							className="bg-primary text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
						>
							{item}
							<X
								size={12}
								className="cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									toggle(item);
								}}
							/>
						</span>
					))
				)}
			</div>

			{/* Dropdown */}
			{open && (
				<div className="absolute mt-1 w-full bg-base-100 border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto p-1">
					<input
						className="input input-bordered input-sm w-full mb-2"
						placeholder={`Search ${label}...`}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						autoFocus
					/>
					{filtered.length === 0 ? (
						<p className="p-3 text-center text-gray-400 text-sm">No matches</p>
					) : (
						filtered.map((o) => (
							<div
								key={o}
								className={`flex justify-between items-center px-3 py-2 mb-1 text-sm cursor-pointer rounded-lg hover:bg-primary/10 transition ${
									selected.includes(o) ? "bg-primary/20" : ""
								}`}
								onClick={() => toggle(o)}
							>
								<span className="text-sm">{o}</span>
								<input
									type="checkbox"
									className="checkbox checkbox-sm"
									checked={selected.includes(o)}
									readOnly
								/>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
