import React, { useState } from "react";
import { useVerticalCurtain } from "../../../../lib/effects/useVerticalCurtain";
import styles from "./Record.module.css";
import iconStyles from "../../../shared/Icon/Icon.module.css";
import {
  sortedFromOldest,
  WebClientInfoResponseType,
} from "../../../../types/Analytics/api/WebClientInfoResponseType";
import { useCurrentUtcOffset } from "../../hooks/useCurrentUtcOffset";
import moment, { Moment } from "moment";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { UrlInfo } from "./UrlInfo";
import { getUtcMoment } from "../../../../utility/moment";

export function getDateDiff(dateStart: Moment, dateEnd: Moment, t: TFunction) {
  if (!dateEnd || !dateEnd.isValid() || !dateStart || !dateStart.isValid()) {
    return "";
  }

  const dateDiff = moment.duration(
    dateEnd.diff(dateStart, "seconds"),
    "seconds"
  );
  const dateDiffParts = [];
  if (dateDiff.years() > 0) {
    dateDiffParts.push(t("date.unit.year", { count: dateDiff.years() }));
  }
  if (dateDiff.months() > 0) {
    dateDiffParts.push(t("date.unit.month", { count: dateDiff.months() }));
  }
  if (dateDiff.days() > 0) {
    dateDiffParts.push(t("date.unit.day", { count: dateDiff.days() }));
  }
  if (dateDiff.hours() > 0) {
    dateDiffParts.push(t("date.unit.hour", { count: dateDiff.hours() }));
  }
  if (dateDiff.minutes() > 0) {
    dateDiffParts.push(t("date.unit.minute", { count: dateDiff.minutes() }));
  }
  if (dateDiff.seconds() > 0) {
    dateDiffParts.push(t("date.unit.second", { count: dateDiff.seconds() }));
  }
  return dateDiffParts.join(" ");
}

export function Record(props: {
  opened: boolean;
  toggleOpen: () => void;
  history: WebClientInfoResponseType[];
}) {
  const [curtainNode, setCurtainNode] = useState<HTMLDivElement | null>(null);
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);

  const utcOffset = useCurrentUtcOffset();
  const [latestEntry] = props.history;
  const dateEnd = getUtcMoment(utcOffset, latestEntry.createdAt);
  const [firstEntry] = [...props.history].reverse();
  const dateStart = getUtcMoment(utcOffset, firstEntry.createdAt);

  useVerticalCurtain({
    curtain: curtainNode,
    contents: contentNode,
    opened: props.opened,
  });
  const { t } = useTranslation();

  const dateDiffText =
    dateStart && dateEnd ? getDateDiff(dateStart, dateEnd, t) : "";
  const historySorted = [...sortedFromOldest(props.history).reverse()];

  function validURL(str: string) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function toggleCollapse() {
    return props.toggleOpen();
  }

  return (
    <div
      className={`
      ${styles.record} 
      ${props.opened ? styles.opened : styles.closed}
    `}
    >
      <div className={styles.header} onClick={toggleCollapse}>
        <div className={`${styles.collapser}`}>
          <i
            className={`
            ${styles.icon} 
            ${iconStyles.icon} 
            ${iconStyles.dropdownIcon}
          `}
          />
        </div>
        <div className={styles.date}>
          {dateEnd?.format("YYYY-MM-DD HH:MM A") ?? ""}
        </div>
        {dateDiffText && <div className={styles.timing}>{dateDiffText}</div>}
      </div>
      <div className={styles.pages}>
        {t("chat.analytics.record.pages", { count: historySorted.length })}
        {props.opened && t("chat.analytics.record.sortHint")}
      </div>
      <div className={styles.curtain} ref={setCurtainNode}>
        <div className={styles.detail} ref={setContentNode}>
          <div className={styles.urls}>
            {historySorted.map((entry, i) => {
              const nextEntry = i > 0 ? historySorted[i - 1] : undefined;
              if (!validURL(entry.webPath)) {
                return;
              }
              return (
                <UrlInfo key={entry.id} entry={entry} nextEntry={nextEntry} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
