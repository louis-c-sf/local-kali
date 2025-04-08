import React from "react";

function MinusIcon(props: { className?: string; style: "thin" | "thick" }) {
  if (props.style === "thin") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="14"
        fill="none"
        viewBox="0 0 20 14"
        className={props.className ?? ""}
      >
        <path
          fill="var(--color, var(--WHITE))"
          d="M18.71 6H2.29c-.16 0-.29.224-.29.5s.13.5.29.5h16.42c.16 0 .29-.224.29-.5s-.13-.5-.29-.5z"
        ></path>
      </svg>
    );
  } else {
    return (
      <svg
        width={12}
        height={2}
        viewBox="0 0 12 2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 1H1"
          stroke="var(--color, var(--WHITE))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
}
export default MinusIcon;
