import React from "react";
import { useTranslation } from "react-i18next";
import RedirectIcon from "../../../assets/tsx/icons/RedirectIcon";
import styles from "./RoadMap.module.css";
import mainStyles from "./pages/MainPage.module.css";

const RoadMap = () => {
  const { t } = useTranslation();
  const roadMapUrl =
    "https://www.notion.so/sleekflow/SleekFlow-Product-Roadmap-e6bae0e7f1654073ab87abc838a4b668";
  const handleClickMore = () => {
    window.open(roadMapUrl);
  };

  return (
    <div className={`${mainStyles.boxWrapper} ${mainStyles.boxShadow}`}>
      <div className={styles.title}>
        {t("nav.helpCenter.mainPage.roadMap.title")}
      </div>
      <div className={styles.content}>
        {t("nav.helpCenter.mainPage.roadMap.content")}
      </div>
      <div className={styles.buttonContainer}>
        <span className={styles.buttonClickArea} onClick={handleClickMore}>
          {t("nav.helpCenter.mainPage.roadMap.button.more")}
          <RedirectIcon className={styles.redirectIcon} />
        </span>
      </div>
    </div>
  );
};
export default RoadMap;
