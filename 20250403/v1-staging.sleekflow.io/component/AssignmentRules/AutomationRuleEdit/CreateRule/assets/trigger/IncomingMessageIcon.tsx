import React from "react";

export function IncomingMessageIcon() {
  const color = "var(--iconColor, #6078FF)";
  return (
    <svg viewBox={"0 0 40 40"} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 30.417c5.833 0 12.083-2.917 12.083-10.417S25.833 9.583 20 9.583 7.917 12.5 7.917 20c0 1.716.327 3.193.902 4.449.358.783.559 1.646.4 2.493l-.437 2.33a1.667 1.667 0 0 0 1.946 1.946l5.345-1.003c.42-.078.851-.072 1.273-.005.88.14 1.771.207 2.654.207ZM24.167 16.667l-7.5 7.5"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.667 18.333v5.834H22.5"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
