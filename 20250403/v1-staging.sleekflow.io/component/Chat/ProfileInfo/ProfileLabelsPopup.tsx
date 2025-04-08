import React, { useState, useRef } from "react";
import { HashTagCountedType, HashTagType } from "types/ConversationType";
import { Icon, Portal } from "semantic-ui-react";
import { ChatLabel } from "../ChatLabel";
import { Trans, useTranslation } from "react-i18next";
import styles from "./ProfileLabelsPopup.module.css";
import useRouteConfig from "../../../config/useRouteConfig";
import { usePopperPopup } from "../../shared/popup/usePopperPopup";
import { ProfileLabelsFlowInterface } from "component/Chat/ProfileInfo/useProfileLabelsFlow";
import { TagsFilterHookInterface } from "component/Chat/hooks/useHashtagsFilter";

type ProfileLabelsPopupProps = {
  opened: boolean;
  trigger: HTMLElement | null;
  anchor: HTMLElement | null;
  close: () => void;
  flow: ProfileLabelsFlowInterface;
  filter: TagsFilterHookInterface;
};

export function ProfileLabelsPopup(props: ProfileLabelsPopupProps) {
  const { trigger, anchor, close, flow, filter } = props;

  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const href = routeTo("/settings/inbox/labels", true);
  const windowRef = useRef<HTMLDivElement | null>(null);

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: anchor,
      placement: "left-start",
      offset: [0, 24],
    },
    []
  );

  return (
    <Portal
      open={props.opened}
      closeOnDocumentClick
      closeOnTriggerClick
      closeOnEscape
      onClose={close}
      mountNode={document.body}
      triggerRef={{ current: trigger }}
    >
      <div className={styles.popup} ref={setPopupNode}>
        <div className={styles.header}>
          <a
            className={styles.outLink}
            target="_blank"
            rel="noopener noreferrer"
            href={href}
          >
            {t("chat.labels.manage.manageAll")}
          </a>
        </div>
        <div className={`${styles.search} ui input`}>
          <input
            value={filter.searchQuery}
            className={styles.input}
            placeholder={t("chat.labels.manage.field.search.placeholder")}
            onChange={(event) => filter.search(event.target.value)}
          />
          {filter.searchActive && (
            <Icon
              name={"close"}
              onClick={filter.resetSearch}
              className={styles.close}
            />
          )}
        </div>
        {filter.searchActive && filter.items.length === 0 && (
          <div className={styles.status}>
            {t("form.field.dropdown.noResults")}
          </div>
        )}
        {flow.canAddNewLabel && (
          <div onClick={flow.addNewLabel} className={styles.action}>
            <Trans
              i18nKey={"chat.labels.manage.prompt.createLabel"}
              values={{ name: filter.searchQuery }}
            >
              + Create label for ‘
              <span className={"sample"}>{filter.searchQuery.trim()}</span>’
            </Trans>
          </div>
        )}
        <div ref={windowRef} className={styles.labels}>
          <PopupContents
            items={props.filter.items}
            chooseLabel={props.flow.chooseLabel}
          />
        </div>
      </div>
    </Portal>
  );
}

export function PopupContents(props: {
  items: HashTagCountedType[];
  chooseLabel: (item: HashTagType) => () => void;
}) {
  return (
    <div className={styles.labelsInner}>
      {props.items.map((row) => {
        return (
          <div
            className={styles.item}
            key={row.hashtag}
            onClick={props.chooseLabel(row)}
          >
            <ChatLabel tag={row} className={styles.label} />
          </div>
        );
      })}
    </div>
  );
}
