import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

export const useExportExcel = () => {
  const exportToExcel = <T extends Record<string, unknown>>(
    data: T[],
    fileName: string = "data",
    sheetName: string = "Sheet1"
  ) => {
    if (!data || data.length === 0) {
      alert("⚠️ No data available to export!");
      return;
    }

    // ✅ Convert JSON to sheet
    //const worksheet = XLSX.utils.json_to_sheet(data);

    // ✅ Style header row
    const headerKeys = Object.keys(data[0]);
    const headerRow = headerKeys.map((key) => ({
      v: key,
      t: "s",
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      },
    }));

    // ✅ Build worksheet data with header + rows
    const sheetData = [
      headerRow.map((h) => h.v),
      ...data.map((obj) => Object.values(obj)),
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // ✅ Apply style to header cells
    headerRow.forEach((header, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      ws[cellAddress].s = header.s;
    });

    // ✅ Set column widths
    ws["!cols"] = headerKeys.map(() => ({ wch: 20 }));

    // ✅ Create workbook & save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return { exportToExcel };
};
