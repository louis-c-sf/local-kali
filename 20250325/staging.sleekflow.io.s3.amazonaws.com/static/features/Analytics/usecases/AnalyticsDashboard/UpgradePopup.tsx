import React from "react";
import { Button, Card, Icon } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import UpgradeImg from "assets/images/upgrade-analytics.png";
import { useHistory } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import styles from "features/Analytics/usecases/AnalyticsDashboard/UpgradePopup.module.css";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import ResellerContactButton from "component/Reseller/ResellerContactButton";

const UpgradePopupButton = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const accessRuleGuard = useAccessRulesGuard();
  const isResellerClient = accessRuleGuard.isResellerClient();

  if (isResellerClient) {
    return (
      <ResellerContactButton>
        <Button
          fluid
          className={`ui button small primary ${styles.upgradeButton}`}
        >
          {t("contactYourReseller")}
        </Button>
      </ResellerContactButton>
    );
  }
  return (
    <Button
      onClick={() => {
        history.push(routeTo("/settings/plansubscription"));
      }}
      fluid
      className={`ui button small primary ${styles.upgradeButton}`}
    >
      {t("analytics.upgradePopup.upgradeNow")}
    </Button>
  );
};

const UpgradePopup = (props: { opened: boolean }) => {
  const { opened } = props;
  const { t } = useTranslation();
  const accessRuleGuard = useAccessRulesGuard();
  const isResellerClient = accessRuleGuard.isResellerClient();
  const UpgradePopupConfig = {
    reseller: {
      description: t("analytics.upgradePopup.resellerDescription"),
    },
    default: {
      description: t("analytics.upgradePopup.description"),
    },
  };

  const modalConfig =
    UpgradePopupConfig[isResellerClient ? "reseller" : "default"];
  if (!opened) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <Card fluid className={styles.card}>
          <div className={styles.popup}>
            <div className={styles.title}>
              <Trans
                i18nKey={
                  isResellerClient
                    ? "analytics.upgradePopup.resellerTitle"
                    : "analytics.upgradePopup.title"
                }
              >
                Upgrade to <span>Sleekflow Premium</span> to unlock Analytics
                overview
              </Trans>
            </div>
            <div className={styles.body}>
              <div className={styles.leftColumn}>
                <img src={UpgradeImg} alt="upgrade analytics" />
              </div>
              <div className={styles.rightColumn}>
                <p className={styles.description}>{modalConfig.description}</p>
                <div className={styles.list}>
                  <Trans i18nKey="analytics.upgradePopup.includes">
                    Statistics includes
                  </Trans>
                  <ul>
                    <li>
                      <Icon className={styles.checkIcon} name="check" />
                      <Trans i18nKey="analytics.upgradePopup.totalConversation">
                        Total conversation per day
                      </Trans>
                    </li>
                    <li>
                      <Icon className={styles.checkIcon} name="check" />
                      <Trans i18nKey="analytics.upgradePopup.totalEnquiries">
                        Total enquiries from new customers per day
                      </Trans>
                    </li>
                    <li>
                      <Icon className={styles.checkIcon} name="check" />
                      <Trans i18nKey="analytics.upgradePopup.numberOfNewContact">
                        Number of newly added contacts per month
                      </Trans>
                    </li>
                    <li>
                      <Icon className={styles.checkIcon} name="check" />
                      <Trans i18nKey="analytics.upgradePopup.avgResponseTime">
                        Average response time...etc.
                      </Trans>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={styles.footer}>
              <UpgradePopupButton />
              <p>
                <Trans i18nKey="analytics.upgradePopup.footer">
                  Want to know more about Analytics? Check out
                  <a
                    href="https://docs.sleekflow.io/using-the-platform/analytics"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    this article
                  </a>
                  .
                </Trans>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UpgradePopup;
