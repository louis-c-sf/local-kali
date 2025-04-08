import CompanyType from "../../../types/CompanyType";
import React from "react";
import { useDropzone } from "react-dropzone";
import useFilePreview from "../../../lib/effects/useFilePreview";
import { CopyField } from "../CopyField";
import { UploadDropzoneInput } from "../../Form/UploadDropzoneInput";
import { Icon, Label } from "semantic-ui-react";
import { WeChatFormInputType } from "../ChannelSelection";
import { Trans, useTranslation } from "react-i18next";

export function WeChatForm(props: {
  webhookUrl: string;
  company: CompanyType | undefined;
  errMsgList: {};
  formInput: WeChatFormInputType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  files: File[];
  setFiles: (files: File[]) => any;
  onUpload: (files: File[]) => any;
}) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles) => props.onUpload(acceptedFiles),
    multiple: false,
    noClick: true,
  });
  const qrCodePreview = useFilePreview(props.files[0]);
  const { t } = useTranslation();

  return (
    <div className={"channel-setup channel-setup_wechat"}>
      <CopyField
        text={props.webhookUrl}
        label={t("channels.form.wechat.field.webhookUrl.label")}
        long={false}
        masked
      />
      <CopyField
        text={props.company?.id.replace(/-/g, "")}
        label={t("channels.form.wechat.field.token.label")}
        long={false}
        masked
      />

      <label>
        {t("channels.form.wechat.field.name.label")}
        {props.errMsgList && props.errMsgList["name"] && (
          <div className="error">{props.errMsgList["name"]}</div>
        )}
      </label>
      <div className="ui input formInput lastInput">
        <input
          id={"name"}
          value={props.formInput["name"]}
          type="text"
          onChange={props.onChange}
        />
      </div>

      <label>
        {t("channels.form.wechat.field.appId.label")}
        {props.errMsgList && props.errMsgList["appId"] && (
          <div className="error">{props.errMsgList["appId"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="appId"
          value={props.formInput["appId"]}
          type="text"
          onChange={props.onChange}
        />
      </div>

      <label>
        {t("channels.form.wechat.field.appSecret.label")}
        {props.errMsgList && props.errMsgList["appSecret"] && (
          <div className="error">{props.errMsgList["appSecret"]}</div>
        )}
      </label>
      <div className="ui input formInput lastInput">
        <input
          id="appSecret"
          value={props.formInput["appSecret"]}
          type="text"
          onChange={props.onChange}
        />
      </div>

      <label>
        {t("channels.form.wechat.field.qrCode.label")}
        {props.errMsgList && props.errMsgList["qrCode"] && (
          <div className="error">{props.errMsgList["qrCode"]}</div>
        )}
      </label>
      <div className="ui input formInput lastInput">
        <UploadDropzoneInput
          mimeTypes={"image/png,image/jpeg"}
          getInputProps={getInputProps}
          getRootProps={getRootProps}
          isDragActive={isDragActive}
          isEmpty={props.files.length === 0}
        >
          {props.files.length === 0 && (
            <Trans
              i18nKey={"form.field.dropzone.hint.simple"}
              tOptions={{
                interpolation: { escapeValue: false },
              }}
            >
              Drag and drop or
              <a
                onClick={open}
                className={"upload-dropzone-input--action-link"}
              >
                choose a file.
              </a>
            </Trans>
          )}
          {props.files.map((file, index) => {
            return (
              <Label className={"file-name"} key={index}>
                {qrCodePreview.src && (
                  <span className={"file-preview"}>
                    <img src={qrCodePreview.src} alt="" />
                  </span>
                )}
                <span className="name-wrap">{file.name}</span>
                <Icon
                  name={"delete"}
                  onClick={() => {
                    props.setFiles(
                      props.files.filter(
                        (fileExisting) => fileExisting.name !== file.name
                      )
                    );
                  }}
                />
              </Label>
            );
          })}
        </UploadDropzoneInput>
      </div>
    </div>
  );
}
