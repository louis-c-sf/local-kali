import React, { useState } from "react";
import styles from "./UploadImageInput.module.css";
import useFilePreview from "lib/effects/useFilePreview";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { Button } from "component/shared/Button/Button";
import { FieldError } from "component/shared/form/FieldError";
import { AddFromUrlModal } from "./AddFromUrlModal";
import { useDisableControls } from "core/components/DisableControls/DisableControls";
import { Loader, Dimmer } from "semantic-ui-react";
import { Icon } from "component/shared/Icon/Icon";
import { ImagePlaceholder } from "features/Ecommerce/components/ImagePlaceholder/ImagePlaceholder";

export function UploadImageInput(props: {
  src?: string;
  onUpload: (file: File) => void;
  onError: () => void;
  error: string | undefined;
  uploaded: File | null;
  onAddFromUrl: (url: string) => Promise<void>;
  uploading: boolean;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const disableControls = useDisableControls();

  const dropzone = useDropzone({
    disabled: disableControls.disabled,
    accept: "image/*",
    onDropAccepted(files) {
      const file = files[0];
      if (file) {
        props.onUpload(file);
      }
    },
    onDropRejected() {
      props.onError();
    },
    noClick: false,
  });
  const preview = useFilePreview(props.uploaded ?? undefined);
  const previewUrl = preview.src ?? props.src;

  const cancelAddFromUrl = () => {
    setShowAddUrlModal(false);
  };

  return (
    <>
      <div>
        <div
          className={`
          ${styles.frame} 
          ${previewUrl || preview.src ? "" : styles.empty}
          ${dropzone.isDragActive ? styles.hovered : ""}
        `}
          {...dropzone.getRootProps()}
        >
          {(props.uploading || preview.loading) && (
            <Dimmer active inverted>
              <Loader active />
            </Dimmer>
          )}
          <input type="file" {...dropzone.getInputProps()} />
          {previewUrl ? (
            <>
              <img src={previewUrl} className={styles.image} />
              <span
                className={styles.close}
                onClick={(event) => {
                  event.stopPropagation();
                  props.onDelete();
                }}
              >
                <Icon type={"cross"} colored />
              </span>
            </>
          ) : (
            <ImagePlaceholder size={"normal"} />
          )}
        </div>
        <Button
          primary
          fluid
          className={styles.button}
          content={t("settings.commerce.addProduct.button.uploadImage")}
          disabled={disableControls.disabled}
          onClick={() => {
            dropzone.open();
          }}
        />
        <Button
          fluid
          disabled={disableControls.disabled}
          className={styles.button}
          content={t("settings.commerce.addProduct.button.addFromURL")}
          onClick={() => setShowAddUrlModal(true)}
        />
        {props.error && <FieldError text={props.error} />}
      </div>
      {showAddUrlModal && (
        <AddFromUrlModal
          onCancel={cancelAddFromUrl}
          onExecute={(url) => {
            props.onAddFromUrl(url);
            setShowAddUrlModal(false);
          }}
        />
      )}
    </>
  );
}
