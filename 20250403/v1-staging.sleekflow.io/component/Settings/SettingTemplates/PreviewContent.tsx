import { WhatsappTemplateComponentButtonType } from "types/WhatsappTemplateResponseType";
import { useTranslation } from "react-i18next";
import React from "react";
import styles from "./PreviewContent.module.css";
import { isImageMime } from "lib/utility/mime";
import LogoImg from "../../../assets/images/logo-solid.svg";
import LogoSquareImg from "./assets/sf-logo-square.svg";
import FileIconImg from "./assets/file-icon.svg";
import DotsIconImg from "./assets/icon-dots.svg";
import ArrowDarkImg from "./assets/arrow-dark.svg";
import LineIconsRightImg from "./assets/line-icons-r.svg";
import LogoNameImg from "./assets/logo-name.svg";
import LogoNameThinImg from "./assets/logo-name-thin.svg";
import GreenTickImg from "../../../assets/images/official-guide/greenTick.svg";
import {
  UploadedBroadcastFileType,
  UploadedQuickReplyFileType,
} from "types/UploadedFileType";
import { useBroadcastImagePreview } from "../../Broadcast/useBroadcastImagePreview";
import PreviewHeaderSample from "./PreviewHeaderSample";
import { CloudAPIHeaderFormValueType } from "./CloudApi/EditTemplate";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export function PreviewContent(props: {
  value: string;
  skin?: "whatsapp" | "generic" | "line" | "sms" | "wechat";
  attachments?: Array<UploadedBroadcastFileType | UploadedQuickReplyFileType>;
  buttons?: Array<WhatsappTemplateComponentButtonType>;
  header?: CloudAPIHeaderFormValueType;
  footer?: string;
  compact?: boolean;
  fluid?: boolean;
  hideHeader?: boolean;
}) {
  const {
    value,
    buttons,
    compact,
    hideHeader,
    attachments,
    skin = "whatsapp",
    header,
    footer,
    fluid = false,
  } = props;
  const { t } = useTranslation();

  function getSkinClass(skin: string) {
    const map = {
      whatsapp: styles.whatsapp,
      generic: styles.generic,
      line: styles.line,
      sms: styles.sms,
      wechat: styles.wechat,
    };
    return map[skin] ?? styles.whatsapp;
  }

  return (
    <div
      className={`
       ${styles.preview} ${compact ? styles.compact : ""}
       ${fluid ? styles.fluid : ""}
       ${getSkinClass(skin)}
      `}
    >
      {!hideHeader && (
        <div className={styles.header}>
          {t("settings.template.preview.header")}
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.messengerHead}>
          {["line", "wechat", "sms"].includes(skin) && (
            <img src={ArrowDarkImg} className={styles.arrow} />
          )}
          {skin !== "wechat" && <img src={LogoImg} className={styles.logo} />}
          {skin !== "wechat" && (
            <img src={LogoNameImg} className={styles.logoName} />
          )}
          {skin === "wechat" && (
            <img src={LogoNameThinImg} className={styles.logoName} />
          )}
          {skin === "whatsapp" && (
            <img src={GreenTickImg} className={styles.tick} />
          )}
          {skin === "wechat" && (
            <img src={DotsIconImg} className={styles.dots} />
          )}
          {skin === "line" && (
            <img src={LineIconsRightImg} className={styles.rightIcons} />
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.langContent}>
            {skin === "wechat" && (
              <div className={styles.avatar}>
                <img src={LogoSquareImg} />
              </div>
            )}
            <div className={styles.balloon}>
              {header &&
                header.format &&
                (header.format === "TEXT" ? (
                  <div className={styles.messageHeader}>{header.text}</div>
                ) : (
                  <PreviewHeaderSample header={header} />
                ))}
              <pre>{value}</pre>
              {footer && <div className={styles.messageFooter}>{footer}</div>}
            </div>
          </div>
          {attachments?.map((file, i) => (
            <div className={styles.attachContent}>
              {skin === "wechat" && (
                <div className={styles.avatar}>
                  <img src={LogoSquareImg} />
                </div>
              )}
              <Attachment file={file} key={i} />
            </div>
          ))}
          {buttons && (
            <div className={styles.buttons}>
              {buttons.map((btn) => (
                <div className={styles.button}>{btn.text}</div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.footer} />
      </div>
    </div>
  );
}

function Attachment(props: {
  file: UploadedBroadcastFileType | UploadedQuickReplyFileType;
}) {
  const { file } = props;
  const { mimeType } = file;

  function getPreviewComponent() {
    switch (true) {
      case isImageMime(mimeType):
        return <ImagePreview file={file} />;

      default:
        return <FileName file={file} />;
    }
  }

  return (
    <div
      className={`
      ${styles.balloon}
      ${styles.attachment}
      ${isImageMime(mimeType) ? styles.image : ""}
      `}
    >
      {getPreviewComponent()}
    </div>
  );
}

function ImagePreview(props: {
  file: UploadedBroadcastFileType | UploadedQuickReplyFileType;
}) {
  const { imgSrc } = useBroadcastImagePreview({
    file: props.file,
  });

  return <img src={imgSrc} />;
}

function FileName(props: {
  file: UploadedBroadcastFileType | UploadedQuickReplyFileType;
}) {
  const filename = props.file.filename;
  const basename = filename.split("/").pop() ?? filename;

  return (
    <div className={styles.name} title={htmlEscape(basename)}>
      <img src={FileIconImg} />
      <div className={styles.filename}>{basename}</div>
    </div>
  );
}
