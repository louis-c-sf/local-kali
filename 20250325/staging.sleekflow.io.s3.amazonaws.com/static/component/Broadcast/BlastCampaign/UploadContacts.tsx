import React, { useState } from "react";
import styles from "./UploadContacts.module.css";
import { UploadDropzoneInput } from "../../Form/UploadDropzoneInput";
import { useDropzone } from "react-dropzone";
import { Trans, useTranslation } from "react-i18next";
import { CloseButton } from "../../shared/CloseButton";
import completedSplashImg from "../../../assets/images/document-stack-outline.svg";
import { baseName } from "../../../utility/baseName";
import { downloadBlastCampaignContactSample } from "../../../api/Broadcast/Blast/downloadBlastCampaignContactSample";
import { FieldError } from "../../shared/form/FieldError";
import { useDisableControls } from "../../../core/components/DisableControls/DisableControls";

export function UploadContacts(props: {
  setValue: (value: null | File) => void;
  uploadedFile: File | null;
  errors: string[] | null;
  existedFile?: string;
  downloadContactsUrl?: string;
  uploadable: boolean;
}) {
  const {
    setValue,
    uploadedFile,
    existedFile,
    downloadContactsUrl,
    errors,
    uploadable,
  } = props;
  const [dragActive, setDragActive] = useState(false);
  const { t } = useTranslation();
  const { disabled } = useDisableControls();

  const { getInputProps, getRootProps, open } = useDropzone({
    accept: "text/csv",
    maxSize: 16 * 1024 * 1024,
    multiple: false,
    noClick: true,
    onDragEnter: () => {
      setDragActive(true);
    },
    onDragLeave: () => {
      setDragActive(false);
    },
    onDropAccepted: async (files) => {
      const [file] = files;
      if (file) {
        try {
          await setValue(file);
        } catch (e) {
          console.error(e);
        }
      }
    },
  });

  const isEmpty = uploadedFile === null && !existedFile;
  const fileName = baseName(existedFile ?? uploadedFile?.name ?? "");

  return (
    <div className={styles.root}>
      <div className={styles.label}>
        {t("broadcast.blast.field.recipients.label")}
      </div>
      {uploadable && (
        <>
          <div className={styles.hint}>
            {t("broadcast.blast.field.recipients.hint")}
          </div>
          <div className={styles.downloadSample}>
            <a
              onClick={() => {
                downloadBlastCampaignContactSample();
              }}
            >
              {t("broadcast.blast.field.recipients.download")}
            </a>
          </div>
        </>
      )}
      <UploadDropzoneInput
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={dragActive}
        mimeTypes={"text/csv"}
        isEmpty={true}
        hasIcon={false}
      >
        <div className={styles.content}>
          {isEmpty ? (
            <div className={styles.empty}>
              <Trans i18nKey={"form.field.dropzone.hint.contactsShort"}>
                Drag and drop or
                <a
                  onClick={open}
                  className={"upload-dropzone-input--action-link"}
                >
                  choose a file
                </a>
                to import contacts.
              </Trans>
              <div className={styles.fileLimit}>
                {t("broadcast.blast.form.upload.limit", { limitMb: 16 })}
              </div>
            </div>
          ) : (
            <div className={styles.uploaded}>
              {!disabled && (
                <div className={styles.close}>
                  {!existedFile && (
                    <CloseButton onClick={() => setValue(null)} />
                  )}
                </div>
              )}
              <img src={completedSplashImg} />
              <div className={styles.status}>
                {t("broadcast.blast.form.upload.uploaded", { file: fileName })}
              </div>
              {downloadContactsUrl && (
                <div className={styles.downloadContacts}>
                  <a href={downloadContactsUrl}>
                    {t("broadcast.grid.button.downloadRecipients")}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </UploadDropzoneInput>
      {errors?.length && <FieldError text={errors[0]} />}
    </div>
  );
}
