"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import toast from "react-hot-toast";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { handleApiError } from "@/lib/apiHandler";
import TncLoader from "@/app/components/TncLoader/TncLoader";

export default function SafetyAdviceBulkUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [excelData, setExcelData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // upload
  const [scrollLoading, setScrollLoading] = useState(false); // scroll
  const [visibleCount, setVisibleCount] = useState(100);
  const tableRef = useRef<HTMLDivElement | null>(null);

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

    // 👇 allow UI to update first
    setTimeout(() => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        const binaryStr = evt.target?.result;
        setTimeout(() => {
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
          });

          setExcelData(jsonData);
          setLoading(false);
        }, 100);
      };

      reader.readAsBinaryString(file);
    }, 0);
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

      await api.post(API_ENDPOINTS.UPLOAD_SAFETY_ADVICE, formData, {
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

  useEffect(() => {
    const div = tableRef.current;
    if (!div) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = div;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (visibleCount < excelData.length && !scrollLoading) {
          setScrollLoading(true);

          setTimeout(() => {
            setVisibleCount((prev) => prev + 100);
            setScrollLoading(false);
          }, 500);
        }
      }
    };

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [visibleCount, excelData, scrollLoading]);

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />

        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-file-earmark-arrow-up"></i> Safety Advice Bulk
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

              {loading && (
                <div className="text-center mt-3">
                  <div className="py-5 text-center">
                    <TncLoader size={50} text="" />
                  </div>
                </div>
              )}
              {/* 📊 Preview Table */}
              {excelData.length > 0 && (
                <div className="scroll_table mt-4">
                  {/* 👇 Horizontal scroll container */}
                  <div style={{ overflowX: "auto" }}>
                    {/* 👇 Vertical scroll container */}
                    <div
                      ref={tableRef}
                      style={{ maxHeight: "500px", overflowY: "auto" }}
                    >
                      <table className="table cust_table1">
                        <thead>
                          <tr>
                            {Object.keys(excelData[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.slice(0, visibleCount).map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((val, idx) => (
                                <td key={idx}>{val as string}</td>
                              ))}
                            </tr>
                          ))}

                          {/* ✅ loader bhi direct yahin */}
                          {scrollLoading && (
                            <TableLoader
                              colSpan={Object.keys(excelData[0]).length}
                              text="Loading more..."
                            />
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
