import React from "react";
import styles from "./UrlInfo.module.css";
import { WebClientInfoResponseType } from "../../../../types/Analytics/api/WebClientInfoResponseType";
import { useTranslation } from "react-i18next";
import { useCurrentUtcOffset } from "../../hooks/useCurrentUtcOffset";
import iconStyles from "../../../shared/Icon/Icon.module.css";
import { getDateDiff } from "./Record";
import { getUtcMoment } from "../../../../utility/moment";
import { htmlEscape } from "../../../../lib/utility/htmlEscape";

export function UrlInfo(props: {
  entry: WebClientInfoResponseType;
  nextEntry?: WebClientInfoResponseType;
}) {
  const { entry, nextEntry } = props;
  const { t } = useTranslation();
  const utcOffset = useCurrentUtcOffset();
  const date = getUtcMoment(utcOffset, entry.updatedAt ?? entry.createdAt);
  const dateAfter = nextEntry
    ? getUtcMoment(utcOffset, nextEntry.updatedAt ?? nextEntry.createdAt)
    : undefined;
  const dateDiff = date && dateAfter ? getDateDiff(date, dateAfter, t) : "";
  const url = new URL(props.entry.webPath);
  const path = `${url.pathname}`;
  const search = url.search;

  return (
    <div className={styles.url}>
      <i className={`${styles.visit} ${styles.icon} ${iconStyles.icon}`} />
      <div className={`${styles.status} ${styles.visit}`} />
      <div className={styles.text}>
        <a
          target="_blank"
          rel="noreferrer noopener"
          title={htmlEscape(props.entry.webPath)}
          href={htmlEscape(props.entry.webPath)}
        >
          {path}
          {search}
        </a>
      </div>
      {dateDiff && <div className={styles.timing}>{dateDiff}</div>}
      {!nextEntry && <div className={styles.timing}>-</div>}
    </div>
  );
}
