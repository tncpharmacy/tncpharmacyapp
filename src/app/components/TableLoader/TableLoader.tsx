"use client";
import React from "react";
import Image from "next/image";
import "./TableLoader.css";

interface TableLoaderProps {
  colSpan: number;
  text?: string;
  size?: number;
}

const TableLoader: React.FC<TableLoaderProps> = ({
  colSpan,
  text = "Loading...",
  size = 32,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-3">
        <div className="table-loader-wrapper">
          <div className="table-loader-spin">
            <Image
              src="/images/tnc-capsule.png"
              alt="Loading"
              width={size}
              height={size}
              priority
            />
          </div>
          {text && <span className="table-loader-text">{text}</span>}
        </div>
      </td>
    </tr>
  );
};

export default TableLoader;
