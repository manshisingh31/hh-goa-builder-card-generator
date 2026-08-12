import React from "react";

export const StardustButton = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#0a1929",
        color: "#81d8ff",
        border: "none",
        borderRadius: "100px",
        padding: "18px 30px",
        fontSize: "18px",
        cursor: "pointer",
        fontWeight: "600",
      }}
    >
      ✧ {children}
    </button>
  );
};