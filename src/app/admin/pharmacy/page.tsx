"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "../components/SideNav/page";
import Header from "../components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPharmacy,
  togglePharmacyStatus,
} from "@/lib/features/pharmacySlice/pharmacySlice";
import type { PharmacySuperAdminForm, Pharmacy } from "@/types/pharmacy";
import { useRouter } from "next/navigation";
import { formatDateTime, formatDateOnly } from "@/utils/dateFormatter";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import Link from "next/link";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import Input from "@/app/components/Input/Input";

export default function Pharmacy() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list, loading } = useAppSelector((state) => state.pharmacy);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<
    Pharmacy | PharmacySuperAdminForm | null
  >(null);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Pharmacy[]>(list);

  //status
  const [records, setRecords] = useState<Pharmacy[]>([]);
  const [status, setStatus] = useState<string>("");

  // filtered records by search box + status filter
  useEffect(() => {
    let data = list || [];

    // 🔹 Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: Pharmacy) =>
        (Object.keys(item) as (keyof Pharmacy)[]).some((key) =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(lower)
        )
      );
    }

    // 🔹 Status filter
    if (status) {
      data = data.filter((item: Pharmacy) => item.status === status);
    }

    setFilteredData(data);
  }, [searchTerm, status, list.length]); // ✅ only length (primitive)

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(fetchPharmacy());
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
      dispatch(togglePharmacyStatus(id));
    }
  };

  const handleView = (pharmacy: Pharmacy | PharmacySuperAdminForm) => {
    setSelectedPharmacy(pharmacy);
    setShowModal(true);
  };

  const handleEdit = (id: number) => {
    const encodedId = encodeURIComponent(btoa(String(id)));
    router.push(`/update-pharmacy/${encodedId}`);
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
                      <Link href={"/add-pharmacy"} className="btn-style2 me-2">
                        <i className="bi bi-plus"></i> Add Pharmacy
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
                        <th className="fw-bold">Pharmacy Id</th>
                        <th className="fw-bold">Pharmacy Name</th>
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
                          <td>{p.pharmacy_id_code}</td>
                          <td>{p.pharmacy_name ?? "-"}</td>
                          <td>{p.user_name ?? "-"}</td>
                          <td>{p.license_number}</td>
                          <td>{p.license_valid_upto}</td>
                          <td>{p.email_id}</td>
                          <td>{p.login_id ?? "-"}</td>
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
          {selectedPharmacy ? (
            (() => {
              const { date: createdDate, time: createdTime } = formatDateTime(
                selectedPharmacy?.created_on
              );
              const { date: updatedDate, time: updatedTime } = formatDateTime(
                selectedPharmacy?.updated_on
              );

              return (
                <div>
                  <p>
                    <strong>Pharmacy Id:</strong>{" "}
                    {selectedPharmacy.pharmacy_id_code}
                  </p>
                  <p>
                    <strong>Pharmacy Name:</strong>{" "}
                    {selectedPharmacy.pharmacy_name ?? "-"}
                  </p>
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {selectedPharmacy.user_name ?? "-"}
                  </p>
                  <p>
                    <strong>GST No.:</strong> {selectedPharmacy.gst_number}
                  </p>
                  <p>
                    <strong>License No.:</strong>{" "}
                    {selectedPharmacy.license_number}
                  </p>
                  <p>
                    <strong>License Validity:</strong>{" "}
                    {formatDateOnly(selectedPharmacy.license_valid_upto)}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedPharmacy.email_id}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedPharmacy.login_id ?? "-"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedPharmacy.address ??
                      selectedPharmacy.district ??
                      "-"}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {selectedPharmacy.pincode}
                  </p>
                  <p>
                    <strong>Created On:</strong> {createdDate} at {createdTime}
                  </p>
                  <p>
                    <strong>Updated On:</strong> {updatedDate} at {updatedTime}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedPharmacy.status}
                  </p>
                  <hr />
                  <h5>Documents:</h5>
                  <div
                    style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
                  >
                    {selectedPharmacy.documents &&
                    selectedPharmacy.documents.length > 0 ? (
                      selectedPharmacy.documents.map((doc) => (
                        <img
                          key={doc.id}
                          src={`http://68.183.174.17:8081${doc.document}`}
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
