import React from "react";
import { Image, Menu } from "semantic-ui-react";
import BetaImg from "./assets/beta.svg";
import styles from "./SleekflowBetaMenuItem.module.css";
import ArrowRightImg from "./assets/arrow-right.svg";
import { useTranslation } from "react-i18next";
import mixpanel from "mixpanel-browser";
function clickToBetaSleekflow() {
  mixpanel.track("Switch to Web v2");
  window.open(`https://${process.env.REACT_APP_V2_PATH}`, "_blank");
}
export function SleekflowBetaMenuItem() {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div onClick={clickToBetaSleekflow} className={styles.header}>
        <div className={styles.title}>{t("beta.title")}</div>
        <Image src={ArrowRightImg} />
      </div>
      <div className={styles.content}>{t("beta.content")}</div>
    </div>
  );
}
