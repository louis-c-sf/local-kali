import { TFunction } from "i18next";
import React, { ReactNode } from "react";
import { ProfileType } from "types/LoginType";
import MessageType, {
  isFacebookOTNRequestMessage,
  ListMessageObjectType,
  QuickReplyObjectType,
  WhatsappInteractiveObjectType,
} from "types/MessageType";
import { Modal } from "semantic-ui-react";
import { CloseIcon } from "component/shared/modal/CloseIcon";
import { PreviewContent } from "component/shared/PreviewContent";
import PreviewListContent from "component/shared/PreviewListContent";
import InteractiveMessageBoxView from "../InteractiveMessage/InteractiveMessageBoxView";
import {
  ButtonType,
  ListMessageSection,
} from "../InteractiveMessage/InteractiveMessageSchema";
import MessageRecord from "./MessageRecord";
import styles from "./MessageRecord.module.css";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";

const InteractiveMessageTypeMap = {
  button: ButtonType.QUICK_REPLY,
  list: ButtonType.LIST_MESSAGE,
  facebookOTN: ButtonType.NOTIFY_ME,
};

export default function InteractiveMessageRecord({
  message,
  senderName,
  senderPic,
  t,
  channelTitle,
  channelTypeName,
  userId,
  isShowIcon,
  beforeContent,
}: MessageRecordCommonProps & {
  messageQuoted?: MessageType;
  parentRef?: HTMLDivElement;
  beforeContent: ReactNode;
  userId: string;
}) {
  const [showModal, setShowModal] = React.useState(false);
  const closeModal = () => setShowModal(false);

  let interactiveMessage: any, messageContent, quickReplies, listMessageTitle;
  if (isFacebookOTNRequestMessage(message)) {
    interactiveMessage = { type: "facebookOTN" };
    messageContent =
      message.extendedMessagePayload?.extendedMessagePayloadDetail
        ?.facebookMessagePayload?.attachment?.payload?.title;
  } else {
    interactiveMessage =
      message.whatsapp360DialogExtendedMessagePayload
        ?.whatsapp360DialogInteractiveObject ||
      message.extendedMessagePayload?.extendedMessagePayloadDetail
        .whatsappCloudApiInteractiveObject;
    messageContent = interactiveMessage?.body.text || "";
    quickReplies = (
      interactiveMessage as QuickReplyObjectType
    ).action?.buttons?.map((button) => button.reply.title);
    listMessageTitle = (interactiveMessage as ListMessageObjectType).action
      .button;
  }

  if (!interactiveMessage) {
    return null;
  }

  return (
    <>
      <MessageRecord
        message={message}
        senderName={senderName}
        senderPic={senderPic}
        channelTitle={channelTitle}
        channelTypeName={channelTypeName}
        isShowIcon={isShowIcon}
        userId={userId}
        t={t}
        pickingMessagesActive={false}
        beforeContent={beforeContent}
        afterContent={
          <div
            className={`${styles.interactiveMessageWrapper} ${
              isFacebookOTNRequestMessage(message) ? "facebookOTNMessage" : ""
            }`}
            onClick={() =>
              isFacebookOTNRequestMessage(message) ? {} : setShowModal(true)
            }
          >
            <InteractiveMessageBoxView
              type={InteractiveMessageTypeMap[interactiveMessage.type]}
              quickReplies={quickReplies}
              listMessageTitle={listMessageTitle}
            />
          </div>
        }
      >
        {isFacebookOTNRequestMessage(message) && (
          <span className={styles.prefix}>
            {t("chat.facebookOTN.message.prefix")}
          </span>
        )}
        {messageContent}
      </MessageRecord>
      {showModal && (
        <PreviewContentModal
          interactiveMessage={interactiveMessage}
          closeModal={closeModal}
        />
      )}
    </>
  );
}

function PreviewContentModal({
  interactiveMessage,
  closeModal,
}: {
  interactiveMessage: WhatsappInteractiveObjectType;
  closeModal: () => void;
}) {
  const messageContent = interactiveMessage?.body.text || "";

  const quickReplies = (
    interactiveMessage as QuickReplyObjectType
  ).action.buttons?.map((button) => ({
    text: button.reply.title,
    type: button.type,
  }));

  const listMessageTitle = (interactiveMessage as ListMessageObjectType).action
    .button;

  const parsedListMessage: ListMessageSection[] = (
    interactiveMessage as ListMessageObjectType
  ).action.sections?.map((section) => ({
    title: section?.title || "",
    options: section.rows.map((row) => ({
      name: row.title,
      description: row?.description || "",
    })),
  }));

  return (
    <Modal
      open
      closeIcon={<CloseIcon />}
      className={styles.previewModal}
      onClose={closeModal}
    >
      {quickReplies?.length && (
        <PreviewContent value={messageContent} buttons={quickReplies} />
      )}
      {listMessageTitle && parsedListMessage?.length && (
        <PreviewListContent
          value={messageContent}
          buttonText={listMessageTitle}
          sections={parsedListMessage}
        />
      )}
    </Modal>
  );
}
