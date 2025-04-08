import React from "react";
import styles from "./SummaryTab.module.css";
import { useTranslation } from "react-i18next";
import { WebClientInfoResponseType } from "../../../types/Analytics/api/WebClientInfoResponseType";
import { AnalyticsSummaryOverride } from "../../../types/state/InboxStateType";
import { HistoryRecords } from "./HistoryRecords";
import { Flag, FlagNameValues } from "semantic-ui-react";
import { mergeLeft } from "ramda";
import IntlStub from "../../../types/stub/Intl";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export const SummaryTab = React.memo(function SummaryTab(props: {
  summary: WebClientInfoResponseType;
  override: AnalyticsSummaryOverride;
  history: WebClientInfoResponseType[];
  isShowAll: boolean;
  toggleShowAll: () => void;
}) {
  const { summary, override, history, isShowAll, toggleShowAll } = props;
  const { t } = useTranslation();
  if (!summary) {
    return null;
  }
  const summaryOverriden = mergeLeft(override, summary);
  let domain = "";
  let url: URL | undefined = undefined;
  let currentPage = "";
  let filterHistory = [...history];
  try {
    url = new URL(summaryOverriden.webPath);
  } catch (e) {
    filterHistory = filterHistory.filter((h) => h.id !== summaryOverriden.id);
    console.error(`Unable to convert URL ${e}`);
  }
  if (url) {
    domain = url?.hostname;
    currentPage = url?.pathname;
  }
  const isOnline = summaryOverriden.onlineStatus?.toLowerCase() === "online";
  const status = isOnline
    ? t("chat.analytics.summary.status.online")
    : t("chat.analytics.summary.status.offline");
  const device = summaryOverriden.device;
  const country = summaryOverriden.country;
  const region = summaryOverriden.region;
  const city = summaryOverriden.city;
  const regionString = [country, region, city]
    .reduce<string[]>((prev, next, i) => {
      if (!next || prev.length < i) {
        return prev;
      }
      return [...prev, next];
    }, [])
    .join(", ");

  let localeString: string | undefined;
  try {
    if (summaryOverriden.locale) {
      localeString = new IntlStub.Intl.DisplayNames(navigator.language, {
        type: "language",
      }).of(summaryOverriden.locale);
    }
  } catch (e) {
    localeString = summaryOverriden.locale;
  }

  return (
    <div className={styles.body}>
      {domain && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.domain")}
          </div>
          <div className={styles.value} title={htmlEscape(domain)}>
            {domain}
          </div>
        </div>
      )}
      {country && regionString && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.country")}
          </div>
          <InfoTooltip
            hoverable={true}
            placement="bottom"
            trigger={
              <div className={styles.value} title={htmlEscape(regionString)}>
                <Flag name={country.toLowerCase() as FlagNameValues} />
                {regionString}
              </div>
            }
          >
            {regionString}
          </InfoTooltip>
        </div>
      )}

      {localeString && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.language")}
          </div>
          <InfoTooltip
            hoverable={true}
            placement="bottom"
            trigger={<div className={styles.value}>{localeString}</div>}
          >
            {localeString}
          </InfoTooltip>
        </div>
      )}
      {device && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.device")}
          </div>
          <InfoTooltip
            hoverable={true}
            placement="bottom"
            trigger={
              <div className={styles.value} title={htmlEscape(device)}>
                {device}
              </div>
            }
          >
            {device}
          </InfoTooltip>
        </div>
      )}
      {status && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.status.label")}
          </div>
          <div className={styles.value} title={htmlEscape(status)}>
            <div
              className={`${styles.status} ${
                isOnline ? styles.online : styles.offline
              }`}
            >
              {status}
            </div>
          </div>
        </div>
      )}
      {currentPage && (
        <div className={styles.row}>
          <div className={styles.label}>
            {t("chat.analytics.summary.currentPage")}
          </div>
          <div className={styles.value} title={htmlEscape(currentPage)}>
            {currentPage}
          </div>
        </div>
      )}
      <HistoryRecords
        isShowAll={isShowAll}
        toggleShowAll={toggleShowAll}
        history={filterHistory}
      />
    </div>
  );
});
