"use client";

export default function CenterSpinner() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="spinner-border text-primary"
        style={{ width: "60px", height: "60px" }}
        role="status"
      ></div>
    </div>
  );
}
