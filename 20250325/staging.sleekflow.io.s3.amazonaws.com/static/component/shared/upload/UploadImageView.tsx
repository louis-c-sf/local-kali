import React, { useEffect } from "react";
import { Button, Image, Loader, Placeholder } from "semantic-ui-react";
import { baseName } from "../../../utility/baseName";
import { useImagePlaceholder } from "../../../lib/effects/useImagePlaceholder";

export function UploadImageView(props: {
  fileName: string;
  deletePending: boolean;
  uploadPending: boolean;
  previewSrc?: string;
  disabled?: boolean;
  onDelete: () => Promise<void>;
  large?: boolean;
}) {
  let {
    deletePending,
    fileName,
    onDelete,
    previewSrc,
    uploadPending,
    disabled = false,
    large = false,
  } = props;
  const displayFileName = fileName
    ? baseName(fileName).replace(/[\\?].*/g, "")
    : "";

  const {
    loading: imageSrcLoading,
    failed,
    loaded: imageLoaded,
  } = useImagePlaceholder(previewSrc);

  useEffect(() => {
    if (imageSrcLoading) {
      return;
    }
    if (failed) {
      onDelete();
    }
  }, [failed, previewSrc, onDelete, imageSrcLoading]);

  return (
    <div
      className={`image-item ${displayFileName ? "file" : ""} ${
        large ? "large" : ""
      }`}
    >
      {deletePending ||
      uploadPending ||
      (previewSrc && imageSrcLoading && !failed) ? (
        <Loader active inline size={"small"} />
      ) : (
        !disabled && (
          <Button
            icon="times"
            className="delete-img"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          />
        )
      )}
      {previewSrc &&
        (imageLoaded && !failed ? (
          <Image src={previewSrc} />
        ) : (
          <Placeholder>
            <Placeholder.Image />
          </Placeholder>
        ))}
      {displayFileName && !previewSrc && (
        <span className="fileName">{displayFileName}</span>
      )}
    </div>
  );
}
