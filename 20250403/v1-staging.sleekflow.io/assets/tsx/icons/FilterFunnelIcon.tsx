import React from "react";

function FilterFunnelIcon(props: { active: boolean }) {
  const color = props.active ? "#9CA8BB" : "#9AA8BD";
  return (
    <svg viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.813 13.125a1.312 1.312 0 1 1 0 2.625H9.187a1.312 1.312 0 1 1 0-2.625h2.626Zm3.937-6.563a1.312 1.312 0 1 1 0 2.625H5.25a1.313 1.313 0 0 1 0-2.624h10.5ZM19.688 0a1.312 1.312 0 1 1 0 2.625H1.313a1.313 1.313 0 0 1 0-2.625h18.375Z"
        fill={color}
      />
    </svg>
  );
}

export default FilterFunnelIcon;
