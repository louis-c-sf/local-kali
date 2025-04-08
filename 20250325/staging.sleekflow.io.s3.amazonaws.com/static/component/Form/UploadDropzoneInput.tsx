import { Dimmer, Header } from "semantic-ui-react";
import uploadSplashImg from "../../assets/images/upload-arrow-icon.svg";
import React, { ReactNode } from "react";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { useTranslation } from "react-i18next";

export const UploadDropzoneInput = (props: {
  getRootProps(props?: DropzoneRootProps): DropzoneRootProps;
  getInputProps(props?: DropzoneInputProps): DropzoneInputProps;
  isDragActive: boolean;
  mimeTypes: string;
  children: ReactNode;
  isEmpty: boolean;
  disabled?: boolean;
  hasIcon?: boolean;
}) => {
  const {
    getInputProps,
    mimeTypes,
    isDragActive,
    getRootProps,
    isEmpty,
    children,
    disabled,
    hasIcon = true,
  } = props;
  const { t } = useTranslation();
  const rootProps = disabled ? {} : getRootProps();

  return (
    <Dimmer.Dimmable
      dimmed={isDragActive}
      className={`
       upload-dropzone-input
       upload-dropzone-input__wrap
        ${isEmpty ? "upload-dropzone-input__wrap_empty" : ""}
     `}
    >
      <div
        {...rootProps}
        className={`
        splash step-upload
        upload-dropzone-input__body
        ${isEmpty ? "empty" : ""}
        `}
      >
        {hasIcon && (
          <img
            src={uploadSplashImg}
            alt=""
            width={32}
            className={`
            upload-dropzone-input__icon
            ${isEmpty ? "" : "upload-dropzone-input__icon_hidden"}
            `}
          />
        )}
        <div
          className={`
          ${
            isEmpty
              ? "upload-dropzone-input__description"
              : "upload-dropzone-input__contents"
          }
        `}
        >
          {children}
        </div>
        {!disabled && <input {...getInputProps()} accept={mimeTypes} />}
        <Dimmer inverted active={isDragActive && !disabled}>
          <Header size={"small"}>{t("form.field.dropzone.landing")}</Header>
        </Dimmer>
      </div>
    </Dimmer.Dimmable>
  );
};
