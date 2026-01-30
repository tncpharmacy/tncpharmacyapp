"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Image, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
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
import {
  getPharmacyBuyersThunk,
  getSuperAdminBuyersThunk,
} from "@/lib/features/pharmacistBuyerListSlice/pharmacistBuyerListSlice";
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
  // const pharmacy = getUser();
  // const pharmacyId = Number(pharmacy?.pharmacy_id) || 0;
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

  const { superAdminBuyers, loadingSuperAdminBuyers } = useAppSelector(
    (state) => state.pharmacistBuyerList
  );

  const buyersResponse = superAdminBuyers as unknown as {
    data?: BuyerData[];
  };

  const buyerList: BuyerData[] = useMemo(() => {
    return Array.isArray(buyersResponse?.data) ? buyersResponse.data : [];
  }, [buyersResponse]);

  useEffect(() => {
    dispatch(getSuperAdminBuyersThunk());
  }, []);

  // Sync only when parent updates
  useEffect(() => {
    setLocalItems(modalItems);
  }, [modalItems]);
  // UI filtering directly render ke time
  useEffect(() => {
    setFilteredData(buyerList);
  }, [buyerList]);

  // filtered records by search box + status filter
  useEffect(() => {
    let data: BuyerData[] = buyerList;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase().trim();

      data = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(lower)
        )
      );
    }

    setFilteredData(data);
  }, [searchTerm, buyerList]);

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= buyerList.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
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
                      </tr>
                    </thead>
                    <tbody>
                      {loadingSuperAdminBuyers ? (
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
                      {!loadingSuperAdminBuyers &&
                        !loadings &&
                        buyerList.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className="text-center py-2 text-muted fw-bold fs-6"
                            >
                              No records found
                            </td>
                          </tr>
                        )}

                      {!loadingSuperAdminBuyers &&
                        !loadings &&
                        buyerList.length > 0 &&
                        visibleCount >= buyerList.length && (
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
    </>
  );
}
