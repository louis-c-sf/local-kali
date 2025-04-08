import React from "react";
import { Icon, Label, Loader } from "semantic-ui-react";
import useFilePreview from "../../lib/effects/useFilePreview";
import { UploadedQuickReplyFileType } from "../../types/UploadedFileType";
import { baseName } from "../../utility/baseName";
import styles from "./AttachedFiles.module.css";

export const ATTACHABLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const truncateName = (name: string): string => {
  const basename = baseName(name);
  return basename.length < 16 ? basename : `${basename.substring(-16)}...`;
};

export default AttachedFiles;

function AttachedFiles(props: {
  files: Array<File>;
  quickAttachments: Array<UploadedQuickReplyFileType>;
  deleteFile: (file: File) => void;
  deleteQuickAttachment: (file: UploadedQuickReplyFileType) => void;
}) {
  let { deleteFile, deleteQuickAttachment, files, quickAttachments } = props;
  return (
    <div className={styles.root}>
      {quickAttachments.map((att) => {
        if (ATTACHABLE_IMAGE_TYPES.includes(att.mimeType)) {
          return (
            <ImageQuickAttach
              file={att}
              key={`att${att.quickReplyFileId}`}
              delete={() => deleteQuickAttachment(att)}
            />
          );
        } else {
          return (
            <CommonFile
              filename={att.filename}
              key={`att${att.quickReplyFileId}`}
              delete={() => deleteQuickAttachment(att)}
            />
          );
        }
      })}
      {files.map((file, key) => {
        if (ATTACHABLE_IMAGE_TYPES.includes(file.type)) {
          return (
            <ImageFile
              file={file}
              key={`file${key}`}
              delete={() => deleteFile(file)}
            />
          );
        } else {
          return (
            <CommonFile
              filename={file.name}
              key={`file${key}`}
              delete={() => deleteFile(file)}
            />
          );
        }
      })}
    </div>
  );
}

function ImageAttachView(props: {
  src?: string;
  name: string;
  onDelete: () => void;
}) {
  return (
    <Label className={"file file-image"} as={"span"} size={"small"}>
      {props.src ? (
        <span className="img-wrap">
          <img
            alt={truncateName(props.name)}
            src={props.src}
            className={"ui image"}
          />
        </span>
      ) : (
        <Loader size={"tiny"} active />
      )}

      <Icon name={"close"} onClick={props.onDelete} className={styles.close} />
    </Label>
  );
}

function ImageFile(props: { file: File; delete: () => void }) {
  const { file } = props;
  const preview = useFilePreview(file);

  return (
    <ImageAttachView
      src={preview.src}
      name={file.name}
      onDelete={props.delete}
    />
  );
}

function ImageQuickAttach(props: {
  file: UploadedQuickReplyFileType;
  delete: () => void;
}) {
  const { file } = props;
  let src = file.previewUrl ?? "";

  return (
    <ImageAttachView src={src} name={file.filename} onDelete={props.delete} />
  );
}

function CommonFile(props: { filename: string; delete: () => void }) {
  return (
    <Label as={"span"} size={"small"}>
      <Icon name={"file"} size={"big"} className={styles.fileIcon} />
      <span title={baseName(props.filename)}>
        {truncateName(props.filename)}
      </span>
      <Icon name={"close"} onClick={props.delete} />
    </Label>
  );
}
