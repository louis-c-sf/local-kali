import * as React from "react";

const QrCodeIcon = (props: { className: string }) => {
  const { className } = props;
  return (
    <svg
      width={14}
      height={15}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#a)" fill={"var(--color)"}>
        <path d="M1.442 6.27h2.885a1.442 1.442 0 0 0 1.442-1.443V1.942A1.442 1.442 0 0 0 4.327.5H1.442A1.442 1.442 0 0 0 0 1.942v2.885a1.442 1.442 0 0 0 1.442 1.442Zm.481-3.847h1.923v1.923H1.923V2.423ZM0 12.52a1.442 1.442 0 0 0 1.442 1.441h2.885a1.442 1.442 0 0 0 1.442-1.442V9.635a1.442 1.442 0 0 0-1.442-1.443H1.442A1.442 1.442 0 0 0 0 9.635v2.884Zm1.923-2.405h1.923v1.923H1.923v-1.923ZM12.02 6.27a1.442 1.442 0 0 0 1.442-1.443V1.942A1.442 1.442 0 0 0 12.02.5H9.136a1.442 1.442 0 0 0-1.443 1.442v2.885a1.442 1.442 0 0 0 1.443 1.442h2.884ZM9.616 2.422h1.923v1.923H9.616V2.423ZM11.54 10.115H9.617v1.923h1.923v-1.923ZM13.462 8.192H11.54v1.923h1.923V8.192ZM9.616 8.192H7.693v1.923h1.923V8.192ZM13.462 12.038H11.54v1.923h1.923v-1.923ZM9.616 12.038H7.693v1.923h1.923v-1.923Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" transform="translate(0 .5)" d="M0 0h14v14H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default QrCodeIcon;
