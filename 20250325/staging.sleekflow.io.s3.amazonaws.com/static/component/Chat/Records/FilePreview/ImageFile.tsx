import React from "react";
import UploadedFileType from "../../../../types/UploadedFileType";
import FilePreviewModal from "./FilePreviewModal";

export default function ImageFile(props: {
  uploadFile: UploadedFileType;
  messageId?: number;
}) {
  const { uploadFile, messageId } = props;
  return (
    <FilePreviewModal
      uploadFile={uploadFile}
      messageId={messageId}
      triggerComponent={(src) => <img src={src} alt="" />}
      contentComponent={(src) => <img src={src} alt="" />}
      proxyComponent={(src) => <img src={src} alt="" />}
    />
  );
}
