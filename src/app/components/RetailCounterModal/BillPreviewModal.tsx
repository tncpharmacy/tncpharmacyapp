"use client";
import Image from "next/image";
import { useRef } from "react";
import { Modal } from "react-bootstrap";
import styles from "../../pharmacist/css/BillPreviewModal.module.css";

interface CartItem {
  id: number;
  medicine_name: string;
  qty: number;
  price: number;
  dose_form: string;
  Disc: number;
  remarks: string;
}
interface BillPreviewModalProps {
  show: boolean;
  onClose: () => void;
  cart: CartItem[];
  customerName: string;
  mobile: string;
}

const BillPreviewModal: React.FC<BillPreviewModalProps> = ({
  show,
  onClose,
  cart,
  customerName,
  mobile,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank", "width=800,height=1000");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head>
          <title>Pharmacy Bill</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', sans-serif; }
            h4, h5, h6 { text-align: center; margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            th { background-color: #f2f2f2; }
            
            /* Print specific styles */
            .print-hide { display: none !important; }
            .print-only { display: block !important; }
            .print-card { page-break-inside: avoid; margin-bottom: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const grandTotal = cart.reduce((acc, item) => {
    const total = item.qty * item.price;
    const discountAmount = item.Disc ? (total * item.Disc) / 100 : 0;
    return acc + (total - discountAmount);
  }, 0);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold text-primary">
          🧾 Bill Preview
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className={styles.modalContentWrapper} ref={printRef}>
          {/* Header */}
          <div
            className={`d-flex justify-content-between align-items-center mb-4 ${styles.billHeader}`}
          >
            <div className="d-flex align-items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="TnC Pharmacy"
                height={100}
                width={220}
              />
            </div>
            <div
              className="text-end"
              style={{ fontSize: "12px", color: "#555" }}
            >
              <p style={{ margin: 0 }}>123 Main Street, City - 000000</p>
              <p style={{ margin: 0 }}>Ph: +91-9999999999</p>
            </div>
          </div>
          {/* Customer Info */}
          <div className={styles.customerInfo}>
            <div className="d-flex justify-content-between">
              <div>
                <strong>Customer Name:</strong> {customerName || "-"}
              </div>
              <div>
                <strong>Mobile No.:</strong> {mobile || "-"}
              </div>
            </div>
          </div>
          {/* Billing Summary */}
          <section>
            <h6 className="fw-bold text-primary mb-2">Billing Summary</h6>

            {/* Table for screen */}
            <table
              className={`table table-bordered text-center align-middle ${styles.printHide}`}
            >
              <thead className="table-light">
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>MRP (₹)</th>
                  <th>Discount (₹)</th>
                  <th>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => {
                  const total = item.qty * item.price;
                  const discountAmount = item.Disc
                    ? (total * item.Disc) / 100
                    : 0;
                  const subtotal = total - discountAmount;
                  return (
                    <tr key={idx}>
                      <td>{item.medicine_name}</td>
                      <td>{item.qty}</td>
                      <td>{item.price}</td>
                      <td>{discountAmount.toFixed(2)}</td>
                      <td>{subtotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th colSpan={4} className="text-end">
                    Grand Total
                  </th>
                  <th style={{ color: "#007bff" }}>{grandTotal.toFixed(2)}</th>
                </tr>
              </tfoot>
            </table>
          </section>
          {/* Page Break */}
          <div style={{ pageBreakBefore: "always" }}></div>
          {/* <section className={styles.printHide}>
            <h6 className="fw-bold text-primary mb-2">Doses & Remarks</h6>
            <table className="table table-bordered text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>Item</th> <th>Doses Instruction</th> <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.medicine_name}</td> <td>{item.dose_form}</td>
                    <td>{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section> */}

          <section
            className="print-only d-flex flex-column"
            style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", width: "40%" }}
          >
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="doses-card p-3 mb-3"
                style={{
                  boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <p>
                  <strong>{item.medicine_name}</strong>
                </p>
                <p>
                  <strong>{item.dose_form || "-"}</strong>
                </p>
                <p>
                  <strong>{item.remarks || "-"}</strong>
                </p>
              </div>
            ))}
          </section>
          <div
            className={`text-center mt-4 ${styles.borderDashed}`}
            style={{ fontSize: "12px", color: "#777" }}
          >
            Thank you for visiting <b>TnC Pharmacy</b>. Get well soon!
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Close
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <i className="bi bi-printer"></i> Print
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default BillPreviewModal;
