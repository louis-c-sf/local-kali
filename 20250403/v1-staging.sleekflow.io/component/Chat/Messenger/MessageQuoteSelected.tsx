import React, { useEffect, useState } from "react";
import MessageType, {
  isAttachedImage,
  isAttachedVideo,
  isAttachmentMessage,
  isInteractiveMessage,
} from "../../../types/MessageType";
import UploadedFileType, {
  isUploadedProxy,
} from "../../../types/UploadedFileType";
import useFilePreview from "../../../lib/effects/useFilePreview";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import styles from "./MessageQuoteSelected.module.css";
import { getUploadedAttachment } from "../../../api/Broadcast/getUploadedAttachment";
import { isTemplateContentType } from "../Records/MessageContent";
import useWhatsAppTemplateConvertor from "../Records/useWhatsAppTemplateConvertor";
import VideoFile from "../Records/FilePreview/VideoFile";
import DefaultFile from "../Records/DefaultFile";

type QuoteMode = "text" | "audio" | "image" | "file" | "interactive" | "video";

export function MessageQuoteSelected(props: {
  message?: MessageType | string;
  shrinkable?: boolean;
}) {
  const { message, shrinkable = false } = props;
  const user = useAppSelector((s) => s.user);
  const { t } = useTranslation();

  let author = "";
  if (message === undefined) {
    return null;
  }
  if (typeof message === "object" && message.sender) {
    const userId = message.sender.id;
    if (userId === user.id) {
      author = t("chat.filter.assignee.you");
    } else {
      author = message.sender.displayName ?? message.sender.name ?? "";
    }
  }
  return (
    <div className={`${styles.quote} ${shrinkable ? styles.shrinkable : ""}`}>
      {author !== "" && <div className={styles.author}>{author}</div>}
      {typeof message === "string" ? (
        <RenderString content={message} />
      ) : (
        <RenderMessage message={message} />
      )}
    </div>
  );
}

export function RenderString(props: { content: string }) {
  const { content } = props;
  let mode: QuoteMode = "text";
  let mime = "";

  if (content.startsWith("/9j/")) {
    mode = "image";
    mime = "image/png";
  } else {
    //todo jpg etc?
  }

  return (
    <>
      {mode === "text" && (
        <div className={`${styles.text} ${styles.content}`}>{content}</div>
      )}
      {mode === "image" && mime && (
        <div className={`${styles.image} ${styles.content}`}>
          <img src={`data:${mime};base64, ${content}`} />
        </div>
      )}
    </>
  );
}

export function RenderMessage(props: { message: MessageType }) {
  const { message } = props;
  let mode: QuoteMode = "text";
  let firstFile: UploadedFileType | undefined = undefined;
  const [imgSrc, setImgSrc] = useState("");
  if (isAttachmentMessage(message)) {
    [firstFile] = message.uploadedFiles;
    if (firstFile) {
      mode = "file";
    }
    if (isAttachedVideo(firstFile)) {
      mode = "video";
    } else if (isAttachedImage(message, firstFile)) {
      mode = "image";
    }
  }

  if (isInteractiveMessage(message)) {
    mode = "interactive";
  }

  useEffect(() => {
    if (!firstFile) {
      return;
    }
    getUploadedAttachment(firstFile.fileId, "message", firstFile.filename).then(
      (res) => {
        setImgSrc(res);
      }
    );
  }, [firstFile?.fileId]);
  const previewSrcProxy = useFilePreview(
    firstFile && isUploadedProxy(firstFile) ? firstFile.proxyFile : undefined
  );
  const uploadedImageSrc = previewSrcProxy.src
    ? previewSrcProxy.src
    : firstFile?.fileId
    ? imgSrc
    : undefined;

  const { content } = useWhatsAppTemplateConvertor(message);

  const messageQuoted = ["whatsapp360dialog", "whatsappcloudapi"].includes(
    message.channel
  )
    ? content
    : message.messageContent;
  return (
    <>
      {mode === "interactive" && (
        <div className={`${styles.text} ${styles.content}`}>
          {message.whatsapp360DialogExtendedMessagePayload
            ?.whatsapp360DialogInteractiveObject?.body.text ||
            message.extendedMessagePayload?.extendedMessagePayloadDetail
              .whatsappCloudApiInteractiveObject?.body.text}
        </div>
      )}
      {mode === "text" && (
        <div className={`${styles.text} ${styles.content}`}>
          {isTemplateContentType(messageQuoted)
            ? messageQuoted.content
            : message.messageContent}
        </div>
      )}
      {mode === "file" && firstFile && (
        <div className={`${styles.image} ${styles.content}`}>
          <DefaultFile uploadFile={firstFile} />
        </div>
      )}
      {mode === "video" && firstFile && (
        <div className={`${styles.video} ${styles.content}`}>
          <VideoFile uploadFile={firstFile} messageId={message.id} />
        </div>
      )}
      {mode === "image" && uploadedImageSrc && (
        <div className={`${styles.image} ${styles.content}`}>
          <img src={uploadedImageSrc} />
        </div>
      )}
    </>
  );
}
