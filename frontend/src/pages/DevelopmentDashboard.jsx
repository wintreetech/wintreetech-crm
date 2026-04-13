import { useEffect, useMemo, useState } from "react";
import { FolderOpen, Pen, Plus, Search, Trash, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import DevelopmentModal from "../component/Development/DevelopmentModal.jsx";
import DevelopmentSectionsModal from "../component/Development/DevelopmentSectionsModal.jsx";
import { selectCurrentUser } from "../store/slices/Auth.slice.js";
import {
	selectDevelopmentLoading,
	selectDevelopmentRecords,
} from "../store/slices/Development.slice.js";
import {
	createDevelopmentRecord,
	deleteDevelopmentRecord,
	fetchDevelopmentRecords,
	updateDevelopmentRecord,
} from "../store/thunks/Development.thunks.js";

const TableLoader = ({ columns = 8, message = "Loading..." }) => (
	<tr>
		<td colSpan={columns} className="py-10">
			<div className="flex flex-col items-center justify-center gap-3">
				<span className="loading loading-spinner loading-md text-primary"></span>
				<p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
			</div>
		</td>
	</tr>
);

const formatDate = (value) => {
	if (!value) return "-";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

const getWebsiteHref = (value) => {
	if (!value) return "#";
	return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

function DevelopmentDashboard() {
	const dispatch = useDispatch();
	const records = useSelector(selectDevelopmentRecords);
	const loading = useSelector(selectDevelopmentLoading);
	const currentUser = useSelector(selectCurrentUser);

	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [sectionsOpen, setSectionsOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState(null);
	const [editingRecord, setEditingRecord] = useState(null);

	const perPage = 10;
	const hasPermission =
		currentUser?.role === "admin" || currentUser?.role === "superadmin";

	useEffect(() => {
		dispatch(fetchDevelopmentRecords())
			.unwrap()
			.catch((err) => toast.error(err || "Failed to load development records"));
	}, [dispatch]);

	const filteredRecords = useMemo(() => {
		if (!search.trim()) return records;

		const query = search.toLowerCase();

		return records.filter((item) => {
			return (
				item.companyName?.toLowerCase().includes(query) ||
				item.website?.toLowerCase().includes(query) ||
				item.registrarPlatform?.toLowerCase().includes(query) ||
				item.companyDirector?.toLowerCase().includes(query) ||
				item.merchantCountry?.toLowerCase().includes(query) ||
				item.mainIp?.toLowerCase().includes(query)
			);
		});
	}, [records, search]);

	const totalPages = Math.max(1, Math.ceil(filteredRecords.length / perPage));
	const currentRecords = useMemo(() => {
		const start = (currentPage - 1) * perPage;
		return filteredRecords.slice(start, start + perPage);
	}, [currentPage, filteredRecords]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const stats = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const nextThirtyDays = new Date(today);
		nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
		nextThirtyDays.setHours(23, 59, 59, 999);

		const expiredCount = records.filter((item) => {
			if (!item.expiredOn) return false;
			const date = new Date(item.expiredOn);
			return date < today;
		}).length;

		const dueSoonRecords = records.filter((item) => {
			if (!item.expiredOn) return false;
			const date = new Date(item.expiredOn);
			return date >= today && date <= nextThirtyDays;
		});

		const countries = new Set(
			records
				.map((item) => item.merchantCountry?.trim())
				.filter(Boolean)
				.map((country) => country.toLowerCase()),
		);

		const websitesCount = records.filter((item) => item.website?.trim()).length;

		return {
			expiredCount,
			dueSoonCount: dueSoonRecords.length,
			dueSoonRecords,
			countryCount: countries.size,
			websitesCount,
		};
	}, [records]);

	useEffect(() => {
		console.log("Due in 30 days records:", stats.dueSoonRecords);
	}, [stats]);

	const handleCreate = async (payload) => {
		try {
			const { message } = await dispatch(
				createDevelopmentRecord(payload),
			).unwrap();
			toast.success(message || "Development record added successfully");
			setCreateOpen(false);
		} catch (err) {
			toast.error(err || "Failed to create development record");
		}
	};

	const handleUpdate = async (payload) => {
		if (!editingRecord?._id) return;

		try {
			const { message } = await dispatch(
				updateDevelopmentRecord({ id: editingRecord._id, data: payload }),
			).unwrap();

			toast.success(message || "Development record updated");
			setEditOpen(false);
			setEditingRecord(null);
		} catch (err) {
			toast.error(err || "Failed to update development record");
		}
	};

	const handleDelete = async (id) => {
		const ok = window.confirm(
			"Are you sure you want to delete this development record?",
		);
		if (!ok) return;

		try {
			const { message } = await dispatch(deleteDevelopmentRecord(id)).unwrap();
			toast.success(message || "Development record deleted");

			if (selectedRecord?._id === id) {
				setSectionsOpen(false);
				setSelectedRecord(null);
			}
		} catch (err) {
			toast.error(err || "Failed to delete development record");
		}
	};

	const isDueSoon = (expiredOn) => {
		if (!expiredOn) return false;

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const nextThirtyDays = new Date(today);
		nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
		nextThirtyDays.setHours(23, 59, 59, 999);

		const date = new Date(expiredOn);
		return date >= today && date <= nextThirtyDays;
	};

	return (
		<div className="p-4 bg-gray-50 dark:bg-gray-800 min-h-screen">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
				<h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
					Development Records
				</h1>

				<button
					type="button"
					onClick={() => setCreateOpen(true)}
					className="btn btn-primary flex items-center gap-2"
				>
					<Plus className="w-4 h-4" />
					Add Development
				</button>
			</div>

			<DevelopmentModal
				isOpen={createOpen}
				onClose={() => setCreateOpen(false)}
				onSubmit={handleCreate}
				isLoading={loading}
			/>

			{editingRecord && (
				<DevelopmentModal
					isOpen={editOpen}
					onClose={() => {
						setEditOpen(false);
						setEditingRecord(null);
					}}
					onSubmit={handleUpdate}
					initialData={editingRecord}
					mode="edit"
					isLoading={loading}
				/>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-black">
				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">Total Records</h3>
					<p className="text-2xl font-bold">{records.length}</p>
					<p className="text-gray-400 text-xs">Development companies tracked</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">Websites Added</h3>
					<p className="text-2xl font-bold">{stats.websitesCount}</p>
					<p className="text-gray-400 text-xs">
						Records with a website present
					</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">Due In 30 Days</h3>
					<p className="text-2xl font-bold">{stats.dueSoonCount}</p>
					<p className="text-gray-400 text-xs">Upcoming expiry follow-ups</p>
				</div>

				<div className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:text-white">
					<h3 className="text-gray-500 text-sm">Expired</h3>
					<p className="text-2xl font-bold">{stats.expiredCount}</p>
					<p className="text-gray-400 text-xs">
						Across {stats.countryCount} merchant countries
					</p>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm p-4 dark:bg-gray-900">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
					<div className="relative w-full md:w-1/2">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
						<input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search by company, website, registrar, country, director, or IP..."
							className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				</div>

				<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg overflow-y-visible border border-gray-200 dark:border-gray-700">
					<table className="min-w-max w-full text-left text-xs sm:text-sm text-black dark:text-white">
						<thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="py-2 px-4">Company Name</th>
								<th className="py-2 px-4">Website</th>
								<th className="py-2 px-4">IP</th>
								<th className="py-2 px-4">Director</th>
								<th className="py-2 px-4">Merchant Country</th>
								<th className="py-2 px-4 text-center">Address</th>
								<th className="py-2 px-4">Expired On</th>
								<th className="py-2 px-4">Files</th>
								<th className="py-2 px-4">Phone No</th>
								{hasPermission && (
									<th className="py-2 px-4 text-center">Actions</th>
								)}
							</tr>
						</thead>

						<tbody>
							{loading ? (
								<TableLoader
									columns={9}
									message="Loading development records..."
								/>
							) : currentRecords.length > 0 ? (
								currentRecords.map((record) => (
									<tr
										key={record._id}
										className={`border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900 ${
											isDueSoon(record.expiredOn)
												? "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200 border-l-4 border-red-500"
												: "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
										}`}
									>
										<td className="py-3 px-4 font-medium capitalize">
											{record.companyName}
										</td>
										<td className="py-3 px-4">
											{record.website ? (
												<a
													href={getWebsiteHref(record.website)}
													target="_blank"
													rel="noreferrer"
													className="text-blue-600 hover:underline"
												>
													{record.website}
												</a>
											) : (
												"-"
											)}
										</td>
										<td className="py-3 px-4">{record.mainIp || "-"}</td>
										<td className="py-3 px-4">
											{record.companyDirector || "-"}
										</td>
										<td className="py-3 px-4">
											{record.merchantCountry || "-"}
										</td>
										<td className="py-3 px-4 text-center">
											{record.address ? (
												<div className="relative inline-flex items-center justify-center group">
													<MapPin className="w-4 h-4 text-gray-600 dark:text-gray-300 cursor-pointer" />

													<div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-normal break-words rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-md group-hover:block w-64">
														{record.address}
													</div>
												</div>
											) : (
												"-"
											)}
										</td>
										<td className="py-3 px-4">
											{formatDate(record.expiredOn)}
										</td>
										<td className="py-3 px-4">
											<button
												type="button"
												className="btn btn-primary btn-sm"
												onClick={() => {
													setSelectedRecord(record);
													setSectionsOpen(true);
												}}
											>
												<FolderOpen className="w-4 h-4" />
												Files
											</button>
										</td>
										<td className="py-3 px-4">{record.landline}</td>

										{hasPermission && (
											<>
												<td className="py-3 px-4 text-center">
													<div className="flex justify-center gap-3">
														<button
															type="button"
															onClick={() => {
																setEditingRecord(record);
																setEditOpen(true);
															}}
															className={`text-blue-600 cursor-pointer hover:text-blue-800 ${
																!hasPermission
																	? "opacity-40 pointer-events-none"
																	: ""
															}`}
															title="Edit Development"
														>
															<Pen className="w-4 h-4" />
														</button>

														<button
															type="button"
															onClick={() => handleDelete(record._id)}
															className={`text-red-600 cursor-pointer hover:text-red-800 ${
																!hasPermission
																	? "opacity-40 pointer-events-none"
																	: ""
															}`}
															title="Delete Development"
														>
															<Trash className="w-4 h-4" />
														</button>
													</div>
												</td>
											</>
										)}
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={9}
										className="text-center py-6 text-gray-500 dark:text-gray-400"
									>
										<div className="flex flex-col items-center gap-2">
											<span className="text-base font-medium">
												No development records found
											</span>
											<p className="text-sm opacity-70">
												{search
													? "Try adjusting your search"
													: "Add your first record to begin"}
											</p>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<button
						type="button"
						onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1}
						className="w-full sm:w-auto px-4 py-2 border rounded-lg disabled:opacity-50 text-sm sm:text-base"
					>
						Previous
					</button>

					<span className="text-sm sm:text-base text-center w-full sm:w-auto">
						Page {currentPage} of {totalPages}
					</span>

					<button
						type="button"
						onClick={() =>
							setCurrentPage((prev) => Math.min(prev + 1, totalPages))
						}
						disabled={currentPage === totalPages}
						className="w-full sm:w-auto px-4 py-2 border rounded-lg disabled:opacity-50 text-sm sm:text-base"
					>
						Next
					</button>
				</div>
			</div>

			{sectionsOpen && selectedRecord && (
				<DevelopmentSectionsModal
					isOpen={sectionsOpen}
					onClose={() => setSectionsOpen(false)}
					record={selectedRecord}
				/>
			)}
		</div>
	);
}

export default DevelopmentDashboard;
