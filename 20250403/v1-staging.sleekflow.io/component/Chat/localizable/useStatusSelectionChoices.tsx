import { useTranslation } from "react-i18next";
import { MenuItemProps } from "semantic-ui-react";
import React, { useCallback, useMemo } from "react";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";

export type StatusSelectionItemType = MenuItemProps & {
  name: string;
  counter?: number;
};

export function useStatusSelectionChoices() {
  const { t, i18n } = useTranslation();
  const selectedStatus = useAppSelector((s) => s.selectedStatus);
  const summary = useAppSelector((s) => s.inbox.summary, equals);

  const findStatusCount = useCallback(
    (status: string) =>
      summary.filters.conversationSummaries.find((s) => s.status === status)
        ?.count,
    [summary.filters.conversationSummaries.map((s) => s.count).join(",")]
  );

  return useMemo(() => {
    const statusSelection: Array<StatusSelectionItemType> = [
      {
        key: "open",
        content: (
          <>
            {t("chat.filter.status.open")}
            {!summary.loading && <Counter n={findStatusCount("open")} />}
          </>
        ),
        active: selectedStatus === "open",
        name: "open",
        counter: findStatusCount("open"),
      },
      {
        key: "pending",
        content: (
          <>
            {t("chat.filter.status.snoozed")}
            {!summary.loading && <Counter n={findStatusCount("pending")} />}
          </>
        ),
        active: selectedStatus === "pending",
        name: "pending",
        counter: findStatusCount("pending"),
      },
      {
        key: "closed",
        content: (
          <>
            {t("chat.filter.status.closed")}
            {!summary.loading && <Counter n={findStatusCount("closed")} />}
          </>
        ),
        active: selectedStatus === "closed",
        name: "closed",
        counter: findStatusCount("closed"),
      },
    ];
    return statusSelection;
  }, [
    selectedStatus,
    summary.filters.conversationSummaries,
    i18n.language,
    findStatusCount,
  ]);
}

function Counter(props: { n?: number }) {
  if (props.n === undefined) {
    return null;
  }
  return <span className={"counter"}>{props.n}</span>;
}
