import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

export const useExportExcel = () => {
  // const exportToExcel = <T extends Record<string, unknown>>(
  //   data: T[],
  //   fileName: string = "data",
  //   sheetName: string = "Sheet1"
  // ) => {
  //   if (!data || data.length === 0) {
  //     alert("⚠️ No data available to export!");
  //     return;
  //   }

  //   // ✅ Convert JSON to sheet
  //   //const worksheet = XLSX.utils.json_to_sheet(data);

  //   // ✅ Style header row
  //   const headerKeys = Object.keys(data[0]);
  //   const headerRow = headerKeys.map((key) => ({
  //     v: key,
  //     t: "s",
  //     s: {
  //       font: { bold: true, color: { rgb: "FFFFFF" } },
  //       fill: { fgColor: { rgb: "4F81BD" } },
  //       alignment: { horizontal: "center", vertical: "center" },
  //       border: {
  //         top: { style: "thin", color: { rgb: "000000" } },
  //         bottom: { style: "thin", color: { rgb: "000000" } },
  //         left: { style: "thin", color: { rgb: "000000" } },
  //         right: { style: "thin", color: { rgb: "000000" } },
  //       },
  //     },
  //   }));

  //   // ✅ Build worksheet data with header + rows
  //   const sheetData = [
  //     headerRow.map((h) => h.v),
  //     ...data.map((obj) => Object.values(obj)),
  //   ];
  //   const ws = XLSX.utils.aoa_to_sheet(sheetData);

  //   // ✅ Apply style to header cells
  //   headerRow.forEach((header, colIndex) => {
  //     const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
  //     ws[cellAddress].s = header.s;
  //   });

  //   // ✅ Set column widths
  //   ws["!cols"] = headerKeys.map(() => ({ wch: 20 }));

  //   // ✅ Create workbook & save
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, sheetName);

  //   const wbout = XLSX.write(wb, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });

  //   const blob = new Blob([wbout], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   saveAs(blob, `${fileName}.xlsx`);
  // };

  const exportToExcel = <T extends Record<string, unknown>>(
    data: T[],
    fileName = "data",
    sheetName = "Sheet1",
    supplier = ""
  ) => {
    if (!data || data.length === 0) {
      alert("⚠️ No data available to export!");
      return;
    }

    const today = new Date().toLocaleDateString("en-GB");

    const headerKeys = Object.keys(data[0]);

    // ===========================
    // 🔥 AOA DATA WITH TOP TWO ROWS
    // ===========================
    const sheetData = [
      // Row 1 → Supplier
      [`Supplier: ${supplier}`, ...Array(headerKeys.length - 1).fill("")],

      // Row 2 → Date
      [`Date: ${today}`, ...Array(headerKeys.length - 1).fill("")],

      // Row 3 → Header row
      headerKeys,

      // Rest → Data rows
      ...data.map((obj) => Object.values(obj)),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // ===========================
    // 🔥 MERGE FIRST 2 ROWS CELLS
    // ===========================
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headerKeys.length - 1 } }, // Supplier
      { s: { r: 1, c: 0 }, e: { r: 1, c: headerKeys.length - 1 } }, // Date
    ];

    // ===========================
    // 🔥 STYLE SUPPLIER ROW
    // ===========================
    const supplierCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
    ws[supplierCell].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center" },
    };

    // ===========================
    // 🔥 STYLE DATE ROW
    // ===========================
    const dateCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
    ws[dateCell].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: "center" },
    };

    // ===========================
    // 🔥 STYLE HEADER ROW
    // ===========================
    headerKeys.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 2, c: colIndex });
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    });

    ws["!cols"] = headerKeys.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${fileName}.xlsx`
    );
  };

  return { exportToExcel };
};
