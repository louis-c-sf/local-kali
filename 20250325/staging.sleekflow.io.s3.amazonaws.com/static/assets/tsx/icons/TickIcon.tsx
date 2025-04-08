import React from "react";

export default function TickIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? ""}
      width={18}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.698 4.818L6.72 13.92a.773.773 0 01-1.12 0l-3.698-3.787a.827.827 0 010-1.137.773.773 0 011.12 0l3.147 3.217 8.427-8.533a.773.773 0 011.12 0 .81.81 0 01-.018 1.138z"
        fill="var(--color, #6078FF)"
      />
    </svg>
  );
}
