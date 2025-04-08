import React from "react";

const InfoIcon = (props: { className?: string }) => (
  <svg
    width={14}
    height={14}
    viewBox={`0 0 14 14`}
    fill="none"
    className={props.className ?? ""}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0Zm0 12.6A5.6 5.6 0 1 1 7 1.4a5.6 5.6 0 0 1 0 11.2ZM6.999 5.6a.7.7 0 0 0-.7.7v4.2a.7.7 0 1 0 1.4 0v-4.2a.7.7 0 0 0-.7-.7Zm.138-2.786a.7.7 0 0 1 .36.19h-.001a.699.699 0 0 1 .147.23.7.7 0 0 1-.147.764.813.813 0 0 1-.23.147.701.701 0 0 1-.267.056.7.7 0 0 1-.7-.7.58.58 0 0 1 .056-.267.63.63 0 0 1 .378-.377.699.699 0 0 1 .404-.043Z"
      fill="var(--color, #178852)"
    />
  </svg>
);

export default InfoIcon;
