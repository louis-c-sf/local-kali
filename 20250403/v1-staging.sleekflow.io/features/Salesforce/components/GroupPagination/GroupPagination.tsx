import React from "react";
import styles from "./GroupPagination.module.css";
import { useTranslation } from "react-i18next";
import localeEn from "./i18n/pagination-en.json";
import localeHk from "./i18n/pagination-zh-hk.json";
import localeCn from "./i18n/pagination-zh-cn.json";
import { GroupingTokenPaginator } from "lib/pagination/GroupingTokenPaginator";

export function GroupPagination(props: {
  page: number;
  pageSize: number;
  pagesPerGroup: number;
  groupResultCount: number;
  prevToken: string | null;
  nextToken: string | null;
  onPageChange: (number: number) => void;
  onPrevGroup?: () => void;
  onNextGroup?: () => void;
  disabled: boolean;
}) {
  const { onPageChange, onPrevGroup, onNextGroup } = props;
  const { t, i18n } = useTranslation();
  i18n.addResources("en-US", "pagination", localeEn);
  i18n.addResources("zh-HK", "pagination", localeHk);
  i18n.addResources("zh-CN", "pagination", localeCn);

  const paginator = new GroupingTokenPaginator(
    props.page,
    props.pageSize,
    props.pagesPerGroup,
    props.groupResultCount,
    props.prevToken,
    props.nextToken
  );

  const pageNumbers = paginator.getGroupPageNumbers();

  function handlePageClick(number: number) {
    return () => onPageChange(number);
  }

  function getItemClasses(number: number) {
    const classes = ["item", styles.item];
    if (number === props.page) {
      classes.push("active");
    }
    if (props.disabled) {
      classes.push("disabled");
    } else {
      classes.push(styles.enabled);
    }
    return classes.join(" ");
  }

  return (
    <div className={`ui pagination menu ${styles.pagination}`}>
      {onPrevGroup && (
        <div
          key={"prev"}
          className={`item ${
            paginator.canNavigatePrevGroup() ? "" : "disabled"
          }`}
          onClick={paginator.canNavigatePrevGroup() ? onPrevGroup : undefined}
        >
          {t("pagination.loadPrevGroup", { count: props.pagesPerGroup })}
        </div>
      )}

      {pageNumbers.map((number) => (
        <div
          key={`num${number}`}
          className={getItemClasses(number)}
          onClick={handlePageClick(number)}
        >
          {number}
        </div>
      ))}

      {onNextGroup && (
        <div
          key={"next"}
          className={`item ${
            paginator.canNavigateNextGroup() ? "" : "disabled"
          }`}
          onClick={paginator.canNavigateNextGroup() ? onNextGroup : undefined}
        >
          {t("pagination.loadNextGroup", { count: props.pagesPerGroup })}
        </div>
      )}
    </div>
  );
}
