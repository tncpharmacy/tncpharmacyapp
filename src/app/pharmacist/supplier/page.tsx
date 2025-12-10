"use client";

import { useEffect, useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
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
  toggleSupplierStatus,
} from "@/lib/features/supplierSlice/supplierSlice";
import toast from "react-hot-toast";
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

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    if (
      confirm(
        `Are you sure you want to ${
          currentStatus === "Active" ? "Inactive" : "Active"
        } this supplier?`
      )
    ) {
      const res = await dispatch(toggleSupplierStatus(id));
      const payload = res?.payload;

      if (payload && typeof payload === "object" && "status" in payload) {
        // Status successfully toggled
        const newStatus = payload.status; // "Active" / "Inactive"

        toast.success(
          `Supplier has been ${
            newStatus === "Active" ? "activated" : "deactivated"
          } successfully!`
        );
      } else {
        toast.error("Something went wrong!");
      }
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
              <i className="bi bi-shop-window"></i> Supplier List
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
                        <th className="fw-bold">Mobile</th>
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
                              onClick={() => handleToggleStatus(p.id, p.status)}
                              className={`status ${
                                p.status === "Active"
                                  ? "status-active"
                                  : "status-deactive"
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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-primary">
            Supplier Details
          </Modal.Title>
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
                <div className="p-2">
                  {/* Profile Section */}
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <Image
                      src={
                        selectedSupplier.profile_image
                          ? `${mediaBase}${selectedSupplier.profile_image}`
                          : "/images/default-profile.jpg" // default image
                      }
                      alt="Pharmacy"
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #0d6efd",
                      }}
                    />

                    <div>
                      <h4 className="mb-1 text-capitalize text-primary">
                        {selectedSupplier.supplier_name}
                      </h4>
                      <span
                        className={`badge px-3 py-2 ${
                          selectedSupplier.status === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {selectedSupplier.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="row g-3 mb-3">
                    {[
                      ["Supplier Id", selectedSupplier.supplier_id_code],
                      ["Contact Person", selectedSupplier.user_name ?? "-"],
                      ["GST No.", selectedSupplier.gst_number],
                      ["License No.", selectedSupplier.license_number],
                      [
                        "License Validity",
                        formatDateOnly(selectedSupplier.license_valid_upto),
                      ],
                      ["Email", selectedSupplier.email_id],
                      ["Mobile", selectedSupplier.supplier_mobile ?? "-"],
                      [
                        "Address",
                        selectedSupplier.address ||
                          selectedSupplier.district ||
                          "-",
                      ],
                      ["Pincode", selectedSupplier.pincode],
                      ["Created On", `${createdDate} at ${createdTime}`],
                      ["Updated On", `${updatedDate} at ${updatedTime}`],
                    ].map(([label, value], idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="border rounded p-2 bg-light">
                          <strong>{label}:</strong> <br />
                          <span className="text-secondary">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Documents Section */}
                  <h5 className="mt-4 fw-bold">Documents</h5>
                  <hr />

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
                            width: "140px",
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                          }}
                        />
                      ))
                    ) : (
                      <Image
                        src="/images/tnc-default.png"
                        alt="Default Pharmacy"
                        style={{
                          width: "140px",
                          height: "140px",
                          objectFit: "contain",
                          borderRadius: "10px",
                          border: "1px solid #ddd",
                          background: "#f8f9fa",
                          padding: "10px",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <p>No details found.</p>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
