import React from "react";
import { Progress } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./SettingUsage.module.css";
import { formatQuotaValues } from "./SettingPlanUtils";

function SettingUsage(props: {
  current: number;
  total: number;
  titleText: string;
  counterText: string;
  unlimited?: boolean;
}) {
  const { current, total, titleText, counterText, unlimited } = props;
  const { t } = useTranslation();
  return (
    <div className={`container ${styles.usageContainer}`}>
      <div className="title">
        <span className={styles.title}>{titleText}</span>
        <div className={styles.description}>
          {t("settings.plan.counter.subheader")}
        </div>
      </div>
      <div className={styles.usageBarContainer}>
        <Progress
          className={styles.progressBar}
          size={"medium"}
          percent={total > 0 ? (current / total) * 100 : 0}
        />
        <div className={styles.usageLabel}>
          <Trans
            i18nKey="settings.plan.counter.count"
            values={{
              sent: formatQuotaValues(current),
              total: unlimited
                ? t("settings.plan.subscriptions.unlimited")
                : formatQuotaValues(total),
              counterText,
            }}
          >
            <span className={styles.currentUsageText}>[sent]</span> out of
            [total] messages sent
          </Trans>
        </div>
      </div>
    </div>
  );
}

export default SettingUsage;
