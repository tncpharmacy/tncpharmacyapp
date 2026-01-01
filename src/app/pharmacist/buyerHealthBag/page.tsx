"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Image, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input/Input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getPharmacistOrderByBuyerId,
  getPharmacistOrderById,
  getPharmacistOrders,
} from "@/lib/features/pharmacistOrderSlice/pharmacistOrderSlice";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import { PharmacistOrder } from "@/types/pharmacistOrder";
import InfiniteScroll from "@/app/components/InfiniteScrollS/InfiniteScrollS";
import { getPharmacyBuyersThunk } from "@/lib/features/pharmacistBuyerListSlice/pharmacistBuyerListSlice";
import { getUser } from "@/lib/auth/auth";
import {
  getBuyerById,
  getBuyerList,
  putBuyerById,
  removeBuyerById,
} from "@/lib/features/healthBagBuyerByPharmacistSlice/healthBagBuyerByPharmacistSlice";
import { BuyerData } from "@/types/buyer";
import DoseInstructionSelect from "@/app/components/Input/DoseInstructionSelect";
import { formatAmount } from "@/lib/utils/formatAmount";
import {
  createProductDuration,
  getProductDurations,
} from "@/lib/features/productDurationSlice/productDurationSlice";
import {
  createProductInstruction,
  getProductInstructions,
} from "@/lib/features/productInstructionSlice/productInstructionSlice";
import SmartCreateInput from "@/app/components/RetailCounterModal/SmartCreateInput";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
type Buyer = {
  id: number;
  name: string;
  number: string | null;
  email: string | null;
  uhid: string | null;
};

type PharmacyBuyerResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  pharmacy_id: number;
  data: Buyer[];
};

export default function OrderList() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const qtyRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pharmacy = getUser();
  const pharmacyId = Number(pharmacy?.pharmacy_id) || 0;
  const [showHistory, setShowHistory] = useState(false);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<BuyerData[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modalItems, setModalItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<{
    id: number;
    field: string;
    value: string;
  } | null>(null);

  const [editingQty, setEditingQty] = useState<{ [key: number]: string }>({});
  // LOCAL COPY — prevent flickering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localItems, setLocalItems] = useState<any[]>([]);
  const {
    buyers,
    buyer: buyerById,
    loading,
  } = useAppSelector((state) => state.healthBagBuyerByPharmacist);

  const { list: durationList } = useAppSelector(
    (state) => state.productDuration
  );

  const { list: instructionList } = useAppSelector(
    (state) => state.productInstruction
  );
  useEffect(() => {
    dispatch(getProductDurations());
    dispatch(getProductInstructions());
  }, [dispatch]);

  // Sync only when parent updates
  useEffect(() => {
    setLocalItems(modalItems);
  }, [modalItems]);
  // UI filtering directly render ke time
  useEffect(() => {
    setFilteredData(buyers);
  }, [buyers]);

  useEffect(() => {
    dispatch(getBuyerList());
  }, []);

  // filtered records by search box + status filter
  useEffect(() => {
    let data: BuyerData[] = buyers || [];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();

      data = data.filter((item: BuyerData) => {
        return Object.keys(item).some((key) => {
          const value = String(item[key as keyof BuyerData] ?? "")
            .toLowerCase()
            .trim();

          if (key === "gender") {
            // gender exact match hona chahiye
            return value === lower;
          }

          // baaki fields substring match
          return value.includes(lower);
        });
      });
    }

    setFilteredData(data);
  }, [searchTerm, buyers]);
  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= buyers.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  //   const handleExport = () => {
  //     if (!startDate || !endDate) {
  //       alert("Please select both start and end dates.");
  //       return;
  //     }
  //     if (new Date(startDate) > new Date(endDate)) {
  //       alert("Start Date cannot be after End Date!");
  //       return;
  //     }
  //     console.log("Generating report from", startDate, "to", endDate);
  //     // 🔽 yahan export / API call logic likho
  //     setShowReport(false);
  //   };

  const handleHistory = (buyerID: number) => {
    setShowHistory(true);
    setModalLoading(true);

    dispatch(getBuyerById(buyerID))
      .unwrap()
      .then((res) => {
        setModalItems(
          Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        );
      })
      .finally(() => setModalLoading(false));
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeBuyerById(id));
    setModalItems((prev) => {
      if (!Array.isArray(prev)) return []; // Prevent error
      return prev.filter((item) => item.id !== id);
    });
  };

  const saveField = async (id: number, field: string, value: string) => {
    try {
      await dispatch(
        putBuyerById({
          id,
          payload: { [field]: value },
        })
      ).unwrap();

      // Local state update
      setModalItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );

      setEditing(null);
    } catch (error) {
      console.error("PUT Error:", error);
    }
  };

  const handleQtyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const raw = e.target.value;

    // allow only digits
    if (!/^\d*$/.test(raw)) return;

    // live typing state
    setEditingQty((prev) => ({
      ...prev,
      [index]: raw,
    }));

    // 🔥 LIVE UPDATE total price because we also update modalItems
    setModalItems((prevItems) =>
      prevItems.map((it, i) =>
        i === index ? { ...it, qty: raw === "" ? "" : Number(raw) } : it
      )
    );
  };

  const handleQtyBlur = async (index: number) => {
    const newQty = editingQty[index] ?? localItems[index].qty;

    await saveField(localItems[index].id, "qty", newQty);

    // remove temporary editing
    setEditingQty((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
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
            // className="body_content"
          >
            <div style={{ overflowX: "hidden", width: "100%" }}>
              <div
                className="row align-items-center justify-content-between"
                style={{ marginLeft: 0, marginRight: 0, width: "100%" }}
              >
                <div className="pageTitle col-md-6 col-12 text-start mt-2">
                  <i className="bi bi-receipt"></i> Patient Summary
                </div>

                <div className="col-md-6 col-12 text-end mt-2 mb-2">
                  {/* <Button
                    variant="outline-primary"
                    onClick={() => setShowReport(true)}
                    className="btn-style1"
                  >
                    <i className="bi bi-file-earmark-text"></i> Generate Report
                  </Button> */}
                </div>
              </div>
            </div>

            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-8">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        placeholder="Search..."
                        className="txt1"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        {/* <th style={{ width: "0px" }}></th> */}
                        <th className="fw-bold text-start">Id</th>
                        <th className="fw-bold text-start">Profile Image</th>
                        <th className="fw-bold text-start">Name</th>
                        <th className="fw-bold text-start">Mobile</th>
                        <th className="fw-bold text-start">Email</th>
                        <th className="fw-bold text-start">UHID</th>
                        <th className="fw-bold text-start">Status</th>
                        <th className="fw-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <TableLoader colSpan={9} text="Loading records..." />
                      ) : (
                        <>
                          {Array.isArray(filteredData) &&
                            filteredData
                              .slice(0, visibleCount)
                              .map((p: BuyerData) => {
                                return (
                                  <tr key={p.id}>
                                    {/* <td></td> */}
                                    <td className="text-start">{p.id ?? ""}</td>

                                    <td className="text-start">
                                      <Image
                                        src={
                                          p.profile_pic
                                            ? `${mediaBase}${p.profile_pic}`
                                            : "/images/default-profile.jpg"
                                        }
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "/images/default-profile.jpg";
                                        }}
                                        alt={p.name}
                                        className="rounded-circle"
                                        style={{
                                          width: "40px",
                                          height: "40px",
                                          objectFit: "cover",
                                          border: "1px solid #ddd",
                                        }}
                                      />
                                    </td>

                                    <td className="text-start">
                                      {p.name ?? ""}
                                    </td>
                                    <td className="text-start">
                                      {p.number ?? ""}
                                    </td>
                                    <td className="text-start">
                                      {p.email ?? ""}
                                    </td>
                                    <td className="text-start">
                                      {p.uhid ?? ""}
                                    </td>
                                    <td className="text-start">
                                      {p.status ?? ""}
                                    </td>
                                    <td className="text-center">
                                      <button
                                        className="btn btn-light btn-sm"
                                        title="Patient HealthBag"
                                        onClick={() => handleHistory(p.id)}
                                      >
                                        <i className="bi bi-cart-plus-fill"></i>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                        </>
                      )}
                      {/* Spinner row */}
                      {loadings && (
                        <TableLoader colSpan={9} text="Loading more..." />
                      )}
                      {/* No more records */}
                      {!loading && !loadings && buyers.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-2 text-muted fw-bold fs-6"
                          >
                            No records found
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        !loadings &&
                        buyers.length > 0 &&
                        visibleCount >= buyers.length && (
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
      {/* ===========================
    PATIENT DETAILS MODAL
=========================== */}
      <Modal
        show={showHistory}
        onHide={() => setShowHistory(false)}
        size="xl"
        centered
        style={{
          backdropFilter: "blur(4px)",
        }}
      >
        <Modal.Header
          closeButton
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #eaeaea",
            background: "#f9f9f9",
          }}
        >
          <Modal.Title style={{ fontSize: "20px", fontWeight: 700 }}>
            <i className="bi bi-cart"></i> Health Bag / Billing Cart{" "}
            <span style={{ fontWeight: 700, color: "#555" }}>
              ({buyerById?.length ?? 0} items)
            </span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            padding: "22px",
            background: "#ffffff",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {modalLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #e5e5e5",
              }}
            >
              <table
                className="table"
                style={{
                  margin: 0,
                  fontSize: "14px",
                  background: "white",
                }}
              >
                <thead
                  style={{
                    background: "#f2f2f2",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  <tr>
                    <th className="fw-bold text-start">Medicine Name</th>
                    <th className="fw-bold text-start">Qty</th>
                    <th className="fw-bold text-start">Doses</th>
                    <th className="fw-bold text-start">Instruction</th>
                    <th className="fw-bold text-start">Duration</th>
                    <th className="fw-bold text-start">MRP/Unit</th>
                    <th className="fw-bold text-start">Total Price</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {modalItems?.map((item: any, index: number) => (
                    <tr key={item.id}>
                      <td className="text-start">{item.productname ?? ""}</td>

                      {/* =================== QTY Editable =================== */}
                      <td className="text-start" style={{ width: "110px" }}>
                        <input
                          ref={(el) => {
                            if (!el) return;
                            qtyRefs.current[index] = el;
                          }}
                          type="text"
                          className="form-control"
                          style={{ padding: "4px 6px", height: "38px" }}
                          value={
                            editingQty[index] ??
                            String(localItems[index]?.qty ?? "")
                          }
                          onChange={(e) => handleQtyChange(e, index)}
                          onBlur={() => handleQtyBlur(index)}
                          maxLength={2}
                        />
                      </td>

                      {/* =================== DOSES (Dropdown) =================== */}
                      <td className="text-start" style={{ width: "120px" }}>
                        <DoseInstructionSelect
                          type="select"
                          label=""
                          isTableEditMode={true}
                          name="dose_form"
                          value={item.doses || ""}
                          onChange={(e) =>
                            saveField(item.id, "doses", e.target.value)
                          }
                        />
                      </td>

                      {/* =================== INSTRUCTION Editable =================== */}
                      {/* <td className="text-start" style={{ width: "150px" }}>
                        <input
                          type="text"
                          className="form-control"
                          style={{ padding: "4px 6px", height: "38px" }}
                          value={item.instruction || ""}
                          onChange={(e) => {
                            const val = e.target.value;

                            // UI update
                            setModalItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id
                                  ? { ...x, instruction: val }
                                  : x
                              )
                            );

                            // API update
                            saveField(item.id, "instruction", val);
                          }}
                        />
                      </td> */}
                      <td className="text-start" style={{ width: "150px" }}>
                        <SmartCreateInput
                          label="" // table me label nahi chahiye
                          placeholder=""
                          value={item.instruction || ""}
                          list={instructionList} // redux se aane wali list
                          createAction={createProductInstruction}
                          refreshAction={getProductInstructions}
                          onChange={(val) => {
                            // ✅ UI update
                            setModalItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id
                                  ? { ...x, instruction: val }
                                  : x
                              )
                            );

                            // ✅ API update (same as before)
                            saveField(item.id, "instruction", val);
                          }}
                        />
                      </td>

                      {/* =================== DURATION Editable =================== */}
                      <td
                        className="text-start"
                        style={{ width: "120px", position: "relative" }}
                      >
                        <SmartCreateInput
                          label=""
                          placeholder=""
                          value={item.duration || ""}
                          list={durationList}
                          createAction={createProductDuration}
                          refreshAction={getProductDurations}
                          onChange={(val) => {
                            // ✅ UI update
                            setModalItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id ? { ...x, duration: val } : x
                              )
                            );

                            // ✅ API update (same as before)
                            saveField(item.id, "duration", val);
                          }}
                        />
                      </td>

                      {/* =================== MRP / UNIT =================== */}
                      <td className="text-start">
                        ₹{formatAmount(Number(item.mrp || 0))}
                      </td>

                      {/* =================== TOTAL PRICE Auto Update =================== */}
                      <td className="text-start">
                        ₹{formatAmount(Number(item.qty) * Number(item.mrp))}
                      </td>

                      {/* =================== Remove =================== */}
                      <td className="text-start">
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>
            Close
          </Button>
          {/* <Button variant="primary">Add To Patient HealthBag</Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
}
