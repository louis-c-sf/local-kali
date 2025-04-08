import React from "react";

function CloseIcon(props: {
  className?: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { onClick = () => {} } = props;
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 15 15"
      className={props.className ?? ""}
    >
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <g
          fill="var(--color, var(--WHITE))"
          fillRule="nonzero"
          transform="translate(-674 -174)"
        >
          <g transform="translate(674 174)">
            <path d="M7.062 6l4.719-4.719a.75.75 0 10-1.062-1.06L6 4.938 1.281.22A.75.75 0 10.22 1.281l4.72 4.72L.22 10.72a.75.75 0 101.061 1.06l4.72-4.719 4.718 4.72a.748.748 0 001.062 0 .75.75 0 000-1.062L7.06 6.001z"></path>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default CloseIcon;
