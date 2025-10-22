"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { formatDateTime, formatDateOnly } from "@/utils/dateFormatter";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import Link from "next/link";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import Input from "@/app/components/Input/Input";
import toast from "react-hot-toast";
import SelectInput from "@/app/components/Input/SelectInput";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";
import { Category } from "@/types/category";
import { Medicine } from "@/types/medicine";

export default function OtherMedicineList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list: getCategoryList } = useAppSelector((state) => state.category);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  // const [selectedClinic, setSelectedClinic] = useState<
  //   Clinic | ClinicAdd | null
  // >(null);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  // const [filteredData, setFilteredData] = useState<Medicine[]>(medicines);

  //status
  // const [records, setRecords] = useState<ClinicAdd[]>([]);
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getCategoriesList());
  }, [dispatch]);

  const categoryOptions = (getCategoryList || [])
    .filter((c) => c.category_name !== "Medicines")
    .map((c: Category) => ({
      label: c.category_name,
      value: c.id,
    }));

  // filtered records by search box + status filter
  // useEffect(() => {
  //   let data = getCategoriesList || [];

  //   // 🔹 Search filter
  //   if (searchTerm) {
  //     const lower = searchTerm.toLowerCase();
  //     data = data.filter((item: Category) =>
  //       (Object.keys(item) as (keyof Category)[]).some((key) =>
  //         String(item[key] ?? "")
  //           .toLowerCase()
  //           .includes(lower)
  //       )
  //     );
  //   }

  //   // 🔹 Status filter
  //   if (status) {
  //     data = data.filter((item: Category) => item.status === status);
  //   }

  //   setFilteredData(data);
  // }, [searchTerm, status, clinics.length]); // ✅ only length (primitive)

  const handleToggleStatus = async (id: number) => {
    // Find category in the filteredData (latest UI state)
    const toggleRecords = filteredData.find((c) => c.id === id);
    if (!toggleRecords) return;

    const newStatus = toggleRecords.status === "Active" ? "Inactive" : "Active";

    try {
      // Optimistic UI update
      setFilteredData((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );

      // Update backend
      await dispatch(
        updateClinic({
          id,
          clinic: {
            clinicName: toggleRecords.clinicName,
            user_name: toggleRecords.user_name,
            login_id: toggleRecords.login_id,
            address: toggleRecords.address,
            status: newStatus,
          },
        })
      ).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");

      // Revert UI if backend fails
      setFilteredData((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: toggleRecords.status } : c
        )
      );
    }
  };

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= getCategoryList.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  // const handleView = (pharmacy: Clinic | ClinicAdd) => {
  //   setSelectedClinic(pharmacy);
  //   setShowModal(true);
  // };

  // const handleEdit = (id: number) => {
  //   const encodedId = encodeURIComponent(btoa(String(id)));
  //   router.push(`/update-clinic/${encodedId}`);
  // };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            {/* <InfiniteScroll
            loadMore={loadMore}
            hasMore={visibleCount < filteredData.length}
            className="body_content"
          > */}
            <div className="pageTitle">
              <i className="bi bi-shop-window"></i> Other Product List
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        className="txt1 rounded" // Bootstrap
                        // className="border px-3 py-2 w-full rounded-md" // Tailwind
                        placeholder="Search medicine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Category</span>
                      <select className="txt1">
                        <option>-Select-</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="txt_col">
                      <span className="lbl1">Status</span>
                      <select
                        className="txt1"
                        value={status} // ✅ controlled component ke liye
                        onChange={(event) => setStatus(event.target.value)}
                      >
                        <option value="">-Select-</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <Link
                        href={"/add-other-product"}
                        className="btn-style2 me-2"
                      >
                        <i className="bi bi-plus"></i> Add Other Product
                      </Link>
                      <button className="btn-style1">
                        <i className="bi bi-download"></i> Export Statement
                      </button>
                    </div>
                  </div>
                </div>
                {/* Table */}
                <div className="scroll_table mt-4 w-full">
                  <table className="table cust_table1">
                    <thead className="fw-bold text-dark">
                      <tr>
                        <th className="fw-bold text-start">Medicine Code</th>
                        <th className="fw-bold text-start">Medicine Name</th>
                        <th className="fw-bold text-start">Unit</th>
                        <th className="fw-bold text-start">
                          Salt Composition (Generic)
                        </th>
                        <th className="fw-bold text-start">Category</th>
                        <th className="fw-bold text-start">Sub Category</th>
                        <th className="fw-bold text-start">Manufacturer</th>
                        <th className="fw-bold text-start">Status</th>
                        <th className="fw-bold text-start">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-start">MEDICINE321321</td>
                        <td className="text-start">EYEmist Gel 10gm</td>
                        <td className="text-start">STRP</td>
                        <td className="text-start">
                          Hydroxypropylmethylcellulose (0.3% w/w)
                        </td>
                        <td className="text-start">Medicine</td>
                        <td className="text-start">Eye Care</td>
                        <td className="text-start">
                          Sun Pharmaceutical Industries Ltd
                        </td>
                        <td className="text-start">
                          <span className="status status-active"></span>
                        </td>
                        <td className="text-start">
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-eye-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-start">MEDICINE321321</td>
                        <td className="text-start">EYEmist Gel 10gm</td>
                        <td className="text-start">STRP</td>
                        <td className="text-start">
                          Hydroxypropylmethylcellulose (0.3% w/w)
                        </td>
                        <td className="text-start">Medicine</td>
                        <td className="text-start">Eye Care</td>
                        <td className="text-start">
                          Sun Pharmaceutical Industries Ltd
                        </td>
                        <td className="text-start">
                          <span className="status status-active"></span>
                        </td>
                        <td className="text-start">
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-eye-fill"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* </InfiniteScroll> */}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
      </Modal> */}
    </>
  );
}
