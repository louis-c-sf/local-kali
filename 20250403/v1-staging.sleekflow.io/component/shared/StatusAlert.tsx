import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./StatusAlert.module.css";

export type StatusType = "info" | "warning" | "success";

const StatusIcon = (type: StatusType) => {
  if (type == "info") {
    return (
      <svg
        width="22"
        height="24"
        viewBox="0 0 22 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.3946 2.59326C10.394 2.59326 10.394 2.59326 10.394 2.59326C7.12915 2.67216 4.13379 4.75716 4.13379 8.69016C4.13379 12.3772 7.70451 13.6633 7.84201 15.1384H12.9463C13.0838 13.6633 16.6545 12.3772 16.6545 8.69016C16.6545 4.75716 13.6592 2.67216 10.3946 2.59326ZM12.8889 12.1441C12.5027 12.5236 12.1103 12.9094 11.7925 13.3381H8.9961C8.67832 12.9091 8.28568 12.5233 7.89946 12.1441C6.90579 11.1676 5.96712 10.2451 5.96712 8.68986C5.96712 5.62026 8.34129 4.45926 10.394 4.39356C12.4467 4.45926 14.8209 5.62026 14.8209 8.68986C14.8212 10.2454 13.8828 11.1676 12.8889 12.1441Z"
          fill="#3C4257"
        />
        <path
          d="M10.3945 19.5075C11.9134 19.5075 13.1445 18.2256 13.1445 16.6431H7.64453C7.64453 18.2256 8.87561 19.5075 10.3945 19.5075Z"
          fill="#3C4257"
        />
      </svg>
    );
  } else if (type === "warning") {
    return (
      <svg
        width="27"
        height="24"
        viewBox="0 0 27 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.3113 0.00128702C13.0608 0.0124069 12.8172 0.0855633 12.6031 0.213967C12.389 0.342371 12.2113 0.521861 12.0866 0.735802L0.197548 20.9909C0.0674919 21.2138 -0.000636696 21.4664 4.48426e-06 21.7234C0.000645665 21.9804 0.0700341 22.2327 0.201201 22.455C0.332368 22.6773 0.520695 22.8617 0.747268 22.9897C0.973841 23.1177 1.23068 23.1849 1.492 23.1845H25.2701C25.5314 23.1849 25.7882 23.1177 26.0148 22.9897C26.2414 22.8617 26.4297 22.6773 26.5609 22.455C26.692 22.2327 26.7614 21.9804 26.7621 21.7234C26.7627 21.4664 26.6946 21.2138 26.5645 20.9909L14.6655 0.735802C14.5298 0.503168 14.3318 0.311655 14.093 0.18213C13.8542 0.0526055 13.5838 -0.00995318 13.3113 0.00128702ZM13.381 6.11906C13.733 6.11906 14.0183 6.40737 14.0183 6.76303V15.7787C14.0183 16.1344 13.733 16.4227 13.381 16.4227C13.0291 16.4227 12.7438 16.1344 12.7438 15.7787V6.76303C12.7438 6.40737 13.0291 6.11906 13.381 6.11906ZM13.381 17.7106C13.909 17.7106 14.3369 18.1432 14.3369 18.6766C14.3369 19.2101 13.909 19.6426 13.381 19.6426C12.8531 19.6426 12.4251 19.2101 12.4251 18.6766C12.4251 18.1432 12.8531 17.7106 13.381 17.7106Z"
          fill="#CD3D64"
        />
      </svg>
    );
  } else {
    return (
      <svg
        width={23}
        height={22}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.17 22c6.076 0 11-4.925 11-11s-4.924-11-11-11c-6.074 0-11 4.925-11 11s4.926 11 11 11z"
          fill="#29BB4F"
        />
        <path
          d="M16.967 5.175L9.19 12.95 5.375 9.135l-1.938 1.938 5.754 5.753 9.713-9.714-1.937-1.937z"
          fill="#EBF0F3"
        />
      </svg>
    );
  }
};

export default function StatusAlert(props: {
  type: StatusType;
  children: React.ReactElement;
  headerText?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const { type, headerText } = props;

  function getClasses() {
    const base = [styles.alert];
    const statusMap: Record<StatusType, string> = {
      info: styles.info,
      success: styles.success,
      warning: styles.warning,
    };
    statusMap[type] && base.push(statusMap[type]);

    return base.join(" ");
  }

  return (
    <div className={`${getClasses()} ${props.className ?? ""} status-alert`}>
      <div className="tipHeader">
        {StatusIcon(type)}
        <div>
          {headerText
            ? headerText
            : t(`${type == "info" ? "tips" : "warning"}`)}
        </div>
      </div>
      <div>{props.children}</div>
    </div>
  );
}
