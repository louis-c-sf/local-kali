import React, { SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Portal } from "semantic-ui-react";
import { usePopperPopup } from "../shared/popup/usePopperPopup";
import { findClosestParent } from "../../utility/dom";
import { identical } from "ramda";

export function ChatGroupContextMenu(props: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  hovered: boolean;
  isBookmarked: boolean;
  isUnread: boolean;
  isOpened: boolean;
  triggerRef: HTMLElement | null;
  parentRef?: HTMLElement;
  bookmarkChat: Function;
  unbookmarkChat: Function;
  markUnreadChat: Function;
  openChat: Function;
  closeChat: Function;
}) {
  const {
    hovered,
    isBookmarked,
    isUnread,
    isOpened,
    parentRef,
    triggerRef,
    setMenuOpen,
    menuOpen,
  } = props;

  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  usePopperPopup(
    {
      popupRef: dropdownRef,
      anchorRef: triggerRef,
      placement: "bottom-end",
      closeOnOutsideClick: true,
      onClose: handleClose,
    },
    [hovered, menuOpen]
  );

  useEffect(() => {
    if (!parentRef || !dropdownRef) {
      return;
    }

    function hideOnMouseOut(event: MouseEvent) {
      if (!event.relatedTarget) {
        return;
      }
      const isInsideDropdown = findClosestParent(
        event.relatedTarget as HTMLElement,
        identical(dropdownRef as HTMLElement)
      );
      const isInsideParent = findClosestParent(
        event.relatedTarget as HTMLElement,
        identical(parentRef as HTMLElement)
      );
      if (!(isInsideDropdown || isInsideParent)) {
        setMenuOpen(false);
      }
    }

    dropdownRef?.addEventListener("mouseout", hideOnMouseOut);

    return () => {
      dropdownRef?.removeEventListener("mouseout", hideOnMouseOut);
    };
  }, [parentRef, dropdownRef]);

  function handleClose() {
    setMenuOpen(false);
  }

  function bookmarkChat(e: SyntheticEvent) {
    e.stopPropagation();
    props.bookmarkChat();
  }

  function unbookmarkChat(e: SyntheticEvent) {
    e.stopPropagation();
    props.unbookmarkChat();
  }

  function markUnreadChat(e: SyntheticEvent) {
    e.stopPropagation();
    props.markUnreadChat();
  }

  function closeChat(e: SyntheticEvent) {
    e.stopPropagation();
    props.closeChat();
  }

  function openChat(e: SyntheticEvent) {
    e.stopPropagation();
    props.openChat();
  }

  const dropdown = (
    <Dropdown.Menu open>
      {!isBookmarked ? (
        <Dropdown.Item onClick={bookmarkChat}>
          {t("chat.conversation.actions.bookmarkAdd")}
        </Dropdown.Item>
      ) : (
        <Dropdown.Item onClick={unbookmarkChat}>
          {t("chat.conversation.actions.bookmarkRemove")}
        </Dropdown.Item>
      )}
      {isOpened ? (
        <Dropdown.Item onClick={closeChat}>
          {t("chat.conversation.actions.close")}
        </Dropdown.Item>
      ) : (
        <Dropdown.Item onClick={openChat}>
          {t("chat.conversation.actions.open")}
        </Dropdown.Item>
      )}
      {!isUnread && (
        <Dropdown.Item onClick={markUnreadChat}>
          {t("chat.conversation.actions.markUnread")}
        </Dropdown.Item>
      )}
    </Dropdown.Menu>
  );

  return (
    <Portal mountNode={document.getElementById("root")} open={true}>
      <div
        className={`ui dropdown dropdown-menu-overlay ${
          menuOpen ? "visible" : "hidden"
        }`}
        ref={setDropdownRef}
      >
        {dropdown}
      </div>
    </Portal>
  );
}

export const ChatGroupContextMenuMemo = React.memo(
  ChatGroupContextMenu,
  (prev, next) => {
    return (
      prev.hovered === next.hovered &&
      prev.isBookmarked === next.isBookmarked &&
      prev.isUnread === next.isUnread &&
      prev.menuOpen === next.menuOpen &&
      prev.triggerRef === next.triggerRef &&
      prev.parentRef === next.parentRef
    );
  }
);
