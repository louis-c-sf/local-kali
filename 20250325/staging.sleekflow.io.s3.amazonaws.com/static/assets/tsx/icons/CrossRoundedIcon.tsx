import React from "react";

export function CrossRoundedIcon(props: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className ?? ""}
    >
      <path
        d="m2.44.317.142.126L9 6.861 15.418.443a1.513 1.513 0 0 1 2.265 1.997l-.126.142L11.139 9l6.418 6.418a1.513 1.513 0 0 1-1.997 2.265l-.142-.126L9 11.139l-6.418 6.418A1.512 1.512 0 0 1 .317 15.56l.126-.142L6.861 9 .443 2.582A1.513 1.513 0 0 1 2.44.317Z"
        fill="var(--cross-color, #3C4257)"
      />
    </svg>
  );
}
