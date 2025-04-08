import React, { ReactNode } from "react";
import styles from "./EmptyContent.module.css";

export default function EmptyContent(props: {
  header?: string;
  subHeader?: ReactNode;
  content?: ReactNode;
  actionContent?: ReactNode;
  centered?: boolean;
}) {
  let { actionContent, centered = false, content, header, subHeader } = props;
  return (
    <div
      className={`empty-content ${styles.root} ${
        centered ? styles.centered : ""
      }`}
    >
      <div className="container">
        {header && <div className="header">{header}</div>}
        {subHeader && <div className="sub-header">{subHeader}</div>}
        {content && <div className="content">{content}</div>}
        {actionContent && <div className="action">{actionContent}</div>}
      </div>
    </div>
  );
}
