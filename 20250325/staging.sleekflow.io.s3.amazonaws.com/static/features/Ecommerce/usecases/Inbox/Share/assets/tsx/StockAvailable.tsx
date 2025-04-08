import React from "react";

export default function StockAvailable(props: { className?: string }) {
  return (
    <svg
      width={12}
      height={12}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={6} cy={6} r={4.286} fill="var(--color)" />
      <path
        opacity={0.25}
        d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0Z"
        fill="var(--color)"
      />
    </svg>
  );
}
