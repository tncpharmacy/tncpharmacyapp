"use client";

import { useEffect, useState } from "react";
import "../../css/style.css";
import SideNav from "@/app/pharmacy/components/SideNav/page";
import Header from "@/app/pharmacy/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getMedicinesList } from "@/lib/features/medicineSlice/medicineSlice";
import type { Medicine } from "@/types/medicine";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import SelectMedicineDropdown from "@/app/components/Input/SelectMedicineDropdown";
import { useExportExcel } from "@/lib/hooks/useExportExcel";

export default function PurchaseInvoiceExport() {
  const dispatch = useAppDispatch();
  const { exportToExcel } = useExportExcel();
  const { medicines: getMedicine } = useAppSelector((state) => state.medicine);

  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // Selected medicines (from dropdown)
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);

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

  // ✅ Handle selection from dropdown (multi-select)
  const handleSelectMedicine = (
    selected: { label: string; value: number }[]
  ) => {
    const selectedIds = selected.map((s) => s.value);
    const newSelected = getMedicine.filter((m) => selectedIds.includes(m.id));

    // ✅ Merge without duplication
    setSelectedMedicines((prev) => {
      const merged = [...prev];
      newSelected.forEach((m) => {
        if (!merged.some((x) => x.id === m.id)) merged.push(m);
      });
      return merged;
    });
  };

  // ✅ Handle checkbox toggle
  const toggleCheckbox = (id: number) => {
    setSelectedMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  // ✅ Export Function
  const handleExportToExcel = () => {
    const exportData = selectedMedicines.map((item) => ({
      Id: item.id ?? "-",
      Product: item.medicine_name ?? "-",
      "Pack Size": item.pack_size ?? "-",
      Manufacture: item.manufacturer_name ?? "-",
      QTY: "",
      Batch: "",
      "Expiry Date": "",
      MRP: "",
      "Discount (%)": "",
      "Purchase Rate": "",
      Amount: "",
    }));
    exportToExcel(exportData, "Selected_Medicines", "Medicines");
  };

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
            </div>

            <div className="main_content">
              <div className="col-sm-12">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="txt_col">
                      <SelectMedicineDropdown
                        medicines={getMedicine}
                        selected={selectedMedicines.map((m) => ({
                          label: m.medicine_name,
                          value: m.id,
                        }))}
                        onChange={handleSelectMedicine}
                        hideSelectedText // ✅ custom prop to hide selected text
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
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
                    <h6 className="fw-bold mb-2">All Product</h6>
                    <div className="scroll_table">
                      <table className="table cust_table1">
                        <thead>
                          <tr>
                            <th className="fw-bold text-start">ID</th>
                            <th className="fw-bold text-start">Product</th>
                            <th className="fw-bold text-start">Pack Size</th>
                            <th className="fw-bold text-start">Manufacture</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getMedicine.slice(0, visibleCount).map((m) => (
                            <tr key={m.id}>
                              <td className="text-start">{m.id}</td>
                              <td className="text-start">{m.medicine_name}</td>
                              <td className="text-start">{m.pack_size}</td>
                              <td className="text-start">
                                {m.manufacturer_name}
                              </td>
                            </tr>
                          ))}
                          {loadings && (
                            <TableLoader colSpan={4} text="Loading more..." />
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RIGHT SIDE - SELECTED RECORDS */}
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-2">
                      {selectedMedicines.length > 0 ? "Selected Products" : ""}
                    </h6>
                    {selectedMedicines.length > 0 ? (
                      <div className="scroll_table">
                        <table className="table cust_table1">
                          <thead>
                            <tr>
                              <th className="fw-bold text-start">Select</th>
                              <th className="fw-bold text-start">ID</th>
                              <th className="fw-bold text-start">Product</th>
                              <th className="fw-bold text-start">Pack Size</th>
                              <th className="fw-bold text-start">
                                Manufacture
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMedicines.map((m) => (
                              <tr key={m.id}>
                                <td className="text-start">
                                  <input
                                    type="checkbox"
                                    checked
                                    onChange={() => toggleCheckbox(m.id)}
                                  />
                                </td>
                                <td className="text-start">{m.id}</td>
                                <td className="text-start">
                                  {m.medicine_name}
                                </td>
                                <td className="text-start">{m.pack_size}</td>
                                <td className="text-start">
                                  {m.manufacturer_name}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted mt-3">
                        Please select medicines from dropdown.
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
