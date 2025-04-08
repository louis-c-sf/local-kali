import React, { useState } from "react";
import {
  UploadedBroadcastFileType,
  UploadedQuickReplyFileType,
} from "../../types/UploadedFileType";
import { UploadImageView } from "../shared/upload/UploadImageView";
import { useBroadcastImagePreview } from "./useBroadcastImagePreview";
import { useDisableControls } from "../../core/components/DisableControls/DisableControls";

export default BroadcastImageDisplay;

function BroadcastImageDisplay(props: {
  file: UploadedBroadcastFileType | UploadedQuickReplyFileType;
  isUpdatingParentRecord: boolean;
  submitDelete: () => Promise<void>;
  disabled?: boolean;
}) {
  const { file, isUpdatingParentRecord, submitDelete } = props;
  const { disabled } = useDisableControls();
  const [deletePending, setDeletePending] = useState(false);

  const { fileProxy, imgSrc, fileName } = useBroadcastImagePreview({
    file,
  });

  const deleteImage = async () => {
    setDeletePending(true);
    try {
      await submitDelete();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletePending(false);
    }
  };

  const uploadPending = isUpdatingParentRecord && fileProxy !== undefined;
  if (!imgSrc) {
    return null;
  }
  return (
    <UploadImageView
      fileName={fileName}
      deletePending={deletePending}
      uploadPending={uploadPending}
      onDelete={deleteImage}
      previewSrc={imgSrc}
      disabled={disabled || props.disabled}
    />
  );
}
