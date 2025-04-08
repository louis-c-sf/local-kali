import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Divider, Dropdown, Form, Header, Image } from "semantic-ui-react";
import styles from "./BackupWhatsappChats.module.css";
import { UploadDropzoneInput } from "../../component/Form/UploadDropzoneInput";
import { UploadImageView } from "../../component/shared/upload/UploadImageView";
import { useDropzone } from "react-dropzone";
import useDefaultChannelSelection from "../../component/Chat/useDefaultChannelSelection";
import { POST_IMPORT_CHAT_HISTORY } from "../../api/apiPath";
import { postFiles } from "../../api/apiRequest";
import { ChannelDropdownOption } from "../../component/Chat/localizable/useTransformChannelsToDropdown";
import SelectedDropdownWithImage from "../../component/Chat/SelectedDropdownWithImage";
import PhoneNumber from "../../component/PhoneNumber";
import { aliasChannelName } from "../../component/Channel/selectors";
import { ChannelType } from "../../component/Chat/Messenger/types";
import settingStyles from "./Setting.module.css";
import { Whatsapp360DialogFileResponseType } from "../../types/MessageType";
import { Button } from "../../component/shared/Button/Button";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { htmlEscape } from "../../lib/utility/htmlEscape";
import { useRequireRBAC } from "component/shared/useRequireRBAC";
import { PERMISSION_KEY } from "types/Rbac/permission";

const ACCEPT_MIME_TYPE = "application/zip";

export default function ScheduleDemoSuccessContainer() {
  useRequireRBAC([PERMISSION_KEY.channelEdit]);

  const { t } = useTranslation();
  const { channels } = useDefaultChannelSelection();
  const [channel, setChannel] = useState<ChannelDropdownOption | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    onDropAccepted: (selectedFiles) => {
      setFiles(selectedFiles);
    },
  });

  const acceptedChannels = (channel: ChannelDropdownOption): boolean =>
    isAnyWhatsappChannel(channel.value);

  const handleSubmit = async () => {
    if (!channel || !phoneNumber || !files.length) return;
    try {
      const result: Whatsapp360DialogFileResponseType = await postFiles(
        POST_IMPORT_CHAT_HISTORY,
        [
          {
            name: "file",
            file: files[0],
          },
        ],
        {
          param: {
            PhoneNumber: phoneNumber,
            channelName:
              channel.value && aliasChannelName(channel.value as ChannelType),
            channelId: channel?.instanceId,
          },
        }
      );
      if (result) {
        setFiles([]);
        setPhoneNumber("");
      }
    } catch (e) {
      console.error("import error", e);
    }
  };

  const getChannelOpts = () => {
    return channels.filter(acceptedChannels).map((channel, i) => {
      const img = channel.img;
      const { instanceId, ...dropdownFields } = channel;
      return {
        ...dropdownFields,
        image: null,
        key: instanceId,
        value: channel.instanceId,
        content: (
          <div
            className={`text ${img ? "text_has-img" : "text_no-image"}`}
            key={i}
            title={htmlEscape(channel.text)}
          >
            {img && <Image src={img} alt={channel.text} />}
            <span className={"text-label"}>{channel.text}</span>
          </div>
        ),
      };
    });
  };

  return (
    <div className={settingStyles.content}>
      <div className={settingStyles.hideScrollableTable}>
        <div className={settingStyles.container}>
          <div className={`${settingStyles.header}`}>
            <Header as="h4" content={t("settings.backupWhatsappChat.header")} />
          </div>
          <Divider />
          <div className={styles.content}>
            <p>{t("settings.backupWhatsappChat.description")}</p>
            <Form as="div">
              <div className={styles.field}>
                <Form.Field>
                  <label>
                    {t("settings.backupWhatsappChat.form.channel.label")}
                  </label>
                  <Dropdown
                    selectOnBlur={false}
                    className={`channels-dropdown`}
                    scrolling
                    trigger={
                      channel && (
                        <SelectedDropdownWithImage
                          image={channel.img}
                          text={channel.text}
                          adaptive
                        />
                      )
                    }
                    onChange={(_, data) => {
                      const selectedChannel = channels.find(
                        (channel) => channel.instanceId === data.value
                      );
                      setChannel(selectedChannel);
                    }}
                    value={(channel?.instanceId as string) || undefined}
                    options={getChannelOpts()}
                  />
                </Form.Field>
              </div>
              <div className={styles.field}>
                <Form.Field>
                  <label>
                    {t("settings.backupWhatsappChat.form.phoneNumber.label")}
                  </label>
                  <PhoneNumber
                    existValue={phoneNumber}
                    onChange={(_, phone) => setPhoneNumber(phone)}
                    fieldName="phoneNumber"
                  />
                </Form.Field>
              </div>
              <div className={styles.field}>
                <Form.Field>
                  <label>
                    {t("settings.backupWhatsappChat.form.file.label")}
                  </label>
                  <p>
                    {t("settings.backupWhatsappChat.form.file.description")}
                  </p>
                  <UploadDropzoneInput
                    mimeTypes={ACCEPT_MIME_TYPE}
                    getInputProps={getInputProps}
                    getRootProps={getRootProps}
                    isDragActive={isDragActive}
                    isEmpty={files.length === 0}
                  >
                    {files.length === 0 ? (
                      <div>
                        <Trans i18nKey={"form.field.dropzone.hint.uploadZip"}>
                          You can drag and drop or
                          <a
                            onClick={(event) => {
                              event.preventDefault();
                              open();
                            }}
                            className="upload-dropzone-input__action-link"
                          >
                            choose a zip file
                          </a>
                          to upload.
                        </Trans>
                        <div className={styles.uploadDesc}>
                          {t("settings.backupWhatsappChat.form.file.notice")}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`upload-dropzone-images ${styles.selectedFilesBlock}`}
                      >
                        {files.map((file, i) => (
                          <UploadImageView
                            key={i}
                            onDelete={async () => {
                              setFiles(
                                files.filter((f) => f.name !== file.name)
                              );
                            }}
                            deletePending={false}
                            uploadPending={false}
                            previewSrc={undefined}
                            fileName={file.name}
                          />
                        ))}
                      </div>
                    )}
                  </UploadDropzoneInput>
                </Form.Field>
              </div>
              <div className={styles.documentLink}>
                <a
                  rel="noreferrer noopener"
                  href="https://docs.sleekflow.io/messaging-channels/360dialog-whatsapp/backup-whatsapp-chats-files"
                  target="_blank"
                >
                  {t("settings.backupWhatsappChat.document")}
                </a>
              </div>
              <Button
                primary
                size="small"
                disabled={!channel || !phoneNumber || files.length === 0}
                onClick={handleSubmit}
              >
                {t("settings.backupWhatsappChat.button.proceed")}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
