import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const downloadExcel = (data, filename = "data.xlsx") => {
	// 1. Create a worksheet
	const worksheet = XLSX.utils.json_to_sheet(data);

	// 2. Create a workbook and append the worksheet
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

	// 3. Convert workbook to blob
	const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
	const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

	// 4. Save the file
	saveAs(blob, filename);
};

export default downloadExcel;
