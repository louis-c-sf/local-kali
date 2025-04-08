import React, { useEffect, useRef, useState, ReactNode } from "react";
import { Item, Loader, Ref } from "semantic-ui-react";
import moment from "moment";
import ChatGroupItemImage from "./ChatGroupItemImage/ChatGroupItemImage";
import { iconFactory } from "./hooks/useCompanyChannels";
import { HashTagType } from "../../types/ConversationType";
import { useChatControls } from "./utils/useChatControls";
import { ChatGroupContextMenuMemo } from "./ChatGroupContextMenu";
import { ChatGroupLabelsList } from "./ChatGroupLabelsList";
import { findClosestParent } from "../../utility/dom";
import { identical } from "ramda";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { Action } from "../../types/LoginType";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { useTranslation } from "react-i18next";
import { submitChatStatus } from "../../api/Chat/submitChatStatus";
import { submitChatBookmark } from "../../api/Chat/submitChatBookmark";
import { submitChatUnread } from "../../api/Chat/submitChatUnread";

export default function ChatGroup(props: {
  pic: string;
  name: string;
  nameDisplay: ReactNode;
  message?: ReactNode;
  createdAt: string;
  setSelectedItemHandle: Function;
  selected: boolean;
  unReadMsg?: boolean;
  messageAssignee?: string;
  channel: string;
  conversationId: string;
  showContextMenu: boolean;
  isBookmarked: boolean;
  isOpened: boolean;
  tags: HashTagType[];
  staffName: string;
  disabledMenu?: boolean;
  searchMessage?: string;
}) {
  const {
    staffName,
    pic,
    channel,
    messageAssignee,
    createdAt,
    setSelectedItemHandle,
    selected,
    unReadMsg,
    disabledMenu = false,
    searchMessage = "",
  } = props;
  const { conversationId, showContextMenu, isBookmarked, isOpened } = props;
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);

  const loginDispatch = useAppDispatch();
  const [lastUpdatedDiff, updateLastUpdatedDiff] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [requestPending, setRequestPending] = useState(false);

  const itemRef = useRef<HTMLElement>(null);
  const [triggerRef, setTriggerRef] = useState<HTMLSpanElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    updateLastUpdatedDiff(moment(createdAt).isSame(moment(), "day"));
  }, [JSON.stringify(createdAt)]);

  const { whenUIUnlocked } = useChatControls();

  async function bookmarkChat() {
    setMenuOpen(false);
    setIsHovered(false);
    const originData: Action = {
      type: "BOOKMARK_STATUS_UPDATED",
      conversationId: conversationId,
      isBookmarked: false,
    };
    try {
      loginDispatch({
        ...originData,
        isBookmarked: true,
      });
      submitChatBookmark(conversationId, true);
    } catch (e) {
      loginDispatch({
        ...originData,
      });
      console.error("bookmarkChat", conversationId, e);
    }
  }

  async function unbookmarkChat() {
    setMenuOpen(false);
    setIsHovered(false);
    const originData: Action = {
      type: "BOOKMARK_STATUS_UPDATED",
      conversationId: conversationId,
      isBookmarked: true,
    };
    try {
      loginDispatch({
        ...originData,
        isBookmarked: false,
      });
      submitChatBookmark(conversationId, false);
    } catch (e) {
      loginDispatch({
        ...originData,
      });
      console.error("unbookmarkChat", conversationId, e);
    }
  }

  async function markUnreadChat() {
    setMenuOpen(false);
    setIsHovered(false);
    const originData: Action = {
      type: "UNREAD_STATUS_UPDATED",
      conversationId: conversationId,
      unReadStatus: false,
    };
    try {
      loginDispatch({
        ...originData,
        unReadStatus: true,
      });
      submitChatUnread(conversationId);
    } catch (e) {
      loginDispatch({
        ...originData,
      });
      console.error("unreadChat", conversationId, e);
    }
  }

  async function closeChat() {
    setRequestPending(true);
    setMenuOpen(false);
    setIsHovered(false);
    try {
      await submitChatStatus(conversationId, "closed");
      loginDispatch({ type: "INBOX.API.LOAD_SUMMARY" });
    } catch (e) {
      console.error("closeChat", conversationId, e);
    } finally {
      setRequestPending(false);
    }
  }

  async function openChat() {
    setRequestPending(true);
    setMenuOpen(false);
    setIsHovered(false);
    try {
      await submitChatStatus(conversationId, "open");
      loginDispatch({ type: "INBOX.API.LOAD_SUMMARY" });
    } catch (e) {
      console.error("closeChat", conversationId, e);
    } finally {
      setRequestPending(false);
    }
  }

  const handleItemClick = whenUIUnlocked(() => {
    return setSelectedItemHandle();
  });

  return (
    <Ref innerRef={itemRef}>
      <Item
        onClick={handleItemClick}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={(event: MouseEvent) => {
          const relatedTgt = event.relatedTarget as HTMLElement;
          if (!relatedTgt) {
            return;
          }
          if (
            findClosestParent(relatedTgt, identical(itemRef.current as Element))
          ) {
            return;
          }
          setIsHovered(false);
        }}
        className={selected ? "selectedItem" : ""}
      >
        <ChatImageMemoized name={props.name} pic={pic} channel={channel} />
        {requestPending && (
          <Loader active size={"big"} className={"avatar-loader"} />
        )}
        <Item.Content verticalAlign="middle">
          <Item.Header>
            <div className="name">
              <MessageDisplay
                searchMessage={searchMessage}
                value={props.nameDisplay}
                className={"name"}
              />
            </div>
            {createdAt && (
              <div className="last-updated">
                {lastUpdatedDiff
                  ? moment
                      .utc(createdAt)
                      .utcOffset(selectedTimeZone)
                      .format("HH:mm")
                  : moment
                      .utc(createdAt)
                      .utcOffset(selectedTimeZone)
                      .format("L")}
              </div>
            )}
          </Item.Header>
          <Item.Description>
            {!unReadMsg && messageAssignee && <span className="assigned" />}
            <div
              className={`last-message ${(unReadMsg && "showUnread") || ""}`}
              ref={messageRef}
            >
              {staffName ? (
                <>
                  <span className="staff-name">{staffName}:</span>
                  {
                    <MessageDisplay
                      searchMessage={searchMessage}
                      value={props.message}
                    />
                  }
                </>
              ) : searchMessage ? (
                <MessageDisplay
                  searchMessage={searchMessage}
                  value={props.message}
                />
              ) : (
                props.message
              )}
            </div>
            <div className="indicators">
              {unReadMsg && (
                <div className={"indicator"}>
                  <span className="update-marker" />
                </div>
              )}
              {isBookmarked && (
                <div className={"indicator"}>
                  <i className={"bookmark"} />
                </div>
              )}
              <div
                className={`indicator context-menu ${
                  !disabledMenu && (isHovered || menuOpen) ? "visible" : ""
                }`}
              >
                <InfoTooltip
                  placement={"right"}
                  children={t("chat.tooltip.chat.contextMenu")}
                  trigger={
                    <span
                      className={"context-menu-trigger"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen((op) => !op);
                      }}
                      ref={setTriggerRef}
                    >
                      <i className={"dropdown-chevron icon"} />
                    </span>
                  }
                />
              </div>
              {showContextMenu && (
                <ChatGroupContextMenuMemo
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  hovered={isHovered}
                  isBookmarked={isBookmarked}
                  isUnread={Boolean(unReadMsg)}
                  isOpened={isOpened}
                  parentRef={messageRef.current ?? undefined}
                  triggerRef={triggerRef}
                  bookmarkChat={bookmarkChat}
                  closeChat={closeChat}
                  openChat={openChat}
                  markUnreadChat={markUnreadChat}
                  unbookmarkChat={unbookmarkChat}
                />
              )}
            </div>
          </Item.Description>
        </Item.Content>
        <ChatGroupLabelsList tags={props.tags} />
      </Item>
    </Ref>
  );
}

function ChatImage(props: { name: string; pic: string; channel: string }) {
  return (
    <Item.Image circular size="tiny">
      <>
        <ChatGroupItemImage
          name={props.name}
          pic={props.pic}
          channel={props.channel}
        />
        {props.channel && iconFactory(props.channel) && (
          <Item.Image
            className="subImage"
            src={iconFactory(props.channel)}
            circular
            size="tiny"
          />
        )}
      </>
    </Item.Image>
  );
}

function MessageDisplay(props: {
  searchMessage: string;
  className?: string;
  value?: ReactNode;
}) {
  const { value, className, searchMessage } = props;
  if (!value) {
    return <div></div>;
  }
  if (searchMessage) {
    if (className) {
      return <div className={className}>{value}</div>;
    }
    return <span>{value}</span>;
  }
  if (className) {
    return <div className={className}>{value}</div>;
  }
  return <span>{value}</span>;
}

const ChatImageMemoized = React.memo(ChatImage);
