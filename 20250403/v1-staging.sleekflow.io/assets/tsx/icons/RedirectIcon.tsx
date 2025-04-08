import React from "react";

function RedirectIcon(props: { className: string }) {
  return (
    <svg
      width={14}
      height={15}
      viewBox="0 0 14 15"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <g
        className="frame"
        fillRule="nonzero"
        fill="var(--color, var(--GRAY-MID))"
      >
        <path d="M12.561 6.937h-.986a.37.37 0 00-.37.37V11.8a.433.433 0 01-.432.433H2.158a.433.433 0 01-.433-.433V3.187c0-.239.194-.433.433-.433h4.725a.37.37 0 00.37-.37v-.986a.37.37 0 00-.37-.37H2.158A2.16 2.16 0 000 3.188V11.8a2.16 2.16 0 002.158 2.158h8.615a2.16 2.16 0 002.158-2.158V7.306a.37.37 0 00-.37-.37z" />
        <path d="M13.59 0H9.668a.37.37 0 00-.37.37v.986c0 .204.166.37.37.37h1.346L5.95 6.79a.37.37 0 000 .523l.697.697a.37.37 0 00.523 0l5.065-5.065v1.346c0 .204.166.37.37.37h.986a.37.37 0 00.37-.37V.37a.37.37 0 00-.37-.37z" />
      </g>
    </svg>
  );
}
export default RedirectIcon;
