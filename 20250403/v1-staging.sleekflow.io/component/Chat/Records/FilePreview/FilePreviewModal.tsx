import { postWithExceptions } from "../../../../api/apiRequest";
import { Dimmer, Loader, Modal } from "semantic-ui-react";
import React, { ReactNode, useEffect, useState } from "react";
import { POST_FORWARD_MESSAGE } from "../../../../api/apiPath";
import UploadedFileType, {
  isUploadedProxy,
  UploadedFileProxyType,
} from "../../../../types/UploadedFileType";
import useFilePreview from "../../../../lib/effects/useFilePreview";
import CloseIcon from "../../../../assets/images/cross-white.svg";
import ForwardIcon from "../../../../assets/images/forward-white.svg";
import { useTranslation } from "react-i18next";
import WarningIcon from "../../../../assets/images/warning-outline.svg";
import DownloadIcon from "../../../../assets/images/download-white.svg";
import { baseName } from "../../../../utility/baseName";
import styles from "./FilePreviewModal.module.css";
import { ForwardDialog } from "../../Messenger/PickedMessageActions/ForwardDialog";
import { getUploadedAttachment } from "../../../../api/Broadcast/getUploadedAttachment";
import { getDownloadLink } from "../DefaultFile";

export default function FilePreview(props: {
  uploadFile: UploadedFileType;
  messageId?: number;
  triggerComponent: (src: string) => any;
  contentComponent: (src: string) => any;
  proxyComponent: (src: string) => any;
}) {
  const {
    uploadFile,
    messageId,
    triggerComponent,
    contentComponent,
    proxyComponent,
  } = props;
  const { filename, fileId, previewUrl, channel } = uploadFile;
  const basename = baseName(filename).replace(/\#/gi, "");
  const [open, isOpen] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [fileSrc, setFileSrc] = useState("");
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardLoading, setForwardLoading] = useState(false);
  const is360DialogChannel = channel === "whatsapp360dialog";
  const { t } = useTranslation();

  useEffect(() => {
    if (!fileId) {
      return;
    }
    if (is360DialogChannel && previewUrl) {
      setFileSrc(previewUrl);
    } else {
      getUploadedAttachment(fileId, "message", basename)
        .then((res) => {
          if (!res) {
            setIsFailed(true);
          } else {
            setIsFailed(false);
            setFileSrc(res);
          }
        })
        .catch((e) => {
          setIsFailed(true);
          console.error(`getUploadedAttachment error ${e}`);
        });
    }
  }, [fileId]);

  if (isUploadedProxy(props.uploadFile)) {
    return (
      <ProxyFile
        uploadFile={props.uploadFile}
        proxyComponent={proxyComponent}
      />
    );
  }

  if (isFailed) {
    return (
      <div className={styles.loadFailed}>
        <img className={styles.warningIcon} src={WarningIcon} />
        {t("chat.file.error.loadingError")}
      </div>
    );
  }

  const handleForwardSubmit = async (
    chatIds: string[],
    messageIds: number[]
  ) => {
    setForwardLoading(true);
    try {
      await postWithExceptions(POST_FORWARD_MESSAGE, {
        param: {
          ConversationIds: chatIds,
          MessageIds: messageIds,
        },
      });
      setShowForwardDialog(false);
    } catch (e) {
      console.error("handleForwardSubmit", e);
    } finally {
      setForwardLoading(false);
    }
  };

  const src = previewUrl ?? fileSrc;
  const downloadUrl =
    is360DialogChannel && previewUrl
      ? previewUrl.replace("mode=redirect", "")
      : getDownloadLink(fileId, basename);

  return (
    <>
      <Modal
        open={open}
        onClose={() => isOpen(false)}
        closeOnDimmerClick
        className={styles.preview}
        trigger={
          <Dimmer.Dimmable className={`${src ? "" : "loading"}`} dimmed={!src}>
            <div className={styles.trigger} onClick={() => isOpen(true)}>
              {triggerComponent(src)}
            </div>
            <Dimmer active={!src} inverted>
              <Loader active inverted />
            </Dimmer>
          </Dimmer.Dimmable>
        }
      >
        <Modal.Content>
          <div className={styles.content}>{contentComponent(src)}</div>
          <div className={styles.sideBar}>
            <img
              className={styles.icon}
              src={CloseIcon}
              onClick={() => isOpen(false)}
            />
            <a target="_blank" rel="noopener noreferrer" href={downloadUrl}>
              <img
                className={styles.icon}
                src={DownloadIcon}
                onClick={() => isOpen(false)}
              />
            </a>
            {messageId && (
              <img
                className={styles.icon}
                src={ForwardIcon}
                onClick={() => setShowForwardDialog(true)}
              />
            )}
          </div>
        </Modal.Content>
      </Modal>
      {showForwardDialog && (
        <ForwardDialog
          loading={forwardLoading}
          messageIds={messageId ? [messageId] : []}
          onSubmit={handleForwardSubmit}
          onCancel={() => setShowForwardDialog(false)}
        />
      )}
    </>
  );
}

const ProxyFile = (props: {
  uploadFile: UploadedFileProxyType;
  proxyComponent: (src: string) => ReactNode;
}) => {
  const { uploadFile, proxyComponent } = props;
  const preview = useFilePreview(uploadFile.proxyFile);

  return (
    <Modal
      className={styles.preview}
      closeOnDocumentClick
      trigger={
        <Dimmer.Dimmable dimmed={false}>
          <div className={styles.trigger}>
            {preview.src && proxyComponent(preview.src)}
          </div>
        </Dimmer.Dimmable>
      }
    >
      <Modal.Content>
        <div className={styles.content}>
          {preview.src && proxyComponent(preview.src)}
        </div>
      </Modal.Content>
    </Modal>
  );
};
