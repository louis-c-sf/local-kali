import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "../../config/useRouteConfig";
import styles from "./ScheduleDemoSuccess.module.css";

export default function ScheduleDemoSuccess() {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  return (
    <div className={`main ${styles.wrapper}`}>
      <div className={styles.container}>
        <div className="congratulation"></div>
        <div className="header">{t("demoContact.success.header")}</div>
        <div className="content">
          <div className="paragraph">
            {t("demoContact.success.content.paragraph1")}
          </div>
          <div className="paragraph">
            {t("demoContact.success.content.paragraph2")}
          </div>
        </div>
        <div
          onClick={() => history.push(routeTo("/channels"))}
          className="ui button primary"
        >
          {t("demoContact.success.button.exploreChannels")}
        </div>
      </div>
    </div>
  );
}
