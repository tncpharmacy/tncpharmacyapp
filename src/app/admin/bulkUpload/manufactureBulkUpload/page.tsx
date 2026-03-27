"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import toast from "react-hot-toast";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { handleApiError } from "@/lib/apiHandler";

export default function ManufacturerBulkUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [excelData, setExcelData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 📥 Excel Upload + Preview
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      toast.error("Only .xlsx and .xls files allowed");
      return;
    }

    setSelectedFile(file);
    setLoading(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryStr = evt.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // ✅ Expect only id & manufacturer_name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = jsonData.map((row: any) => ({
        id: row.id || "",
        manufacturer_name: row.manufacturer_name || "",
      }));

      setExcelData(formatted);
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // 🚀 Final Submit (API call)
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please upload file first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post(API_ENDPOINTS.UPLOAD_MANUFACTURER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000,
      });

      toast.success("File uploaded successfully!");

      // reset
      setExcelData([]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />

        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-file-earmark-arrow-up"></i> Manufacturer Bulk
              Upload
            </div>

            <div className="main_content">
              <div className="row gy-3">
                {/* Hidden Input */}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleExcelUpload}
                  style={{ display: "none" }}
                />

                {/* Import Button */}
                <div className="col-md-6">
                  <button
                    className="btn-style1 w-100"
                    onClick={handleImportClick}
                  >
                    <i className="bi bi-upload"></i> Import Excel
                  </button>
                </div>

                {/* Submit Button */}
                <div className="col-md-6">
                  <button className="btn-style1 w-100" onClick={handleSubmit}>
                    <i className="bi bi-check2-circle"></i> Final Submit
                  </button>
                </div>
              </div>

              {/* 📊 Preview Table */}
              {excelData.length > 0 && (
                <div className="scroll_table mt-4">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Manufacturer Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.map((row, i) => (
                        <tr key={i}>
                          <td>{row.id}</td>
                          <td>{row.manufacturer_name}</td>
                        </tr>
                      ))}
                      {loading && <TableLoader colSpan={2} text="" />}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
