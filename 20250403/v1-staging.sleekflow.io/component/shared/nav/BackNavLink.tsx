import React from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "semantic-ui-react";
import styles from "./BackNavLink.module.css";
import { LocationDescriptor } from "history";
import { useTranslation } from "react-i18next";

export function BackNavLink(props: {
  to: LocationDescriptor;
  children?: React.ReactNode;
  hovered?: boolean;
  transparent?: boolean;
  header?: boolean;
}) {
  const { to, children, hovered, transparent, header } = props;
  const { t } = useTranslation();
  return (
    <NavLink
      className={`
        back-link 
        ${styles.link} 
        ${header ? styles.header : ""} 
        ${hovered ? styles.hovered : ""}
        ${transparent ? styles.transparent : ""}
      `}
      to={to}
    >
      <Icon
        className={`back-btn chevron-left ${styles.icon}`}
        name="arrow left"
      />
      {children ?? t("nav:backShort")}
    </NavLink>
  );
}
