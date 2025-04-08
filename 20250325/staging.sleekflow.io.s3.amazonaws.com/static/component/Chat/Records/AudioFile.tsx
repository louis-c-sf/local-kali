import React, { useEffect, useState } from "react";
import UploadedFileType from "../../../types/UploadedFileType";
import { getUploadedAttachment } from "../../../api/Broadcast/getUploadedAttachment";

export default function AudioFile(props: { uploadFile: UploadedFileType }) {
  const [audioFile, setAudioFile] = useState("");
  const { fileId, filename } = props.uploadFile;
  const baseName = filename.substring(filename.lastIndexOf("/") + 1);
  useEffect(() => {
    if (fileId) {
      getUploadedAttachment(fileId, "message", baseName).then((res) => {
        setAudioFile(res);
      });
    }
  }, [fileId]);
  return (
    <audio controls preload="false">
      <source type={props.uploadFile.mimeType} src={audioFile} />
    </audio>
  );
}
