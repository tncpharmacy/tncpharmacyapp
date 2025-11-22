"use client";

export default function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        className="spinner-border text-primary"
        role="status"
        style={{
          width: "3rem",
          height: "3rem",
        }}
      ></div>
    </div>
  );
}
