import React from "react";

const DownloadUnderlineIcon = (props: { className: string }) => {
  return (
    <svg
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <path
        d="M6.05.9v7.8h-3.9L8 15.2l5.85-6.5h-3.9V.9h-3.9ZM15.8 16.825H.2v1.95h15.6v-1.95Z"
        fill="var(--color, var(--BLACK))"
      />
    </svg>
  );
};
export default DownloadUnderlineIcon;
