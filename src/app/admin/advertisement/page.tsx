"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useRouter } from "next/navigation";

export default function Advertisement() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    redirect_url: string;
    start_date: string;
    end_date: string;
    priority: number | string;
    position: string;
    status: string;
    banner: File | null;
  }>({
    title: "",
    description: "",
    redirect_url: "",
    start_date: "",
    end_date: "",
    priority: "",
    position: "",
    status: "Active",
    banner: null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // 🔥 File input handling
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    // 🔥 Other inputs handling
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Your submit logic...
    console.log(formData);
  };

  return (
    <>
      <Header />

      <div className="body_wrap">
        <SideNav />

        <div className="body_right">
          <div className="body_content">
            {/* Page Title */}
            <div className="pageTitle">
              <i className="bi bi-badge-ad-fill me-2"></i> Advertisement Create
              <button
                onClick={() => router.back()}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>

            {/* Main Content */}
            <div className="main_content">
              <div className="card shadow-sm p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter advertisement title"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">Redirect URL</label>
                    <input
                      type="text"
                      name="redirect_url"
                      placeholder="https://example.com or /route"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-12">
                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Enter description"
                      className="form-control"
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Position</label>
                    <select
                      name="position"
                      className="form-select"
                      onChange={handleChange}
                    >
                      <option>Select Position</option>
                      <option value="home_top">Home Top Banner</option>
                      <option value="home_middle">Home Middle Banner</option>
                      <option value="popup">Popup Banner</option>
                      <option value="side_banner">Side Banner</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Priority (0 - 100)
                    </label>
                    <input
                      type="number"
                      name="priority"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Advertisement Banner
                    </label>
                    <input
                      type="file"
                      name="banner"
                      className="form-control"
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      Recommended Size: 1920 × 600px
                    </small>
                  </div>
                </div>

                <div className="text-end">
                  <button className="btn btn-primary px-4 py-2">
                    Save Advertisement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
