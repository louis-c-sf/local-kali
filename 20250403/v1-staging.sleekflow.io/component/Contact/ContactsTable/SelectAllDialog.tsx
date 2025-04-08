import React from "react";
import { Loader } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

type SelectAllDialogProps = {
  totalCount: number;
  isPageSelected: boolean;
  isAllSelected: boolean;
  pageCount: number;
  selectAll: Function;
  deselectAll: Function;
  hasMoreToSelect: boolean;
  pending: boolean;
};

export function SelectAllDialog(props: SelectAllDialogProps) {
  const {
    totalCount,
    isPageSelected,
    isAllSelected,
    pageCount,
    hasMoreToSelect,
  } = props;
  const { selectAll, deselectAll, pending } = props;
  const { t } = useTranslation();

  const callSelectAll = (ev: React.MouseEvent) => {
    ev.preventDefault();
    selectAll();
  };

  if (hasMoreToSelect || isAllSelected || pending) {
    return (
      <thead className={"thead-popup"}>
        <tr className={"table-wide-row"}>
          <th colSpan={200}>
            <div className={"table-popup table-popup_info"}>
              {(hasMoreToSelect || pending) && (
                <>
                  {t("profile.contacts.selectAll.header.selectedSome", {
                    count: pageCount,
                  })}{" "}
                  <a onClick={pending ? undefined : callSelectAll}>
                    {t("profile.contacts.selectAll.header.selectAll", {
                      count: totalCount,
                    })}
                  </a>{" "}
                  <Loader
                    inline
                    active
                    size={"small"}
                    style={{ visibility: pending ? "visible" : "hidden" }}
                  />
                </>
              )}
              {isAllSelected && (
                <>
                  {t("profile.contacts.selectAll.header.selectedAll", {
                    count: totalCount,
                  })}{" "}
                  <a
                    onClick={(ev) => {
                      ev.preventDefault();
                      deselectAll();
                    }}
                  >
                    {t("profile.contacts.selectAll.action.clear")}
                  </a>{" "}
                  <Loader
                    inline
                    active
                    size={"small"}
                    style={{ visibility: pending ? "visible" : "hidden" }}
                  />
                </>
              )}
            </div>
          </th>
        </tr>
      </thead>
    );
  }
  return <></>;
}
