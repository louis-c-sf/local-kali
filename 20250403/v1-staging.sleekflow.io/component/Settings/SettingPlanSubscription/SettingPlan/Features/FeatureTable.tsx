import React from "react";
import styles from "./FeatureTable.module.css";
import TickIcon from "../../../../../assets/tsx/icons/TickIcon";
import { CrossRoundedIcon } from "../../../../../assets/tsx/icons/CrossRoundedIcon";
import BadgeTag from "../../../../shared/BadgeTag/BadgeTag";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../../../shared/popup/InfoTooltip";
import InfoIcon from "../../../../../assets/images/info_gray.svg";
import { Image } from "semantic-ui-react";

interface FeatureDetail {
  title: string;
  startup: number | string | boolean;
  pro: number | string | boolean;
  premium: number | string | boolean;
}

interface CoreFeatures {
  staffLogin: FeatureDetail;
  customerContacts: FeatureDetail;
  broadCastMessages: FeatureDetail;
  automationRules: FeatureDetail;
  messagingChannels: FeatureDetail;
}

interface AdvancedFeatures {
  zapierIntegration: FeatureDetail;
  advancedUserSettings: FeatureDetail;
  analyticsDashboard: FeatureDetail;
  apiIntegration: FeatureDetail;
}

const FeatureQuota = ({ quota }: { quota: number | boolean | string }) => {
  if (typeof quota === "boolean") {
    if (quota) {
      return <TickIcon />;
    }
    return <CrossRoundedIcon className={styles.featuresCrossIcon} />;
  }
  return <>{quota}</>;
};

export default function FeatureTable({
  planInterval,
  header,
  features,
}: {
  planInterval?: "yearly" | "monthly";
  header: string;
  features: CoreFeatures | AdvancedFeatures;
}) {
  const { t } = useTranslation();
  return (
    <table className={`ui very basic table ${styles.featureTableWrapper}`}>
      <thead>
        <tr>
          <th className={styles.featureTableHeader}>{header}</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(features).map((tableRow) => {
          if (tableRow?.yearlyOnly && planInterval !== "yearly") {
            return null;
          }
          return (
            <tr key={tableRow.title}>
              <td className={styles.featureLabel}>
                <div>{tableRow.title}</div>
                {tableRow?.tooltip && (
                  <InfoTooltip
                    placement={"right"}
                    trigger={
                      <Image
                        className={styles.infoTooltip}
                        src={InfoIcon}
                        size={"mini"}
                      />
                    }
                  >
                    {tableRow?.tooltip}
                  </InfoTooltip>
                )}
                {tableRow?.yearlyOnly && (
                  <BadgeTag
                    className={styles.yearlyOnlyBadge}
                    text={t("settings.plan.subscriptions.yearlyOnly")}
                  />
                )}
              </td>
              <td>
                <FeatureQuota quota={tableRow.startup} />
              </td>
              <td>
                <FeatureQuota quota={tableRow.pro} />
              </td>
              <td>
                <FeatureQuota quota={tableRow.premium} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
