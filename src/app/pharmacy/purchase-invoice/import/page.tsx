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
import { createPurchaseStock } from "@/lib/features/purchaseStockSlice/purchaseStockSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { fetchSupplier } from "@/lib/features/supplierSlice/supplierSlice";

export default function PurchaseInvoiceImport() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userPharmacy = getUser();
  const pharmacy_id = userPharmacy?.pharmacy_id || 0;
  const pharmacist_id = userPharmacy?.id || 0;
  const { medicines: getMedicine } = useAppSelector((state) => state.medicine);
  const { list: supplierList } = useAppSelector((state) => state.supplier);
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
    id: pharmacist_id,
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
    location: "",
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

  useEffect(() => {
    dispatch(fetchSupplier());
  }, [dispatch]);

  // Convert suppliers into dropdown options
  const supplierOptions = (supplierList || []).map((s) => ({
    label: s.supplier_name,
    value: s.id, // always use id
  }));

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
      const binaryStr = evt.target?.result;

      const workbook = XLSX.read(binaryStr, {
        type: "binary",
        cellStyles: true,
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const csv = XLSX.utils.sheet_to_csv(sheet);

      // SAFE CSV PARSER (Fixes "Rack 4, A5")
      const parseCSVLine = (line: string) => {
        const result: string[] = [];
        let current = "";
        let insideQuotes = false;

        for (const char of line) {
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === "," && !insideQuotes) {
            result.push(current);
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current);
        return result;
      };

      const rows = csv
        .split("\n")
        .map((line) => parseCSVLine(line))
        .filter((r) => r.some((c) => c.trim() !== ""));

      const headerIndex = rows.findIndex((r) =>
        r.some((cell) => cell.trim().toLowerCase() === "product")
      );

      if (headerIndex === -1) {
        alert("Header row not found!");
        return;
      }

      const header = rows[headerIndex];
      const body = rows.slice(headerIndex + 1);

      const jsonData = body.map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj: any = {};
        header.forEach((h, i) => {
          obj[h.trim()] = r[i] ?? "";
        });
        return obj;
      });

      setExcelData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  // const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();

  //   reader.onload = (evt) => {
  //     const bstr = evt.target?.result;
  //     const workbook = XLSX.read(bstr, { type: "binary" });

  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];

  //     // STEP 1: Read Sheet (Row wise)
  //     const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
  //       header: 1, // <-- First row will be header
  //       defval: "", // remove undefined values
  //       raw: false,
  //     });

  //     if (rows.length === 0) return;

  //     const headers = rows[0]; // First row
  //     const dataRows = rows.slice(1); // Remaining data

  //     // STEP 2: Convert rows to JSON using excel headers
  //     const finalData = dataRows.map((row) => {
  //       const obj: Record<string, any> = {};

  //       headers.forEach((h: string, columnIndex: number) => {
  //         obj[h] = row[columnIndex] ?? "";
  //       });

  //       return obj;
  //     });

  //     console.log("FINAL DATA:", finalData);

  //     // STEP 3: Save to State
  //     setExcelData(finalData);
  //   };

  //   reader.readAsBinaryString(file);
  // };

  const handleImportClick = () => {
    fileInputRef.current?.click(); // 👈 hidden input trigger
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parseExcelDate = (excelDate: number): string => {
      if (!excelDate) return new Date().toISOString();
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString();
    };

    // 🧾 2️⃣ Build purchase_details from Excel data
    const purchaseDetails = excelData.map((row, i) => ({
      pharmacy_id: pharmacy_id,
      product_id: Number(row["Id"]) || 0, // ✅ Excel ka Id hi product_id hai
      quantity: row["Required QTY"]?.toString() || "0",
      // available_quantity: row["QTY"]?.toString() || "0",
      batch: row["Batch"]?.toString() || `BATCH-${i + 1}`,
      expiry_date: parseExcelDate(Number(row["Expiry Date"])),
      mrp: row["MRP"]?.toString() || "0",
      discount: row["Discount (%)"]?.toString() || "0",
      purchase_rate: row["Purchase Rate"]?.toString() || "0",
      amount: row["Amount"]?.toString() || "0",
      location: row["Location"]?.toString() || "0",
    }));

    // 🧱 3️⃣ Build Final Payload
    const payload = {
      pharmacy_id: Number(pharmacy_id), // ✅ Number not string
      supplier_id: Number(formData.supplier) || 1,
      invoice_num: String(formData.invoice_number),
      purchase_date: new Date(
        formData.purchase_date || new Date()
      ).toISOString(),
      status: "Active",
      purchase_details: purchaseDetails,
    };

    // console.log("📦 Final Payload to API:", payload);
    // console.log("🧾 purchase_details:", purchaseDetails);

    // 🚀 4️⃣ Dispatch to Redux Thunk
    dispatch(createPurchaseStock(payload))
      .unwrap()
      .then((res) => {
        console.log("✅ Purchase Created Successfully:", res);
        toast.success("Purchase Invoice Imported Successfully!");
        // ⭐⭐ Final Submit Ke Baad Table Clear Kar Do
        setExcelData([]);
        if (fileInputRef.current) fileInputRef.current.value = "";

        // ⭐ Form Reset (optional but recommended)
        setFormData({
          id: pharmacist_id,
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
          location: "",
        });
      })
      .catch((err) => {
        console.error("❌ Failed to create purchase:", err);
        toast.error("Failed to create purchase. Check console for details.");
      });
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
              <button
                onClick={() => router.push("/pharmacy/purchase-invoice")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <form onSubmit={handleSubmit}>
                  <div className="row gy-3">
                    {/* 🔹 Row 1 */}
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
                      options={supplierOptions}
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
                    {/* 🔹 Row 2 */}
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      ref={fileInputRef}
                      onChange={handleExcelUpload}
                      style={{ display: "none" }}
                    />
                    <div className="col-md-6 d-flex align-items-end">
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

                    <div className="col-md-6 d-flex align-items-end">
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
