import React from "react";
import { Image } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { InfoTooltip } from "../../../../component/shared/popup/InfoTooltip";
import HintImage from "../../../../assets/images/icons/import-hint.png";
import InfoIcon from "../../../../assets/images/info_gray.svg";
import TickIcon from "../../../../assets/tsx/icons/TickIcon";
import StatusAlert from "../../../../component/shared/StatusAlert";
import styles from "./SetUpImportFile.module.css";

const SetUpImportFile = () => {
  const { t } = useTranslation();

  return (
    <>
      <h4 className="ui header">
        {t("profile.list.import.step.setup.header")}
      </h4>
      <p>{t("profile.list.import.step.setup.text")}</p>
      <div className={styles.container}>
        <div className={styles.title}>
          <span>{t("profile.list.import.step.setup.title")}</span>
        </div>
        <div className={styles.content}>
          <Trans i18nKey={"profile.list.import.step.setup.content"}>
            Your file must include <span>Country Code</span> for all your phone
            numbers.
            <br />
            Otherwise, we will use your company location to update and associate
            with your contacts.
          </Trans>
        </div>
        <div className={styles.tipContainer}>
          <StatusAlert className={styles.alert} type="info">
            <div className={styles.tipContentContainer}>
              <div className={styles.tip}>
                <TickIcon />
                <span>
                  <Trans i18nKey={"profile.list.import.step.setup.tips.refer"}>
                    Refer to <span className={styles.bold}>“Index”</span> sheet
                    in the file that you have just downloaded for what
                    information you can include
                  </Trans>
                  <InfoTooltip
                    placement={"right"}
                    children={<Image src={HintImage} />}
                    trigger={<Image src={InfoIcon} />}
                  />
                </span>
              </div>
              <div className={styles.tip}>
                <TickIcon />
                <span>{t("profile.list.import.step.setup.tips.remove")}</span>
              </div>
            </div>
          </StatusAlert>
        </div>
      </div>
    </>
  );
};
export default SetUpImportFile;
