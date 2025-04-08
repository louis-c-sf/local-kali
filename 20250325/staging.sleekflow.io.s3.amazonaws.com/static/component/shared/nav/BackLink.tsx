import React from "react";
import { Icon } from "semantic-ui-react";
import styles from "./BackNavLink.module.css";
import { useTranslation } from "react-i18next";

export function BackLink(props: {
  onClick: () => void;
  children?: React.ReactNode;
  hovered?: boolean;
  transparent?: boolean;
  header?: boolean;
  className?: string;
  icon?: React.ReactNode;
}) {
  const { children, hovered, onClick, transparent, header, className } = props;
  const { t } = useTranslation();

  return (
    <a
      className={`
        back-link 
        ${className ? className : ""}
        ${styles.link} 
        ${header ? styles.header : ""}
        ${hovered ? styles.hovered : ""}
        ${transparent ? styles.transparent : ""}
      `}
      onClick={onClick}
    >
      {props.icon ? (
        props.icon
      ) : (
        <Icon
          className={`back-btn chevron-left ${styles.icon}`}
          name="arrow left"
        />
      )}

      {children ?? t("nav.backShort")}
    </a>
  );
}
