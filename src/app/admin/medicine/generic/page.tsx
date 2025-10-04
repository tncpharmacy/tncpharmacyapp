"use client";

import { useEffect, useState } from "react";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getGenerics,
  getGenericsAllList,
  // createGeneric,
  // deleteGeneric,
  // updateGeneric,
} from "@/lib/features/genericSlice/genericSlice";
import { Generic, CreateGenericDTO } from "@/types/generic";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import toast from "react-hot-toast";

export default function AddGeneric() {
  const dispatch = useAppDispatch();
  // redux se generics uthana
  const { list: generics } = useAppSelector((state) => state.generic);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Generic[]>(generics);

  //status
  const [status, setStatus] = useState<string>("");

  const [formData, setFormData] = useState<Partial<Generic>>({
    id_generic: 0,
    generic_name: "",
    status: "Active",
  });

  // Reset Your From
  const handleReset = () => {
    setFormData({
      id_generic: 0,
      generic_name: "",
      status: "Active",
    });
  };

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getGenerics());
  }, [dispatch]);

  // filtered records by search box + status filter
  useEffect(() => {
    let data = generics ? [...generics] : [];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: Generic) =>
        (Object.keys(item) as (keyof Generic)[]).some((key) => {
          const value = item[key];
          return (
            typeof value === "string" && value.toLowerCase().includes(lower)
          );
        })
      );
    }

    // 🔹 Ascending order by id
    data = data.sort((a, b) => a.id_generic - b.id_generic);
    setFilteredData(data);
  }, [searchTerm, generics]); // ✅ use entire array, not just length

  // const handleToggleStatus = async (id: number) => {
  //   // Find category in the filteredData (latest UI state)
  //   const category = filteredData.find((c) => c.id === id);
  //   if (!category) return;

  //   const newStatus = category.status === "Active" ? "Inactive" : "Active";

  //   try {
  //     // Optimistic UI update
  //     setFilteredData((prev) =>
  //       prev.map((c) => (c.id_generic === id ? { ...c, status: newStatus } : c))
  //     );

  //     // Update backend
  //     await dispatch(
  //       updateGeneric({
  //         id,
  //         generic_name: category.generic_name,
  //         status: newStatus,
  //       })
  //     ).unwrap();

  //     toast.success(`Status updated to ${newStatus}`);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to update status");

  //     // Revert UI if backend fails
  //     setFilteredData((prev) =>
  //       prev.map((c) => (c.id === id ? { ...c, status: category.status } : c))
  //     );
  //   }
  // };

  //infinte scroll records

  const loadMore = () => {
    if (loadings || visibleCount >= generics.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleEdit = (id: number) => {
    const generic = generics.find((item) => item.id_generic === id);
    if (generic) {
      setFormData({
        id_generic: generic.id_generic,
        generic_name: generic.generic_name,
        status: generic.status,
      });
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const formDataToAppend: CreateGenericDTO = {
  //       generic_name: formData.generic_name || "",
  //       status: "Active",
  //     };

  //     console.log("Sending payload:", formDataToAppend);

  //     if (formData.id_generic && formData.id_generic > 0) {
  //       // ✅ Update only
  //       await dispatch(
  //         updateGeneric({
  //           id: formData.id,
  //           ...formDataToAppend,
  //         })
  //       ).unwrap();
  //       toast.success("Generic updated successfully!");
  //     } else {
  //       // ✅ Create only
  //       await dispatch(createGeneric(formDataToAppend)).unwrap();
  //       toast.success("Generic Created successfully!");
  //     }

  //     // ✅ Refresh list after create/update
  //     dispatch(getGenerics());
  //     setVisibleCount(10);
  //     // Reset form
  //     setFormData({
  //       id_generic: 0,
  //       generic_name: "",
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
                      <i className="bi bi-card-list"></i> Generic List
                    </h5>

                    {/* Right side - Search */}
                    <div className="d-flex">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Generic..."
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
                          <th className="text-start">Generic</th>
                          {/* <th className="text-start">Description</th> */}
                          <th className="text-start">Status</th>
                          <th className="text-start">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, visibleCount).map((p, index) => (
                          <tr key={p.id_generic ?? index}>
                            <td className="text-start">{p.id_generic}</td>
                            <td className="text-start">
                              {p.generic_name ?? "-"}
                            </td>
                            {/* <td className="text-start">{p.description ?? "-"}</td> */}
                            <td className="text-start">
                              <span
                                //onClick={() => handleToggleStatus(p.id_generic)}
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
                                onClick={() => handleEdit(p.id_generic)}
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
                    <h5>Add Generic</h5>
                    <hr className="w-100" />
                    <form
                    // onSubmit={handleSubmit}
                    >
                      <div className="row">
                        <div className="col-md-12">
                          <div className="txt_col">
                            <span className="lbl1">Generic</span>
                            <input
                              type="text"
                              className="txt1"
                              name="Generic_name"
                              value={formData.generic_name || ""}
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
