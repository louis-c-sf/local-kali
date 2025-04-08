import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "../../config/useRouteConfig";
import styles from "../ScheduleDemoSuccess/ScheduleDemoSuccess.module.css";
import { Button } from "../shared/Button/Button";

export default function ConsultationPaymentSuccess() {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  return (
    <div className={`main ${styles.wrapper}`}>
      <div className={styles.container}>
        <div className="congratulation"></div>
        <div className="header">
          {t("settings.consultationPayment.success.header")}
        </div>
        <div className="content">
          <div className="paragraph">
            {t("settings.consultationPayment.success.content")}
          </div>
        </div>
        <Button
          primary
          customSize={"mid"}
          onClick={() => history.push(routeTo("/settings/plansubscription"))}
        >
          {t("settings.consultationPayment.success.button")}
        </Button>
      </div>
    </div>
  );
}
