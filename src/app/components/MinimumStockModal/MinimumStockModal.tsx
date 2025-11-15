"use client";

import { useExportExcel } from "@/lib/hooks/useExportExcel";
import { Medicine } from "@/types/medicine";
import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";

interface Supplier {
  id: number;
  name: string;
}

export interface MinimumStockItem {
  id: number;
  MedicineName: string;
  Manufacturer: string;
  AvailableQty: number;
  MinStockLevel: number;
  location: string;
  PharmacyName: string;
  product_id?: number;
  price?: number;
  quantity?: number;
  requiredQty?: number; // optional kar do
  pack_size?: string; // optional kar do
}

interface MinimumStockModalProps {
  show: boolean;
  onHide: () => void;
  data: MinimumStockItem[];
  suppliers: Supplier[];
}

export default function MinimumStockModal({
  show,
  onHide,
  data,
  suppliers,
}: MinimumStockModalProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");

  const { exportToExcel } = useExportExcel();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const fileName = `${selectedSupplier || "NoSupplier"}_${today}`;

  // Initialize rows with checkbox + qty
  useEffect(() => {
    if (show) {
      const updated = data.map((item) => ({
        ...item,
        requiredQty: "",
      }));

      setRows(updated);
      setSelectedRows([]);
    }
  }, [show, data]);

  const toggleRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((x) => x !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleQtyChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index].requiredQty = value;
    setRows(updated);
  };

  // =====================================================
  // Export Excel with Header + Checkbox + Colors
  // =====================================================
  const handleExportToExcel = () => {
    const today = new Date().toISOString().split("T")[0];
    const fileName = `${selectedSupplier || "NoSupplier"}_${today}`;

    const exportData = [...rows] // <-- IMPORTANT FIX
      .sort((a, b) =>
        a.MedicineName.localeCompare(b.MedicineName, undefined, {
          sensitivity: "base",
        })
      )
      .map((item) => ({
        Id: item.id ?? "-",
        Product: item.MedicineName ?? "-",
        "Pack Size": item.pack_size ?? "-",
        Manufacture: item.Manufacturer ?? "-",
        "Required QTY": item.requiredQty ?? "", // <-- now it works
        Batch: "",
        "Expiry Date": "",
        MRP: "",
        "Discount (%)": "",
        "Purchase Rate": "",
        Amount: "",
        Location: item.location ?? "-",
      }));

    exportToExcel(exportData, fileName, "Medicines", selectedSupplier || "N/A");
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header closeButton>
        <div className="d-flex justify-content-between w-100 px-2">
          {/* Supplier dropdown */}
          <select
            className="form-select w-25"
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

          {/* Export Excel */}
          <Button variant="success" onClick={handleExportToExcel}>
            Export Excel
          </Button>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="scroll_table" style={{ maxHeight: "70vh" }}>
          <table className="table table-bordered table-striped">
            <thead className="fw-bold">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedRows(
                        e.target.checked ? rows.map((r) => r.id) : []
                      )
                    }
                    checked={
                      selectedRows.length === rows.length && rows.length > 0
                    }
                  />
                </th>
                <th>Medicine</th>
                <th>Manufacturer</th>
                <th>Available Stock</th>
                <th>Minimum Stock</th>
                <th>Required Qty</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No data found
                  </td>
                </tr>
              )}

              {rows.map((item, index) => (
                <tr key={`${item.id}-${index}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => toggleRow(item.id)}
                    />
                  </td>
                  <td>{item.MedicineName}</td>
                  <td>{item.Manufacturer}</td>
                  <td className="fw-bold text-danger">
                    <span
                      style={{
                        border: `2px solid red`,
                        borderRadius: "35px",
                        padding: "4px 8px",
                        backgroundColor: "red",
                        color: "white",
                        fontWeight: "bold",
                        display: "inline-block",
                      }}
                    >
                      {item.AvailableQty}
                    </span>
                  </td>
                  <td>{item.MinStockLevel}</td>

                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.requiredQty}
                      onChange={(e) => handleQtyChange(index, e.target.value)}
                      placeholder="Required Qty"
                    />
                  </td>

                  <td>{item.location || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
