"use client";
import React from "react";

interface TableLoaderProps {
  colSpan: number;
  text?: string;
}

const TableLoader: React.FC<TableLoaderProps> = ({ colSpan, text }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-3">
        <div className="d-flex justify-content-center align-items-center gap-2">
          <div className="spinner-border text-primary" role="status" />
          {text && <span>{text}</span>}
        </div>
      </td>
    </tr>
  );
};

export default TableLoader;
