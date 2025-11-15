"use client";

import { useEffect, useState } from "react";
import "../../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getMedicinesList } from "@/lib/features/medicineSlice/medicineSlice";
import type { Medicine } from "@/types/medicine";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import SelectMedicineDropdown from "@/app/components/Input/SelectMedicineDropdown";
import { useExportExcel } from "@/lib/hooks/useExportExcel";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
interface Supplier {
  id: number;
  name: string;
}
export default function PurchaseInvoiceExport() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { exportToExcel } = useExportExcel();
  const { medicines: getMedicine } = useAppSelector((state) => state.medicine);

  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<
    (Medicine & { qty?: string })[]
  >([]);
  const [selectAll, setSelectAll] = useState(false);

  // ⭐ Supplier dropdown
  const [suppliers] = useState<Supplier[]>([{ id: 1, name: "Ganga Pharmacy" }]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const fileName = `${selectedSupplier || "NoSupplier"}_${today}`;

  useEffect(() => {
    dispatch(getMedicinesList());
  }, [dispatch]);

  const loadMore = () => {
    if (loadings || visibleCount >= getMedicine.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000);
  };

  // ✅ Selected product from the dropdown
  const handleSelectMedicine = (
    selected: { label: string; value: number }[]
  ) => {
    const selectedIds = selected.map((s) => s.value);
    const newSelected = getMedicine.filter((m) => selectedIds.includes(m.id));
    setSelectedMedicines((prev) => {
      const merged = [...prev];
      newSelected.forEach((m) => {
        if (!merged.some((x) => x.id === m.id)) {
          merged.push({ ...m, qty: "" });
        }
      });
      return merged;
    });
  };

  // ✅ Individual toggle from left side
  const handleLeftCheckbox = (medicine: Medicine, checked: boolean) => {
    setSelectedMedicines((prev) => {
      if (checked) {
        // Add if not already selected
        if (!prev.some((x) => x.id === medicine.id)) {
          return [...prev, medicine];
        }
        return prev;
      } else {
        // Remove if unchecked
        const updated = prev.filter((m) => m.id !== medicine.id);
        // Agar koi bhi uncheck hua to SelectAll false kar do
        setSelectAll(false);
        return updated;
      }
    });
  };

  // ✅ Select All toggle
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // Select entire medicine list (not just visible)
      setSelectedMedicines(getMedicine);
    } else {
      // Deselect all
      setSelectedMedicines([]);
    }
  };

  // ✅ Right side checkbox (unselect from right)
  const toggleCheckbox = (id: number) => {
    setSelectedMedicines((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      // Agar koi bhi unselect hua manually to selectAll false
      setSelectAll(false);
      return updated;
    });
  };

  // ⭐ Qty Change
  const handleQtyChange = (id: number, value: string) => {
    setSelectedMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, qty: value } : m))
    );
  };

  // ✅ Export Function
  const handleExportToExcel = () => {
    if (!selectedSupplier) {
      toast.error("⚠ Please select Supplier!");
      return;
    }

    if (selectedMedicines.length === 0) {
      alert("⚠ Please select at least 1 product!");
      return;
    }

    if (selectedMedicines.some((m) => !m.qty || m.qty.trim() === "")) {
      alert("⚠ Please fill Qty for all selected products!");
      return;
    }
    const exportData = [...selectedMedicines]
      .sort((a, b) =>
        a.medicine_name.localeCompare(b.medicine_name, undefined, {
          sensitivity: "base",
        })
      )
      .map((item) => ({
        Id: item.id ?? "-",
        Product: item.medicine_name ?? "-",
        "Pack Size": item.pack_size ?? "-",
        Manufacture: item.manufacturer_name ?? "-",
        "Required QTY": item.qty ?? "",
        Batch: "",
        "Expiry Date": "",
        MRP: "",
        "Discount (%)": "",
        "Purchase Rate": "",
        Amount: "",
        Location: "",
      }));
    exportToExcel(exportData, fileName, "Medicines", selectedSupplier || "N/A");
  };

  useEffect(() => {
    if (getMedicine.length > 0) {
      setSelectAll(selectedMedicines.length === getMedicine.length);
    }
  }, [selectedMedicines, getMedicine]);

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={visibleCount < getMedicine.length}
            className="body_content"
          >
            <div className="pageTitle">
              <i className="bi bi-receipt-cutoff"></i> Purchase Invoice Export
              <button
                onClick={() => router.push("/pharmacist/purchase-invoice")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>

            <div className="main_content">
              <div className="col-sm-12">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="txt_col">
                      <SelectMedicineDropdown
                        medicines={getMedicine}
                        selected={selectedMedicines.map((m) => ({
                          label: m.medicine_name,
                          value: m.id,
                        }))}
                        onChange={handleSelectMedicine}
                        hideSelectedText
                      />
                    </div>
                  </div>
                  {/* ⭐ SUPPLIER DROPDOWN */}
                  <div className="col-md-3">
                    <div className="txt_col">
                      <select
                        className="form-select"
                        style={{ borderRadius: "0px" }}
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-3 text-end">
                    <button
                      className="btn-style1"
                      onClick={handleExportToExcel}
                      disabled={selectedMedicines.length === 0}
                    >
                      <i className="bi bi-download"></i> Export Format
                    </button>
                  </div>
                </div>

                <div className="row mt-4">
                  {/* LEFT SIDE - ALL RECORDS */}
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-2">All Products</h6>
                    <div className="scroll_table">
                      <table className="table cust_table1">
                        <thead>
                          <tr>
                            <th className="fw-bold text-center">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
                                title="Select All Product"
                              />{" "}
                              {/* Select All */}
                            </th>
                            {/* <th className="fw-bold text-start">ID</th> */}
                            <th className="fw-bold text-start">Product</th>
                            <th className="fw-bold text-start">Pack Size</th>
                            <th className="fw-bold text-start">Manufacture</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...getMedicine]
                            .sort((a, b) =>
                              a.medicine_name.localeCompare(
                                b.medicine_name,
                                undefined,
                                {
                                  sensitivity: "base",
                                }
                              )
                            )
                            .slice(0, visibleCount)
                            .map((m) => {
                              const isChecked = selectedMedicines.some(
                                (x) => x.id === m.id
                              );
                              return (
                                <tr key={m.id}>
                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleLeftCheckbox(m, e.target.checked)
                                      }
                                    />
                                  </td>
                                  {/* <td className="text-start">{m.id}</td> */}
                                  <td className="text-start">
                                    {m.medicine_name}
                                  </td>
                                  <td className="text-start">{m.pack_size}</td>
                                  <td className="text-start">
                                    {m.manufacturer_name}
                                  </td>
                                </tr>
                              );
                            })}
                          {loadings && (
                            <TableLoader colSpan={5} text="Loading more..." />
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RIGHT SIDE - SELECTED RECORDS */}
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-2">
                      {selectedMedicines.length > 0
                        ? "Selected Products"
                        : "No Selection"}
                    </h6>
                    {selectedMedicines.length > 0 ? (
                      <div className="scroll_table">
                        <table className="table cust_table1">
                          <thead>
                            <tr>
                              <th className="fw-bold text-center">Select</th>
                              {/* <th className="fw-bold text-start">ID</th> */}
                              <th className="fw-bold text-start">Product</th>
                              <th className="fw-bold text-start">Pack Size</th>
                              <th className="fw-bold text-start">
                                Manufacture
                              </th>
                              <th className="fw-bold text-start">
                                Required Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...selectedMedicines]
                              .sort((a, b) =>
                                a.medicine_name.localeCompare(
                                  b.medicine_name,
                                  undefined,
                                  {
                                    sensitivity: "base",
                                  }
                                )
                              )
                              .map((m) => (
                                <tr key={m.id}>
                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      checked
                                      onChange={() => toggleCheckbox(m.id)}
                                    />
                                  </td>
                                  {/* <td className="text-start">{m.id}</td> */}
                                  <td className="text-start">
                                    {m.medicine_name}
                                  </td>
                                  <td className="text-start">{m.pack_size}</td>
                                  <td className="text-start">
                                    {m.manufacturer_name}
                                  </td>
                                  {/* ⭐ Qty Input Box */}
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={m.qty ?? ""}
                                      onChange={(e) =>
                                        handleQtyChange(m.id, e.target.value)
                                      }
                                      placeholder="Required Qty"
                                      style={{ borderRadius: "0px" }}
                                    />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted mt-3">
                        Please select products from left list or dropdown.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </>
  );
}
