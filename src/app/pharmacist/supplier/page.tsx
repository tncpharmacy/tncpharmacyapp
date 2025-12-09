"use client";

import { useEffect, useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "../components/SideNav/page";
import Header from "../components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import type { Supplier } from "@/types/supplier";
import { useRouter } from "next/navigation";
import { formatDateTime, formatDateOnly } from "@/utils/dateFormatter";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import Link from "next/link";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import Input from "@/app/components/Input/Input";
import {
  fetchSupplier,
  togglSupplierStatus,
} from "@/lib/features/supplierSlice/supplierSlice";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function Supplier() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list } = useAppSelector((state) => state.supplier);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Supplier[]>(list);

  //status
  const [status, setStatus] = useState<string>("");

  // filtered records by search box + status filter
  useEffect(() => {
    let data = list || [];

    // 🔹 Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: Supplier) =>
        (Object.keys(item) as (keyof Supplier)[]).some((key) =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(lower)
        )
      );
    }

    // 🔹 Status filter
    if (status) {
      data = data.filter((item: Supplier) => item.status === status);
    }

    setFilteredData(data);
  }, [searchTerm, status, list]); // ✅ only length (primitive)

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(fetchSupplier());
  }, [dispatch]);

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= list.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to change status of this pharmacy?")) {
      dispatch(togglSupplierStatus(id));
    }
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleEdit = (id: number) => {
    const encodedId = encodeURIComponent(btoa(String(id)));
    router.push(`/pharmacist/update-supplier/${encodedId}`);
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
              <i className="bi bi-shop-window"></i> Pharmacy List
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        className="txt1 rounded" // Bootstrap
                        // className="border px-3 py-2 w-full rounded-md" // Tailwind
                        placeholder="Search pharmacy..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Input
                    label="Status"
                    name="status"
                    type="select"
                    value={status}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                    onChange={(event) => setStatus(event.target.value)}
                  />
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <Link
                        href={"/pharmacist/add-supplier"}
                        className="btn-style2 me-2"
                      >
                        <i className="bi bi-plus"></i> Add Supplier
                      </Link>
                      <button className="btn-style1">
                        <i className="bi bi-download"></i> Export Statement
                      </button>
                    </div>
                  </div>
                </div>
                {/* Table */}
                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead className="fw-bold text-dark">
                      <tr>
                        <th className="fw-bold">Supplier Id</th>
                        <th className="fw-bold">Supplier Name</th>
                        <th className="fw-bold">Contact Person</th>
                        <th className="fw-bold">License No.</th>
                        <th className="fw-bold">License Validity</th>
                        <th className="fw-bold">Email ID</th>
                        <th className="fw-bold">Contact No</th>
                        <th className="fw-bold">Address</th>
                        <th className="fw-bold">Status</th>
                        <th className="fw-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, visibleCount).map((p) => (
                        <tr key={p.id}>
                          <td>{p.supplier_id_code}</td>
                          <td>{p.supplier_name ?? "-"}</td>
                          <td>{p.user_name ?? "-"}</td>
                          <td>{p.license_number}</td>
                          <td>{p.license_valid_upto}</td>
                          <td>{p.email_id}</td>
                          <td>{p.supplier_mobile ?? "-"}</td>
                          <td>{p.address ?? p.district ?? "-"}</td>
                          <td>
                            <span
                              onClick={() => handleDelete(p.id)}
                              className={`status ${
                                p.status === "Active"
                                  ? "status-active"
                                  : "status-inactive"
                              } cursor-pointer`}
                              title="Click to change status"
                            >
                              {p.status === "Active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-light btn-sm me-2"
                              onClick={() => handleEdit(p.id)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-light btn-sm"
                              onClick={() => handleView(p)}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Spinner row */}
                      {loadings && (
                        <TableLoader colSpan={9} text="Loading more..." />
                      )}

                      {/* No more records */}
                      {!loadings && visibleCount >= list.length && (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-2 text-muted fw-bold fs-6"
                          >
                            No more records
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pharmacy Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSupplier ? (
            (() => {
              const { date: createdDate, time: createdTime } = formatDateTime(
                selectedSupplier?.created_on
              );
              const { date: updatedDate, time: updatedTime } = formatDateTime(
                selectedSupplier?.updated_on
              );

              return (
                <div>
                  <p>
                    <strong>Pharmacy Id:</strong>{" "}
                    {selectedSupplier.supplier_id_code || ""}
                  </p>
                  <p>
                    <strong>Pharmacy Name:</strong>{" "}
                    {selectedSupplier.supplier_name ?? "-"}
                  </p>
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {selectedSupplier.user_name ?? "-"}
                  </p>
                  <p>
                    <strong>GST No.:</strong> {selectedSupplier.gst_number}
                  </p>
                  <p>
                    <strong>License No.:</strong>{" "}
                    {selectedSupplier.license_number}
                  </p>
                  <p>
                    <strong>License Validity:</strong>{" "}
                    {formatDateOnly(selectedSupplier.license_valid_upto)}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedSupplier.email_id}
                  </p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {selectedSupplier.supplier_mobile ?? "-"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedSupplier.address ??
                      selectedSupplier.district ??
                      "-"}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {selectedSupplier.pincode}
                  </p>
                  <p>
                    <strong>Created On:</strong> {createdDate} at {createdTime}
                  </p>
                  <p>
                    <strong>Updated On:</strong> {updatedDate} at {updatedTime}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedSupplier.status}
                  </p>
                  <hr />
                  <h5>Documents:</h5>
                  <div
                    style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
                  >
                    {selectedSupplier.documents &&
                    selectedSupplier.documents.length > 0 ? (
                      selectedSupplier.documents.map((doc) => (
                        <Image
                          key={doc.id}
                          src={`${mediaBase}${doc.document}`}
                          alt="Pharmacy Document"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                          }}
                        />
                      ))
                    ) : (
                      <p>No documents uploaded.</p>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <p>No details found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
