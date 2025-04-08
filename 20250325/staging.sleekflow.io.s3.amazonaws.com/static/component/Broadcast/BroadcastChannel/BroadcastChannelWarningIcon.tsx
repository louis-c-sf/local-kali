import React from "react";

export default function BroadcastChannelWarningIcon(props: {
  className: string;
}) {
  return (
    <svg
      width={15}
      height={15}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.5 14a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"
        fill="#CD3D64"
        stroke="#CD3D64"
        strokeWidth={0.938}
        strokeMiterlimit={10}
      />
      <path
        d="M7.5 3.102v5.674"
        stroke="#fff"
        strokeWidth={0.938}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 11.898a.612.612 0 100-1.224.612.612 0 000 1.224z"
        fill="#fff"
      />
    </svg>
  );
}
