"use client";

import { useEffect, useState } from "react";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getManufacturers,
  getManufacturersAllList,
  // createManufacturer,
  // deleteManufacturer,
  // updateManufacturer,
} from "@/lib/features/manufacturerSlice/manufacturerSlice";
import { Manufacturer, CreateManufacturerDTO } from "@/types/manufacturer";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import toast from "react-hot-toast";

export default function AddManufacturer() {
  const dispatch = useAppDispatch();
  // redux se MgetManufacturers uthana
  const { list: manufacturers } = useAppSelector((state) => state.manufacturer);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] =
    useState<Manufacturer[]>(manufacturers);

  //status
  const [status, setStatus] = useState<string>("");

  const [formData, setFormData] = useState<Partial<Manufacturer>>({
    id_manufacturer: 0,
    manufacturer_name: "",
    status: "Active",
  });

  // Reset Your From
  const handleReset = () => {
    setFormData({
      id_manufacturer: 0,
      manufacturer_name: "",
      status: "Active",
    });
  };

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getManufacturers());
  }, [dispatch]);

  // filtered records by search box + status filter
  useEffect(() => {
    let data = manufacturers ? [...manufacturers] : [];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: Manufacturer) =>
        (Object.keys(item) as (keyof Manufacturer)[]).some((key) => {
          const value = item[key];
          return (
            typeof value === "string" && value.toLowerCase().includes(lower)
          );
        })
      );
    }
    // 🔹 Ascending order by id
    data = data.sort((a, b) => a.id_manufacturer - b.id_manufacturer);
    setFilteredData(data);
  }, [searchTerm, manufacturers]); // ✅ use entire array, not just length

  // const handleToggleStatus = async (id: number) => {
  //   // Find category in the filteredData (latest UI state)
  //   const category = filteredData.find((c) => c.id === id);
  //   if (!category) return;

  //   const newStatus = category.status === "Active" ? "Inactive" : "Active";

  //   try {
  //     // Optimistic UI update
  //     setFilteredData((prev) =>
  //       prev.map((c) =>
  //         c.id_manufacturer === id ? { ...c, status: newStatus } : c
  //       )
  //     );

  //     // Update backend
  //     await dispatch(
  //       updateManufacture({
  //         id,
  //         manufacturer_name: category.manufacturer_name,
  //         status: newStatus,
  //       })
  //     ).unwrap();

  //     toast.success(`Status updated to ${newStatus}`);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to update status");

  //     // Revert UI if backend fails
  //     setFilteredData((prev) =>
  //       prev.map((c) =>
  //         c.id_manufacturer === id ? { ...c, status: category.status } : c
  //       )
  //     );
  //   }
  // };

  //infinte scroll records

  const loadMore = () => {
    if (loadings || visibleCount >= manufacturers.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleEdit = (id: number) => {
    const Manufacturer = manufacturers.find(
      (item) => item.id_manufacturer === id
    );
    if (Manufacturer) {
      setFormData({
        id_manufacturer: Manufacturer.id_manufacturer,
        manufacturer_name: Manufacturer.manufacturer_name,
        status: Manufacturer.status,
      });
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const formDataToAppend: CreateManufacturerDTO = {
  //       Manufacturer_name: formData.Manufacturer_name || "",
  //       status: "Active",
  //     };

  //     console.log("Sending payload:", formDataToAppend);

  //     if (formData.id_manufacturer && formData.id_manufacturer > 0) {
  //       // ✅ Update only
  //       await dispatch(
  //         updateManufacturer({
  //           id: formData.id,
  //           ...formDataToAppend,
  //         })
  //       ).unwrap();
  //       toast.success("Manufacturer updated successfully!");
  //     } else {
  //       // ✅ Create only
  //       await dispatch(createManufacturer(formDataToAppend)).unwrap();
  //       toast.success("Manufacturer Created successfully!");
  //     }

  //     // ✅ Refresh list after create/update
  //     dispatch(getManufacturers());
  //     setVisibleCount(10);
  //     // Reset form
  //     setFormData({
  //       id_manufacturer: 0,
  //       Manufacturer_name: "",
  //       description: "",
  //       status: "Active",
  //     });
  //   } catch (err) {
  //     console.error("Error in handleSubmit:", err);
  //     alert("Something went wrong!");
  //   }
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            <div className="main_content">
              <div className="row">
                {/* Left Side - Table */}
                <div className="col-sm-8 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {/* Left side - Title */}
                    <h5 className="mb-0">
                      <i className="bi bi-card-list"></i> Manufacturer List
                    </h5>

                    {/* Right side - Search */}
                    <div className="d-flex">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Manufacturer..."
                        style={{ width: "550px" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="scroll_table mt-4 w-full">
                    <table className="table cust_table1">
                      <thead>
                        <tr>
                          <th className="text-start">Id</th>
                          <th className="text-start">Manufacturer</th>
                          {/* <th className="text-start">Description</th> */}
                          <th className="text-start">Status</th>
                          <th className="text-start">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, visibleCount).map((p, index) => (
                          <tr key={p.id_manufacturer ?? index}>
                            <td className="text-start">{p.id_manufacturer}</td>
                            <td className="text-start">
                              {p.manufacturer_name ?? "-"}
                            </td>
                            {/* <td className="text-start">{p.description ?? "-"}</td> */}
                            <td className="text-start">
                              <span
                                //onClick={() => handleToggleStatus(p.id_manufacturer)}
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
                            <td className="text-start">
                              <button
                                className="btn btn-light btn-sm me-2"
                                onClick={() => handleEdit(p.id_manufacturer)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="col-sm-4">
                  <div className="card p-3 shadow-sm">
                    <h5>Add Manufacturer</h5>
                    <hr className="w-100" />
                    <form
                    // onSubmit={handleSubmit}
                    >
                      <div className="row">
                        <div className="col-md-12">
                          <div className="txt_col">
                            <span className="lbl1">Manufacturer</span>
                            <input
                              type="text"
                              className="txt1"
                              name="Manufacturer_name"
                              value={formData.manufacturer_name || ""}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <button className="btn btn-primary text-left">
                          Submit
                        </button>
                        <button
                          className="btn btn-primary text-right"
                          type="button"
                          onClick={handleReset}
                        >
                          Clear
                        </button>
                      </div>
                    </form>
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
