import { useTranslation } from "react-i18next";
import React from "react";
import { Image } from "semantic-ui-react";
import { plur } from "../../../utility/string";
import { DeleteConfirmationAwareType } from "./GridHeader";
import DownloadIcon from "../../../assets/images/download-underline.svg";
import Forward from "../../../assets/images/forward.svg";
import styles from "./GridSelection.module.css";

export function GridSelection(
  props: {
    selectedItemsCount: number;
    itemsSingular: string;
    itemsPlural: string;
    deletePrompt?: string;
    hasDownloadIcon?: boolean;
    hasForwardIcon?: boolean;
    handleDownloadAll?: () => void;
  } & DeleteConfirmationAwareType
) {
  const {
    selectedItemsCount,
    deleteConfirmationRequested,
    hasDownloadIcon = false,
    hasForwardIcon = false,
    handleDownloadAll = () => {},
  } = props;
  const { t } = useTranslation();

  const anyItemsSelected = selectedItemsCount > 0;
  const showDelete = anyItemsSelected && !deleteConfirmationRequested;
  const showConfirmButton = anyItemsSelected && deleteConfirmationRequested;

  let statusText = "";

  const conversationWarning = t("profile.contacts.grid.deleteWarning");
  const promptSuffix =
    props.itemsSingular === "contact" ? conversationWarning : "";
  const itemsPlural = plur(
    selectedItemsCount,
    props.itemsSingular,
    props.itemsPlural
  );

  const deletePrompt =
    props.deletePrompt ??
    t("grid.deletePrompt.default", {
      suffix: promptSuffix,
      count: selectedItemsCount,
      itemsPlural,
    })!;

  if (showDelete) {
    statusText = t("grid.deletePrompt.selected", {
      count: selectedItemsCount,
      itemsPlural,
    });
  } else if (showConfirmButton) {
    statusText = deletePrompt
      .replace("{{count}}", selectedItemsCount.toString())
      .replace("{{itemsPlural}}", itemsPlural);
  }

  if (selectedItemsCount === 0) {
    return null;
  }

  const hasIcons = hasDownloadIcon || hasForwardIcon;

  return (
    <thead className={`thead-popup ${styles.container}`}>
      <tr className={"table-wide-row"}>
        <th colSpan={hasIcons ? 5 : 200}>
          <div
            className={`table-popup table-popup_info ${
              hasIcons && styles.hasIcons
            }`}
          >
            <div className="status-text">{statusText}</div>
          </div>
        </th>
        {hasDownloadIcon && (
          <th colSpan={1} className={styles.actionTh}>
            <a onClick={handleDownloadAll}>
              <Image src={DownloadIcon} size="mini" />
              <span>
                {t("profile.individual.media.grid.header.action.download", {
                  count: selectedItemsCount,
                })}
              </span>
            </a>
          </th>
        )}
        {hasForwardIcon && (
          <th colSpan={1} className={styles.actionTh}>
            <a>
              <Image src={Forward} size="mini" />
              <span>
                {t("profile.individual.media.grid.header.action.forward", {
                  count: selectedItemsCount,
                })}
              </span>
            </a>
          </th>
        )}
      </tr>
    </thead>
  );
}
