import React, { useState } from "react";
import { useChatGuard } from "../hooks/Labels/useChatGuard";
import MessageType from "../../../types/MessageType";
import { Dropdown, DropdownItemProps, Icon, Popup } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { omit } from "ramda";
import { copyToClipboard } from "../../../utility/copyToClipboard";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useMessengerMode } from "../hooks/Labels/useMessengerMode";
import { useAppDispatch } from "../../../AppRootContext";

export interface HidableDropdownItemProps extends DropdownItemProps {
  visible: () => boolean;
}

export function ContextMenu(props: {
  message: MessageType;
  showTrigger: boolean;
}) {
  const { message } = props;
  const chatGuard = useChatGuard();
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const loginDispatch = useAppDispatch();
  const [popupOpened, setPopupOpened] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);

  const { selectMode } = useMessengerMode();

  const commands: HidableDropdownItemProps[] = [
    {
      visible: () => chatGuard.canReplyMessage(message),
      text: t("chat.actions.message.reply"),
      onClick: () => {
        loginDispatch({
          type: "INBOX.MESSAGE.REPLY_SELECTED",
          messageId: message.messageUniqueID,
        });
        selectMode("reply");
        setPopupOpened(false);
        setMenuClicked(true);
      },
      key: "reply",
    },
    {
      visible: () => chatGuard.canCopyText(message),
      text: t("chat.actions.message.copy"),
      onClick: () => {
        copyToClipboard(message.messageContent);
        flash(t("flash.inbox.message.copied"));
        setMenuClicked(true);
      },
      key: "copy",
    },
    {
      visible: () => chatGuard.canForwardMessage(message),
      text: t("chat.actions.message.forward"),
      onClick: () => {
        loginDispatch({
          type: "INBOX.MESSAGE.PICKED",
          messageId: message.id,
          mode: "forward",
        });
      },
      key: "forward",
    },
    {
      visible: () => chatGuard.canSendAsMessage(message),
      text: t("chat.actions.message.sendAsMessage"),
      onClick: () => {
        loginDispatch({
          type: "INBOX.MESSAGE.SEND_AS_MESSAGE",
          message: { ...message },
        });
        setMenuClicked(true);
      },
      key: "sendAsMessage",
    },
    {
      visible: () => chatGuard.canDeleteMessage(message),
      text: t("chat.actions.message.delete"),
      className: "danger",
      onClick: () => {
        loginDispatch({
          type: "INBOX.MESSAGE.PICKED",
          messageId: message.id,
          mode: "delete",
        });
      },
      key: "delete",
    },
    {
      visible: () => chatGuard.canDeleteScheduledMessage(message),
      text: t("chat.actions.message.deleteScheduled"),
      className: "danger",
      onClick: () => {
        loginDispatch({
          type: "INBOX.SCHEDULE.MESSAGE_DELETE_CLICK",
          messageId: message.id,
        });
        setPopupOpened(false);
        setMenuClicked(true);
      },
      key: "delete",
    },
  ].filter((c) => c.visible());

  if (commands.length === 0) {
    return null;
  }

  return (
    <Popup
      on="click"
      hoverable
      className={"app basic mini dialog light"}
      position={"bottom right"}
      open={popupOpened && !menuClicked}
      trigger={
        <span className={`context-trigger visible`}>
          <Icon className={"dropdown-chevron"} />
        </span>
      }
      onOpen={() => {
        setPopupOpened(true);
        setMenuClicked(false);
      }}
      onClose={() => {
        setPopupOpened(false);
        setMenuClicked(false);
      }}
    >
      <Dropdown
        className={"static chat-context-menu"}
        open={!menuClicked}
        trigger={<></>}
        options={commands.map(omit(["visible"]))}
        icon={false}
      />
    </Popup>
  );
}
