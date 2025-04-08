import React from "react";

export function ScheduleIcon() {
  const color = "var(--iconColor, #6078FF)";
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 32.083c6.674 0 12.083-5.41 12.083-12.083S26.673 7.917 20 7.917 7.917 13.327 7.917 20 13.327 32.083 20 32.083Z"
        stroke={color}
        strokeWidth={2.5}
      />
      <path d="M20 13.333V20l3.333 3.333" stroke={color} strokeWidth={2.5} />
    </svg>
  );
}
