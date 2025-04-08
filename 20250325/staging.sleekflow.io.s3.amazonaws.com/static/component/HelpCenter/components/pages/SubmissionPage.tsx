import React, { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button, Image } from "semantic-ui-react";
import { HelpCenterContext } from "../../hooks/helpCenterContext";
import { WidgetActions } from "../WidgetHeader";
import WrittenIcon from "../../../../assets/images/icons/written.svg";
import TickIcon from "../../../../assets/images/icons/tick-circle.svg";
import styles from "./SubmissionPage.module.css";

export const SubmissionPage = (props: { close: () => void }) => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(HelpCenterContext);
  const handleClickComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "RESET_STATE" });
    props.close();
  };
  return (
    <div className={styles.container}>
      <WidgetActions className={styles.icon} />
      <div className={styles.icons}>
        <Image src={WrittenIcon} className={styles.writtenIcon} />
        <Image src={TickIcon} className={styles.tickIcon} />
      </div>
      <div className={styles.title}>{t("nav.helpCenter.submission.title")}</div>
      <div className={styles.description}>
        {t("nav.helpCenter.submission.description", { number: state.ticketNo })}
      </div>
      <div className={styles.content}>
        <Trans i18nKey="nav.helpCenter.submission.content">
          <br />
          <br />
        </Trans>
      </div>
      <Button className={styles.button} primary onClick={handleClickComplete}>
        {t("nav.helpCenter.submission.button.complete")}
      </Button>
    </div>
  );
};
