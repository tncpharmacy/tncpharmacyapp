"use client";

import { useEffect, useState } from "react";
import "../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import { ContactItem } from "@/types/contactUs";
import {
  getAllContacts,
  getContactById,
  removeContact,
} from "@/lib/features/contactUsSlice/contactUsSlice";
import { Modal, Spinner } from "react-bootstrap";

export default function ContactUs() {
  const dispatch = useAppDispatch();

  const {
    list: contactUsList,
    selected,
    loading,
  } = useAppSelector((state) => state.contactUs);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtered data
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] =
    useState<ContactItem[]>(contactUsList);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Fetch on load
  useEffect(() => {
    dispatch(getAllContacts());
  }, [dispatch]);

  // Filter Data
  useEffect(() => {
    let data = [...contactUsList];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: ContactItem) =>
        (Object.keys(item) as (keyof ContactItem)[]).some((key) => {
          const val = item[key];
          return typeof val === "string" && val.toLowerCase().includes(lower);
        })
      );
    }

    data.sort((a, b) => a.id - b.id);
    setFilteredData(data);
  }, [searchTerm, contactUsList]);

  // Load More
  const loadMore = () => {
    if (loadingMore || visibleCount >= filteredData.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadingMore(false);
    }, 2000);
  };

  // View Details Modal
  const handleView = async (id: number) => {
    await dispatch(getContactById(id));
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    await dispatch(removeContact(deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <>
      <Header />

      <style jsx>{`
        /* MODAL DESIGN */
        /* Modal card container */
        .contact-details-modal .modal-content {
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
        }

        /* Each detail card box */
        .detail-card {
          background: #f8fbff;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease-in-out;
        }

        .detail-card:hover {
          background: #f0f6ff;
          border-color: #bdd7ff;
        }

        /* Label styling */
        .detail-card label {
          font-size: 14px;
          font-weight: 600;
          color: #0056d6;
          margin-bottom: 3px;
          display: block;
        }

        /* Value text */
        .detail-card p {
          margin: 0;
          font-size: 15px;
          color: #333;
          font-weight: 500;
        }
      `}</style>

      <div className="body_wrap">
        <SideNav />

        <div className="body_right">
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={visibleCount < filteredData.length}
            className="body_content"
          >
            <div className="pageTitle">
              <i className="bi bi-person-lines-fill me-2"></i> Contact Us
            </div>

            <div className="main_content">
              <div className="col-sm-12 shadow-sm">
                {/* Search */}
                <div className="row">
                  <div className="col-md-8">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        className="txt1"
                        placeholder="Search Contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="scroll_table mt-4">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th></th>
                        <th className="text-start">Name</th>
                        <th className="text-start">Mobile</th>
                        <th className="text-start">Email</th>
                        <th className="text-start">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredData.slice(0, visibleCount).map((p) => (
                        <tr key={p.id}>
                          <td></td>
                          <td className="text-start">{p.name}</td>
                          <td className="text-start">{p.number}</td>
                          <td className="text-start">{p.email}</td>
                          <td className="text-start">
                            {/* View Button */}
                            <button
                              className="btn btn-light btn-sm me-2"
                              onClick={() => handleView(p.id)}
                            >
                              <i className="bi bi-eye text-primary fs-5"></i>
                            </button>

                            {/* Delete Button */}
                            <button
                              className="btn btn-light btn-sm me-2"
                              onClick={() => handleDelete(p.id)}
                            >
                              <i className="bi bi-trash text-danger fs-5"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {loadingMore && (
                  <center>
                    <Spinner animation="border" className="my-3" />
                  </center>
                )}
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>

      {/* ---------------------------
        DETAILS MODAL
      ---------------------------- */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="contact-details-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold d-flex align-items-center">
            <i className="bi bi-person-badge me-2 text-primary fs-4"></i>
            <span className="text-primary">Contact Details</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading || !selected ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="container-fluid">
              {/* Row 1 */}
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Name</label>
                    <p>{selected.name}</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Mobile</label>
                    <p>{selected.number}</p>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Email</label>
                    <p>{selected.email}</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Subject</label>
                    <p>{selected.subject}</p>
                  </div>
                </div>
              </div>

              {/* Row 3 Full Width */}
              <div className="row g-3 mt-2">
                <div className="col-md-12">
                  <div className="detail-card">
                    <label>Message</label>
                    <p>{selected.contact_summary}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-secondary rounded-pill px-4 py-2"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        size="sm"
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">
            <i className="bi bi-trash me-2"></i> Confirm Delete
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-start">
          <p style={{ fontSize: "16px" }}>
            Are you sure you want to delete this contact record?
          </p>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-secondary rounded-pill px-3"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>

          <button
            className="btn btn-danger rounded-pill px-3"
            onClick={confirmDelete}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
