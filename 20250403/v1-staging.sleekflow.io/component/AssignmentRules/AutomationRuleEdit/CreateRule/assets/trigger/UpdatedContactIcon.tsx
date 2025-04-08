import * as React from "react";

export function UpdatedContactIcon() {
  const color = "var(--iconColor, #6078FF)";

  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.106 18.833a5.417 5.417 0 1 0 0-10.833 5.417 5.417 0 0 0 0 10.833ZM18.523 32.167H9.688c-1.965 0-3.432-1.733-2.43-3.425 1.452-2.453 4.58-5.325 11.265-5.325"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m22.036 32.304 3.655-.86 7.99-7.991a.86.86 0 0 0 0-1.216l-1.578-1.579a.86.86 0 0 0-1.216 0l-7.99 7.991-.86 3.655Z"
        stroke={color}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
