import React from "react";
import styles from "./SummaryTab.module.css";
import { useTranslation } from "react-i18next";
import { WebClientInfoResponseType } from "../../../types/Analytics/api/WebClientInfoResponseType";
import moment from "moment-timezone";
import { useCurrentUtcOffset } from "../hooks/useCurrentUtcOffset";
import { AnalyticsSummaryOverride } from "../../../types/state/InboxStateType";
import { Flag, FlagNameValues } from "semantic-ui-react";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export function DetailsTab(props: {
  summary: WebClientInfoResponseType;
  override: AnalyticsSummaryOverride;
  history: WebClientInfoResponseType[];
}) {
  const { override, summary, history } = props;
  const utcOffset = useCurrentUtcOffset();

  const { t } = useTranslation();

  const timezone = override.timezone ?? summary.timezone;
  const updatedAt =
    (override.updatedAt ?? summary.updatedAt) || summary.createdAt;
  let localTime: string = "";
  if (timezone && updatedAt) {
    const dateParsed = moment.tz(updatedAt, timezone);
    if (dateParsed.isValid()) {
      localTime = dateParsed.utcOffset(utcOffset, true).format("hh:mm A");
    }
  }
  const country = override.country ?? summary.country;
  const region = override.region ?? summary.region;
  const locationString = country + (`, ${region}` || "");
  const businessName = override.businessName ?? summary.businessName;
  const totals = history.length;

  return (
    <div className={styles.body}>
      {country && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.country")}
          </div>
          <div className={styles.value} title={htmlEscape(locationString)}>
            <Flag name={country.toLowerCase() as FlagNameValues} />
            {locationString}
          </div>
        </div>
      )}
      {businessName && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.businessName")}
          </div>
          <div className={styles.value} title={htmlEscape(businessName)}>
            {businessName}
          </div>
        </div>
      )}
      {timezone && localTime && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.localTimeHead")}
          </div>
          <div className={styles.value} title={localTime}>
            {localTime} {t("chat.analytics.summary.localTime")}
          </div>
        </div>
      )}
      <div className={styles.row}>
        <div className={styles.label}>
          {t("chat.analytics.summary.totalViews")}
        </div>
        <div className={styles.value}>{totals}</div>
      </div>
    </div>
  );
}
