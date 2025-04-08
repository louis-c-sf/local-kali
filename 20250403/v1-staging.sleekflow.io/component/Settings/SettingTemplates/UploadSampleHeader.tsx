import React, { useState } from "react";
import { UploadDropzoneInput } from "component/Form/UploadDropzoneInput";
import { useDropzone } from "react-dropzone";
import { Trans, useTranslation } from "react-i18next";
import styles from "./AddSampleContentModal.module.css";
import SendMediaItem from "component/AssignmentRules/AutomationRuleEdit/actions/SendMediaItem";
import {
  SendMediaUploadable,
  SendMediaUploadProxyType,
} from "types/AutomationActionType";
import useUploadSample from "api/CloudAPI/useUploadSample";
import { SampleHeaderHandleType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { FieldError } from "component/shared/form/FieldError";
const allowFileTypes = {
  IMAGE: ".jpg,.jpeg,.png",
  VIDEO: ".mp4",
  DOCUMENT: ".pdf",
};
const maxSizeMb = { IMAGE: 5, VIDEO: 16, DOCUMENT: 100 };

export default function UploadSampleHeader(props: {
  format: "IMAGE" | "VIDEO" | "DOCUMENT";
  wabaId: string;
  updateSample: (headerHandle: SampleHeaderHandleType) => void;
  clearSample: () => void;
  error?: string;
  setIsUploading: (isUploading: boolean) => void;
}) {
  const {
    format,
    wabaId,
    updateSample,
    clearSample,
    error = "",
    setIsUploading,
  } = props;
  const [headerSample, setHeaderSample] = useState<SendMediaUploadable[]>([]);
  const [fileError, setFileError] = useState<string>();
  const maxSizeByte = maxSizeMb[format] * 1024 * 1024;
  const { uploadSample } = useUploadSample(wabaId);
  const { t } = useTranslation();

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: allowFileTypes[format],
    noClick: true,
    multiple: false,
    maxSize: maxSizeByte,
    async onDropAccepted(files) {
      try {
        setIsUploading(true);
        const newProxies: SendMediaUploadProxyType[] = files.map((file) => {
          return {
            id: btoa(String(Math.random())),
            file: file,
            isUploading: true,
            isDeleting: false,
            fileName: file.name,
            error: null,
          };
        });
        setHeaderSample(newProxies);
        const headerHandle = await uploadSample(files);
        if (headerHandle) {
          updateSample(headerHandle);
          setHeaderSample(
            newProxies.map((proxy) => ({ ...proxy, isUploading: false }))
          );
        }
        setFileError("");
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    },
    onDropRejected(files) {
      files.map((file) => {
        if (file.size > maxSizeByte) {
          setFileError(
            t("automation.rule.error.uploadedFileOverSize", {
              maxSize: maxSizeMb[format],
            })
          );
        }
      });
    },
  });

  const uploadPlaceholderMap = {
    IMAGE: (
      <Trans i18nKey={"settings.template.form.sample.uploadImage"}>
        Drag and drop or
        <a onClick={open} className={"upload-dropzone-input--action-link"}>
          click here
        </a>
        to choose a JPG or PNG file to upload a sample image
      </Trans>
    ),
    VIDEO: (
      <Trans i18nKey={"settings.template.form.sample.uploadVideo"}>
        Drag and drop or
        <a onClick={open} className={"upload-dropzone-input--action-link"}>
          click here
        </a>
        to choose a MP4 file to upload a sample video
      </Trans>
    ),
    DOCUMENT: (
      <Trans i18nKey={"settings.template.form.sample.uploadDocument"}>
        Drag and drop or
        <a onClick={open} className={"upload-dropzone-input--action-link"}>
          click here
        </a>
        to choose a PDF file to upload a sample document
      </Trans>
    ),
  };

  const headerCopiesMap = {
    IMAGE: t("settings.template.headerType.image"),
    VIDEO: t("settings.template.headerType.video"),
    DOCUMENT: t("settings.template.headerType.document"),
  };

  return (
    <div className="upload-dropzone-images">
      <div className={styles.headerSampleTitle}>
        {t("settings.template.form.headerType.label")} {headerCopiesMap[format]}
      </div>
      <UploadDropzoneInput
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        mimeTypes={allowFileTypes[format]}
        isEmpty={headerSample.length === 0}
        hasIcon={false}
      >
        {headerSample.length === 0 ? (
          <p className={styles.headerSampleUploader}>
            {uploadPlaceholderMap[format]}
          </p>
        ) : (
          <div className={styles.headerUploadedSample}>
            {headerSample.map((upload, key) => (
              <SendMediaItem
                upload={upload}
                deleteFile={async (file) => {
                  setHeaderSample([]);
                  clearSample();
                }}
                key={key}
              />
            ))}
          </div>
        )}
      </UploadDropzoneInput>
      {(error || fileError) && (
        <div className={styles.headerSampleError}>
          <FieldError text={error || fileError} />
        </div>
      )}
    </div>
  );
}
