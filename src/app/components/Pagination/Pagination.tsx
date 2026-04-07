"use client";

import React from "react";
import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) => {
  return (
    <div className="pagination-wrapper">
      {/* Previous */}
      <button
        className="nav-btn"
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹ Previous
      </button>

      {/* Prev Page */}
      {hasPrev && (
        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage - 1)}
        >
          {currentPage - 1}
        </button>
      )}

      {/* Current Page */}
      <button className="page-btn active">{currentPage}</button>

      {/* Next Page */}
      {hasNext && (
        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage + 1)}
        >
          {currentPage + 1}
        </button>
      )}

      {/* Next */}
      <button
        className="nav-btn"
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next ›
      </button>
    </div>
  );
};

export default Pagination;
