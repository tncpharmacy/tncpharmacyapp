// components/OrderList.tsx
"use client";
import React from "react";
import { OrderDetails } from "@/types/order";
import { formatDateOnly } from "@/utils/dateFormatter";
import { formatAmount } from "@/lib/utils/formatAmount";

interface Props {
  orders: OrderDetails[];
  onView: (orderId: number) => void;
}

export default function OrderList({ orders, onView }: Props) {
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <>
      {orders.map((order) => (
        <div key={order.orderId} className="border rounded p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">Order Number: {order.orderId}</h6>
              <p className="mb-0 text-muted">
                Status:{" "}
                <span
                  className={
                    order.paymentStatus === "Buy"
                      ? "text-success"
                      : "text-warning"
                  }
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p className="mb-0 text-muted">
                Order Date: {formatDateOnly(order.orderDate)}
              </p>
              <p className="mb-0 text-danger">
                Amount: ₹{formatAmount(Number(order.amount))} | Type:{" "}
                {order.orderType}
              </p>
              <p className="mb-0 text-muted">{order.address}</p>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => onView(order.orderId)}
            >
              View
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
