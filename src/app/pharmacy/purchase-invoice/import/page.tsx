"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import "../../css/style.css";
import SideNav from "@/app/pharmacy/components/SideNav/page";
import Header from "@/app/pharmacy/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getMedicinesList } from "@/lib/features/medicineSlice/medicineSlice";
import type { Medicine, Product } from "@/types/medicine";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import SelectInput from "@/app/components/Input/SelectInput";
import Input from "@/app/components/Input/Input";
import { getUser } from "@/lib/auth/auth";

export default function PurchaseInvoiceImport() {
  const dispatch = useAppDispatch();
  const userPharmacy = getUser();
  const pharmacyName = userPharmacy?.pharmacy_name || "";
  const pharmacyId = userPharmacy?.id || 0;
  const { medicines: getMedicine } = useAppSelector((state) => state.medicine);
  const { list } = useAppSelector((state) => state.pharmacyList);
  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);
  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Excel preview data
  const [excelData, setExcelData] = useState<Record<string, string | number>[]>(
    []
  );

  // filtered records by search box
  const [filteredData, setFilteredData] = useState<Medicine[]>([]);
  // select medicine dropdown
  const [selectedMedicines] = useState<{ label: string; value: number }[]>([]);

  const [formData, setFormData] = useState<Partial<Product>>({
    id: 0,
    pharmacy: userPharmacy?.pharmacy_name || "",
    supplier: "",
    medicine_name: "",
    pack_size: "",
    purchase_date: "",
    invoice_number: "",
    manufacturer_name: "",
    qty: "",
    batch: "",
    expiry_date: "",
    discount: "",
    mrp: "",
    purchase_rate: "",
    amount: "",
  });

  // filtered records by search box + status filter
  useEffect(() => {
    let data: Medicine[] = getMedicine || [];

    if (selectedMedicines.length > 0) {
      const selectedNames = selectedMedicines.map((m) => m.label.toLowerCase());
      data = data.filter((item) =>
        selectedNames.some((name) =>
          item.medicine_name?.toLowerCase().includes(name)
        )
      );
    }

    setFilteredData(data);
  }, [selectedMedicines, getMedicine]);

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getMedicinesList());
  }, [dispatch]);

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= getMedicine.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData =
        XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet);
      setExcelData(jsonData);
    };
    reader.readAsBinaryString(file);
  };
  const handleImportClick = () => {
    fileInputRef.current?.click(); // 👈 hidden input trigger
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Final Submit Data:", excelData);
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={visibleCount < filteredData.length}
            className="body_content"
          >
            <div className="pageTitle">
              <i className="bi bi-shop-window"></i> Purchase Invoice Import
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <form onSubmit={handleSubmit}>
                  <div className="row gy-3">
                    {/* 🔹 Row 1 */}
                    <Input
                      label="Pharmacy"
                      type="text"
                      name="pharmacy"
                      value={formData.pharmacy || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pharmacy: e.target.value,
                        }))
                      }
                      readOnly
                      //required
                    />
                    <SelectInput
                      label="Supplier"
                      name="supplier"
                      value={formData.supplier || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          supplier: e.target.value,
                        }))
                      }
                      options={[
                        { value: "SS Pharma", label: "SS Pharma" },
                        { value: "TSS Pharma", label: "TSS Pharma" },
                        {
                          value: "MLK Pharma",
                          label: "MLK Pharma",
                        },
                      ]}
                    />
                    <Input
                      label="Purchase Date"
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          purchase_date: e.target.value,
                        }))
                      }
                      // required
                    />
                    {/* 🔹 Row 2 */}
                    <Input
                      label="Invoice Number"
                      type="text"
                      name="invoice_number"
                      value={formData.invoice_number || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          invoice_number: e.target.value,
                        }))
                      }
                      //required
                    />
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      ref={fileInputRef}
                      onChange={handleExcelUpload}
                      style={{ display: "none" }}
                    />
                    <div className="col-md-4 d-flex align-items-end">
                      <div className="txt_col w-100 text-end">
                        <button
                          type="button"
                          className="btn-style1 w-100"
                          onClick={handleImportClick}
                        >
                          <i className="bi bi-upload"></i> Import Excel Format
                        </button>
                      </div>
                    </div>

                    <div className="col-md-4 d-flex align-items-end">
                      <div className="txt_col w-100 text-end">
                        <button
                          className="btn-style1 w-100"
                          style={{ fontWeight: "600" }}
                          type="submit"
                        >
                          <i className="bi bi-check2-circle"></i> Final Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* 🧾 Excel Preview Table */}
                {excelData.length > 0 && (
                  <div className="scroll_table mt-4">
                    <table className="table cust_table1">
                      <thead>
                        <tr>
                          {Object.keys(excelData[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((val, i) => (
                              <td key={i}>{val as string}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </>
  );
}
