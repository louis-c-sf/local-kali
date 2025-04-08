import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../AppRootContext";
import { HelpCenterContext } from "../../hooks/helpCenterContext";
import { StepsEnum } from "../../hooks/HelpCenterStateType";

import WidgetHeader from "../WidgetHeader";
import SearchBar from "../SearchBar";
import NewTicket from "../NewTicket";
import TopSearches from "../TopSearches";
import RoadMap from "../RoadMap";
import styles from "./MainPage.module.css";

export const MainPage = () => {
  const firstName = useAppSelector((s) => s.user?.firstName);
  const { state } = useContext(HelpCenterContext);
  const { t } = useTranslation();

  return (
    <div
      className={`
      ${
        state.step === StepsEnum.Main
          ? styles.animationContainerMain
          : styles.animationContainerNew
      }
      ${styles.animationContainer}
    `}
    >
      <WidgetHeader>
        <div className={styles.children}>
          <div className={styles.content}>
            <span className={styles.title}>
              {t("nav.helpCenter.header.main.welcomeTitle", {
                username: firstName,
              })}
            </span>
            <span className={styles.subTitle}>
              {t("nav.helpCenter.header.main.welcomeSubTitle")}
            </span>
          </div>
        </div>
      </WidgetHeader>
      <SearchBar />
      <NewTicket />
      <TopSearches />
      <RoadMap />
    </div>
  );
};
