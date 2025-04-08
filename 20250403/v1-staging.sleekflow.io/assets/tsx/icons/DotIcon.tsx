import React from "react";

function DotIcon(props: { color?: string }) {
  const { color = "#9AA8BD" } = props;
  return (
    <svg
      width={11}
      height={11}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={5.5} cy={5.5} r={5.5} fill={color} />
    </svg>
  );
}

export default DotIcon;
