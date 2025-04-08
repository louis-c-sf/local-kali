import { useEffect, useState } from "react";
import useFilePreview from "../../lib/effects/useFilePreview";
import {
  UploadedBroadcastFileType,
  UploadedQuickReplyFileType,
  isUploadedBroadcastFileType,
} from "../../types/UploadedFileType";
import { fetchPreviewUrl } from "../../api/Broadcast/fetchPreviewUrl";
import { isImageMime } from "../../lib/utility/mime";

export function useBroadcastImagePreview(props: {
  file: UploadedBroadcastFileType | UploadedQuickReplyFileType;
}) {
  const { file } = props;
  const [imgSrc, setImgSrc] = useState<string>();

  let filePreview: File | undefined;
  let fileType: string | undefined = file.mimeType;
  const fileProxy = file.fileProxy;
  const fileName = !fileType?.includes("image")
    ? fileProxy?.name || file.filename
    : "";

  if (isUploadedBroadcastFileType(file)) {
    filePreview = file.campaignUploadedFileId === "" ? fileProxy : undefined;
    fileType =
      file.campaignUploadedFileId === "" ? fileProxy?.type : file.mimeType;
  } else {
    filePreview = file.id === undefined ? fileProxy : undefined;
    fileType = file.id === undefined ? fileProxy?.type : file.mimeType;
  }

  const preview = useFilePreview(filePreview);

  useEffect(() => {
    if (file.id) {
      fetchPreviewUrl(file)
        .then((res) => {
          writeImageResult(res);
        })
        .catch((error) => {
          console.error(error);
          writeImageResult(preview.src ?? "");
        });
    } else {
      writeImageResult(preview.src ?? "");
    }
  }, [file.id, fileType, preview.src]);

  function writeImageResult(res: string) {
    if (isImageMime(fileType)) {
      setImgSrc(res);
    } else {
      setImgSrc(undefined);
    }
  }

  return {
    fileName,
    fileProxy,
    imgSrc,
  };
}
