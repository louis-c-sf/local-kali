import React, { useCallback } from "react";
import { Checkbox } from "semantic-ui-react";
import { AssigneeHashtagSummaryType } from "../../../types/ChatsSummaryResponseType";
import { Action } from "../../../types/LoginType";
import { useChatsFilterBuilder } from "../../../api/Chat/useChatsFilterBuilder";
import { ChatLabel } from "../ChatLabel";
import { matchingTag } from "../../../container/Chat/LabelsManagementContainer";
import { useCompanyHashTags } from "../../Settings/hooks/useCompanyHashTags";
import { HashTagCountedType } from "../../../types/ConversationType";
import styles from "./LabelMenu.module.css";
import equals from "fast-deep-equal";
import { findClosestParent } from "utility/dom";

const FIRST_PAGE_LIMIT = navigator.hardwareConcurrency > 8 ? 60 : 30;

const LabelMenu = (props: {
  itemsFiltered: HashTagCountedType[] | undefined;
  filter: {
    tagIds: string[];
    unreadStatus?: "UnreadOnly" | "ReadOnly" | undefined;
    channel?: string | undefined;
  };
  summary: AssigneeHashtagSummaryType[];
  loginDispatch: React.Dispatch<Action>;
}) => {
  const { filter, summary, loginDispatch, itemsFiltered } = props;
  const { companyTags, getActualTagsOnly } = useCompanyHashTags();
  const { filterTags } = useChatsFilterBuilder();
  const summaryHashTags = (itemsFiltered ?? companyTags).filter((t) =>
    summary.some((s) => s.hashtagId === t.id && s.count > 0)
  );
  const actualTags = getActualTagsOnly(summaryHashTags);

  const isSearchActive = props.itemsFiltered !== undefined;
  const limitedTags =
    isSearchActive && itemsFiltered
      ? itemsFiltered
      : actualTags.slice(0, FIRST_PAGE_LIMIT);

  const toggleTag = useCallback(
    (tagId: string) => {
      if (tagId) {
        if (filter.tagIds.includes(tagId)) {
          loginDispatch({ type: "CHAT_REMOVE_TAG_FILTER", id: tagId });
        } else {
          loginDispatch({ type: "CHAT_ADD_TAG_FILTER", id: tagId });
        }
      }
    },
    [filter.tagIds.join()]
  );

  const catchToggleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.persist();
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const toggle = findClosestParent(target, (p) =>
      p.classList.contains("_toggle")
    );
    if (!toggle) {
      return;
    }
    event.stopPropagation();
    const itemId = findClosestParent(target, (p) =>
      p.classList.contains("item")
    )?.dataset?.id;
    if (!itemId) {
      return;
    }
    toggleTag(itemId);
  };

  return (
    <div className={styles.scrollStrip} onClick={catchToggleClick}>
      {limitedTags.map((row) => {
        const foundHashtag = summary.find(matchingTag(row));
        if (!foundHashtag) {
          return null;
        }
        return (
          <Row
            key={row.id}
            tag={{ ...row, count: foundHashtag.count }}
            checked={filterTags.some(matchingTag(row))}
          />
        );
      })}
    </div>
  );
};

function Row(props: { tag: HashTagCountedType; checked: boolean }) {
  return (
    <div className={`filter item ${styles.item}`} data-id={props.tag.id}>
      <Checkbox checked={props.checked} className={"_toggle"} />
      <ChatLabel tag={props.tag} className={"_toggle"} />
      <div className="count">{props.tag.count}</div>
    </div>
  );
}

export const LabelMenuMemo = React.memo(LabelMenu, (prevProps, nextProps) => {
  return equals(
    [prevProps.filter, prevProps.itemsFiltered, prevProps.summary],
    [nextProps.filter, nextProps.itemsFiltered, nextProps.summary]
  );
});
