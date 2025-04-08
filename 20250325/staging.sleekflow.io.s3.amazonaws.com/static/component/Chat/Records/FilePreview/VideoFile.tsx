import React from "react";
import UploadedFileType from "../../../../types/UploadedFileType";
import FilePreviewModal from "./FilePreviewModal";
import styles from "./VideoFile.module.css";

export default function VideoFile(props: {
  uploadFile: UploadedFileType;
  messageId?: number;
}) {
  const { uploadFile, messageId } = props;

  return (
    <FilePreviewModal
      uploadFile={uploadFile}
      messageId={messageId}
      triggerComponent={(src) => (
        <>
          <video preload="metadata" src={src} />
          <div className={styles.triggerCover} />
        </>
      )}
      contentComponent={(src) => (
        <video controls preload="metadata" src={src} />
      )}
      proxyComponent={(src) => <video src={src} preload="metadata" />}
    />
  );
}
