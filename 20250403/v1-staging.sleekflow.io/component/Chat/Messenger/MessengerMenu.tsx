import React from "react";
import { Image, Menu } from "semantic-ui-react";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { useTranslation } from "react-i18next";
import { TypeStatusEnum } from "../../../types/LoginType";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import styles from "./MessengerMenu.module.css";
import { useSelectWhatsappTemplateFlow } from "./SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { SendWhatsappTemplateState } from "../../../App/reducers/Chat/whatsappTemplatesReducer";
import PlusIcon from "../../../assets/tsx/icons/PlusIcon";
import {
  convertNonPromotionalValueToName,
  getNonPromotionalDict,
} from "../../../features/Facebook/usecases/Inbox/helper/getNonPromotionalDict";
import TagIcon from "../../../assets/images/chat/tag.svg";
import { equals } from "ramda";

const MessengerMenu = React.memo(function MessengerMenu(props: {
  onChangeMode: (mode: TypeStatusEnum) => void;
  messageMode: TypeStatusEnum;
  conversationId: string;
  disabledSchedule?: boolean;
}) {
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const {
    messageMode,
    onChangeMode,
    conversationId,
    disabledSchedule = false,
  } = props;

  const { template, templateMode } =
    useSelectWhatsappTemplateFlow(conversationId);

  const [hasInteractiveMessage, messageType] = useAppSelector(
    (s) => [
      Boolean(s.inbox.messenger.interactiveMessage),
      s.inbox.facebook.messageType,
    ],
    equals
  );
  const nonPromotionalDict = getNonPromotionalDict(
    t,
    messageType.hasHumanAgent
  );
  const selectedTag =
    convertNonPromotionalValueToName(nonPromotionalDict, messageType.value) ??
    t("chat.facebookOTN.overlay.actions.selectedOption.facebookOTN");

  function getModeStyles(
    mode: TypeStatusEnum,
    templateMode: SendWhatsappTemplateState["mode"]
  ) {
    const map: Record<TypeStatusEnum, string> = {
      note: styles.note,
      reply: styles.reply,
      schedule: styles.reply,
    };
    const stylesBuilt = [map[mode]];
    if (templateMode === "template") {
      stylesBuilt.push(styles.whatsAppTemplate);
    }
    return stylesBuilt;
  }

  return (
    <Menu
      pointing
      secondary
      className={`${styles.menu} ${getModeStyles(messageMode, templateMode)}`}
    >
      <InfoTooltip
        children={t("chat.send.tooltip.reply")}
        placement={"top"}
        offset={[0, 10]}
        trigger={
          <Menu.Item
            onClick={() => onChangeMode("reply")}
            active={messageMode === "reply"}
          >
            {t("chat.send.mode.reply")}
          </Menu.Item>
        }
      />

      {!disabledSchedule && (
        <InfoTooltip
          placement={"top"}
          children={t("chat.send.tooltip.schedule")}
          offset={[0, 10]}
          trigger={
            <Menu.Item
              onClick={() => onChangeMode("schedule")}
              active={messageMode === "schedule"}
              content={t("chat.send.mode.schedule")}
            />
          }
        />
      )}
      {!hasInteractiveMessage && (
        <InfoTooltip
          placement={"top"}
          children={t("chat.send.tooltip.note")}
          offset={[0, 10]}
          trigger={
            <Menu.Item
              onClick={() => onChangeMode("note")}
              active={messageMode === "note"}
              className={templateMode === "template" ? styles.dimmed : ""}
              content={t("chat.send.mode.note")}
            />
          }
        />
      )}
      {templateMode === "type" && !hasInteractiveMessage && (
        <Menu.Item
          className={styles.selectWhatsappTemplate}
          onClick={() =>
            loginDispatch({
              type: "INBOX.WHATSAPP_TEMPLATE.MODAL.OPEN",
            })
          }
        >
          <PlusIcon />
          {t("chat.selectWhatsappTemplate.selectTemplate")}
        </Menu.Item>
      )}
      {hasInteractiveMessage && (
        <Menu.Item
          className={styles.selectWhatsappTemplate}
          content={t("chat.actions.interactiveMessage.reset")}
          onClick={() =>
            loginDispatch({ type: "INBOX.INTERACTIVE_MESSAGE.RESET" })
          }
        />
      )}
      {(messageMode === "reply" || messageMode === "schedule") &&
        messageType.showMessageTag && (
          <Menu.Item
            className={styles.selectMessageTag}
            content={
              <>
                <Image src={TagIcon} size="mini" />
                {selectedTag}
              </>
            }
            onClick={() =>
              loginDispatch({ type: "INBOX.FACEBOOK.MESSAGE_TYPE.SHOW_MODAL" })
            }
          />
        )}
      {templateMode === "template" && template && messageMode !== "note" && (
        <Menu.Item
          className={styles.selectWhatsappTemplate}
          content={t("chat.selectWhatsappTemplate.reset")}
          onClick={() =>
            loginDispatch({ type: "INBOX.WHATSAPP_TEMPLATE.RESET" })
          }
        />
      )}
    </Menu>
  );
});
export { MessengerMenu };
