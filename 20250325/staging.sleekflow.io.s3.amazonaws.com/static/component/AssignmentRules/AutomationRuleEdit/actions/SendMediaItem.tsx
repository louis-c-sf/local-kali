import React, { useEffect, useState } from "react";
import useFilePreview from "../../../../lib/effects/useFilePreview";
import { UploadImageView } from "../../../shared/upload/UploadImageView";
import {
  isSendMediaUpload,
  isSendMediaUploadProxy,
  SendMediaUploadable,
  isDMMediaUpload,
} from "../../../../types/AutomationActionType";
import { getUploadedAttachment } from "../../../../api/Broadcast/getUploadedAttachment";

const SendMediaItem = (props: {
  upload: SendMediaUploadable;
  deleteFile: (file: SendMediaUploadable) => void;
  disabled?: boolean;
}) => {
  const { upload, deleteFile, disabled = false } = props;
  const filename = upload.fileName ?? "";
  const sendMediaFile = isSendMediaUploadProxy(upload)
    ? upload.file
    : undefined;
  const baseName = filename.substring(filename.lastIndexOf("/") + 1);
  const preview = useFilePreview(sendMediaFile);
  const [attachmentSrc, setAttachmentSrc] = useState("");
  useEffect(() => {
    if ((isSendMediaUpload(upload) || isDMMediaUpload(upload)) && upload.uuid) {
      if (
        upload.mimeType!.includes("image") ||
        upload.mimeType!.includes("audio")
      ) {
        let type = isDMMediaUpload(upload) ? "fbigautoreply" : "automation";
        getUploadedAttachment(upload.uuid, type, baseName).then((res) => {
          setAttachmentSrc(res);
        });
      } else {
        setAttachmentSrc(
          `/attachment/file/automation/${upload.uuid}/${baseName}`
        );
      }
    }
  }, [(isSendMediaUpload(upload) || isDMMediaUpload(upload)) && upload.uuid]);

  const previewSrc =
    (isSendMediaUpload(upload) || isDMMediaUpload(upload)) && upload.uuid
      ? attachmentSrc
      : preview.src ?? upload.fileUrl ?? "";
  const isProxyImage = sendMediaFile?.type.includes("image");
  const isImage = isProxyImage || upload?.mimeType?.includes("image");

  return (
    <UploadImageView
      large
      onDelete={async () => {
        deleteFile(upload);
      }}
      deletePending={upload.isDeleting}
      uploadPending={upload.isUploading}
      fileName={
        (isProxyImage
          ? ""
          : ((sendMediaFile?.name ?? upload?.fileName) || previewSrc) ?? "") ??
        ""
      }
      previewSrc={isImage ? previewSrc || preview.src : undefined}
      disabled={disabled}
    />
  );
};
export default SendMediaItem;
