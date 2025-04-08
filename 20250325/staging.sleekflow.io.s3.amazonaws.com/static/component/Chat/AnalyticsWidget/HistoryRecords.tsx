import React, { useCallback, useEffect, useState } from "react";
import styles from "./HistoryRecords.module.css";
import { Record } from "./DetailsTab/Record";
import {
  sortedFromLatest,
  WebClientInfoResponseType,
} from "../../../types/Analytics/api/WebClientInfoResponseType";
import { useVerticalCurtain } from "../../../lib/effects/useVerticalCurtain";
import { useCurrentUtcOffset } from "../hooks/useCurrentUtcOffset";
import { useTranslation } from "react-i18next";
import { getUtcMoment } from "../../../utility/moment";

export function HistoryRecords(props: {
  isShowAll: boolean;
  toggleShowAll: () => void;
  history: WebClientInfoResponseType[];
}) {
  const { isShowAll, toggleShowAll, history } = props;
  const { t } = useTranslation();
  const utcOffset = useCurrentUtcOffset();
  const [openedItems, setOpenedItems] = useState<number[]>([0]);
  const historyEntries = Object.entries(groupRecords(history));
  const [firstRecordGroup, secondRecordGroup] = historyEntries.slice(0, 2);
  const tailRecordGroups = historyEntries.slice(2);
  const [allCurtainNode, setAllCurtainNode] = useState<HTMLDivElement | null>(
    null
  );
  const [allContentNode, setAllContentNode] = useState<HTMLDivElement | null>(
    null
  );

  useVerticalCurtain({
    curtain: allCurtainNode,
    contents: allContentNode,
    opened: isShowAll,
  });

  function handleToggleShowAll() {
    toggleShowAll();
  }

  useEffect(() => {
    setOpenedItems([0]);
  }, [history.length]);
  const toggleOpen = useCallback(
    (index: number) => {
      setOpenedItems((i) => {
        if (i.includes(index)) {
          return i.filter((it) => it !== index);
        } else {
          return [...i, index];
        }
      });
    },
    [setOpenedItems]
  );

  function groupRecords(records: WebClientInfoResponseType[]) {
    return sortedFromLatest(records).reduce<
      Record<string, WebClientInfoResponseType[]>
    >((prev, next) => {
      const dayMoment = getUtcMoment(utcOffset, next.createdAt);
      if (!dayMoment) {
        return prev;
      }
      const dateKey = dayMoment.format("DD.MM.YYYY");
      return {
        ...prev,
        [dateKey]: [...(prev[dateKey] ?? []), next],
      };
    }, {});
  }

  return (
    <div className={styles.records}>
      {firstRecordGroup && (
        <Record
          opened={openedItems.includes(0)}
          toggleOpen={() => {
            toggleOpen(0);
          }}
          history={firstRecordGroup[1]}
        />
      )}
      {secondRecordGroup && (
        <Record
          opened={openedItems.includes(1)}
          toggleOpen={() => {
            toggleOpen(1);
          }}
          history={secondRecordGroup[1]}
        />
      )}
      {!isShowAll && tailRecordGroups.length > 0 && (
        <div className={styles.showTrigger} onClick={handleToggleShowAll}>
          {t("chat.analytics.history.showAll")}
        </div>
      )}
      {tailRecordGroups.length > 0 && (
        <div className={styles.allCurtain} ref={setAllCurtainNode}>
          <div ref={setAllContentNode}>
            {tailRecordGroups.map((record, i) => {
              const index = i + 2;
              return (
                <Record
                  key={`record_${i}`}
                  opened={openedItems.includes(index)}
                  history={record[1]}
                  toggleOpen={() => toggleOpen(index)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
