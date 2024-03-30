import React from "react";
import "../styles/Success.css";

export default function Success() {
  return (
    <div className="success-wrapper">
      <div className="wrapper">
        {" "}
        <svg className="animated-check" viewBox="0 0 24 24">
          <path d="M4.1 12.7L9 17.6 20.3 6.3" fill="none" />{" "}
        </svg>
      </div>
    </div>
  );
}
