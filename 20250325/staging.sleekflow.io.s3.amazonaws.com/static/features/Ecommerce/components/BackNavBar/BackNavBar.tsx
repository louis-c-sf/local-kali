import React from "react";
import styles from "./BackNavBar.module.css";
import { BackNavLink } from "../../../../component/shared/nav/BackNavLink";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../../config/useRouteConfig";

export function BackNavBar(props: { to: string }) {
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  return (
    <div className={styles.nav}>
      <BackNavLink to={routeTo(props.to)}>{t("nav.backShort")}</BackNavLink>
    </div>
  );
}
