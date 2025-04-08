import React from "react";
import Linkify from "linkify-react";
import { TemplateContentHeaderType, TemplateContentType } from "./TextRecord";
import styles from "./MessageContent.module.css";
import ImageFile from "./FilePreview/ImageFile";
import UploadedFileType from "../../../types/UploadedFileType";
import SenderType from "../../../types/SenderType";
import { Icon, Label } from "semantic-ui-react";
import { htmlEntities } from "../../../lib/utility/htmlEntities";
import { UnsupportedMessage } from "./UnsupportedMessage";

export function isTemplateContentType(
  message: any
): message is TemplateContentType {
  return typeof message !== undefined && typeof message?.content === "string";
}

export default function MessageContent(props: {
  message: string | TemplateContentType;
  className?: string;
  contentClassName?: string;
  sender?: SenderType;
  children?: JSX.Element;
}) {
  const { message, className, contentClassName, children } = props;
  const renderLink = ({
    attributes,
    content,
  }: {
    attributes: {
      [attr: string]: any;
    };
    content: string;
  }) => {
    const { href, ...props } = attributes;
    return (
      <a className={className} href={href} key={href} target="_blank">
        {content}
      </a>
    );
  };
  const contentTransformed = htmlEntities(
    !isTemplateContentType(message) ? message : message.content
  ).replace(/\n$/, "");
  return (
    <Linkify options={{ render: renderLink }}>
      <div
        className={`message-content-transformed ${contentClassName ?? ""} ${
          styles.messageContentTransform
        }`}
      >
        {isTemplateContentType(message) && (
          <MessageHeader sender={props.sender} header={message.header} />
        )}
        {children ? children : contentTransformed}
        {isTemplateContentType(message) && (
          <MessageFooter footer={message.footer} />
        )}
      </div>
    </Linkify>
  );
}

function MessageFooter(props: { footer?: string }) {
  const { footer } = props;
  if (!footer) {
    return null;
  }
  return <div className={styles.footer}>{footer}</div>;
}

function MessageHeader(props: {
  header?: TemplateContentHeaderType;
  sender?: SenderType;
}) {
  const { header, sender } = props;
  if (!header) {
    return null;
  }
  function messageConversion() {
    if (!header) {
      return undefined;
    }
    const { format, content, filename } = header;
    switch (format) {
      case "IMAGE":
        const uploadFile: UploadedFileType = {
          fileId: content,
          filename: "",
          messageTopic: "",
          previewUrl: content,
          channel: "whatsapp360dialog",
          id: 0,
          sender: sender!,
          url: content,
          mimeType: "",
          blobContainer: "",
        };
        return <ImageFile uploadFile={uploadFile} />;
      case "DOCUMENT":
      case "VIDEO":
        return (
          <a target="_blank" rel="noopener noreferrer" href={content}>
            <Label className="file">
              <Icon name="file outline" />
              {filename && filename.length > 33
                ? filename?.substring(0, 32) + "..."
                : filename || ""}
            </Label>
          </a>
        );
      case "TEXT":
        return <div>{content}</div>;
    }
  }
  return (
    <div className={`${styles.header} ${header.format.toLowerCase()}`}>
      {messageConversion()}
    </div>
  );
}
