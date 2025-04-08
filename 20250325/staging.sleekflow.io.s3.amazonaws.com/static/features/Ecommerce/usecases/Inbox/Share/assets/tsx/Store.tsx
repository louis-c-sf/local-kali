import React from "react";

export default function Store(props: { className: string }) {
  return (
    <svg
      width={14}
      height={16}
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <path
        d="M10 7.25v-3a3 3 0 0 0-6 0v3m-2.25-1.5h10.5l.75 9H1l.75-9Z"
        stroke={"var(--color)"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
