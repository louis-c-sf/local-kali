import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "semantic-ui-react";
import { Whatsapp360DialogFileUploadType } from "../../../../App/reducers/Chat/whatsappTemplatesReducer";
import { SendMediaUploadProxyType } from "../../../../types/AutomationActionType";
import {
  Whatsapp360DialogTemplateMessageComponentDocumentParameterType,
  Whatsapp360DialogTemplateMessageComponentImageParameterType,
  Whatsapp360DialogTemplateMessageComponentVideoParameterType,
} from "../../../../types/MessageType";
import {
  HeaderComponentType,
  HeaderFormatEnum,
} from "../../../../types/WhatsappTemplateResponseType";
import { fileFormatMappingTranslation } from "../../../AssignmentRules/AutomationRuleEdit/actions/SendWhatsApp360DialogMessage/SendMessageHeaderFile";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import {
  EditTemplateFileType,
  FileUploadedTypeEnum,
} from "../../../Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { UploadDocument } from "../../../shared/upload/UploadDocument";
import { useBroadcastLocales } from "../../localizable/useBroadcastLocales";
import styles from "./BroadcastTemplateDisplay.module.css";
import { useDisableControls } from "../../../../core/components/DisableControls/DisableControls";
import { useWhatsappCloudApiUpload } from "features/WhatsappCloudAPI/usecases/Inbox/useWhatsappCloudApiUpload";
import { useWhatsapp360Upload } from "features/Whatsapp360/usecases/Inbox/useWhatsapp360Upload";
import BroadcastContext from "../../BroadcastContext";
import { getHeaderFileFormatLimit, MEGABYTE } from "config/MessageConversion";

export function extractHeaderFileInfo(
  header: HeaderComponentType,
  file: Whatsapp360DialogFileUploadType
) {
  let link = "";
  let id = "";
  let fileName = "";
  switch (header.format) {
    case HeaderFormatEnum.DOCUMENT:
      const document = (
        file as Whatsapp360DialogTemplateMessageComponentDocumentParameterType
      ).document;
      id = document.id ?? "";
      link = document.link;
      fileName = document.filename;
      break;
    case HeaderFormatEnum.IMAGE:
      const image = (
        file as Whatsapp360DialogTemplateMessageComponentImageParameterType
      ).image;
      link = image.link;
      id = image.id ?? "";
      // fileName = "";
      // fileName = image.filename;
      break;
    case HeaderFormatEnum.VIDEO:
      const video = (
        file as Whatsapp360DialogTemplateMessageComponentVideoParameterType
      ).video;
      link = video.link;
      id = video.id ?? "";
      break;
  }
  return {
    link,
    id,
    fileName,
  };
}

export default function UploadHeaderFile(props: {
  selectedChannel: string;
  header: HeaderComponentType;
  upploadFileContent: (
    uploadedFile: Whatsapp360DialogFileUploadType | undefined
  ) => void;
  configId: string;
  file?: Whatsapp360DialogFileUploadType;
  error?: string;
  selectedChannelIndex: number;
}) {
  const { header, upploadFileContent, configId, file, selectedChannelIndex } =
    props;
  const { disabled } = useDisableControls();
  const [selectedFile, setSelectedFiles] = useState<EditTemplateFileType>();
  const flash = useFlashMessageChannel();
  const cloudApiUpload = useWhatsappCloudApiUpload();
  const whatsapp360Upload = useWhatsapp360Upload(configId);
  const { channelsWithIds } = useContext(BroadcastContext);
  const channel = channelsWithIds?.[selectedChannelIndex].channel;
  useEffect(() => {
    if (!file || selectedFile) {
      return;
    }
    const { id, fileName, link } = extractHeaderFileInfo(header, file);
    setSelectedFiles({
      file: undefined,
      isUploading: false,
      isDeleting: false,
      id: id,
      filedId: id,
      error: "",
      fileName: fileName,
      fileUrl: link,
    });
  }, [file, selectedFile, header.format]);

  async function deleteFile(file: EditTemplateFileType) {
    if (!file.filedId) {
      upploadFileContent(undefined);
      setSelectedFiles(undefined);
      return;
    }
    try {
      const fileId =
        file.filedId ?? file?.fileUrl?.replace("https://", "").split("/")?.[3];
      if (channel === "whatsapp360dialog") {
        await whatsapp360Upload.deleteFile(fileId);
      } else if (channel === "whatsappcloudapi") {
        await cloudApiUpload.deleteFile(fileId);
      } else {
        throw "Unsupported channel";
      }
      upploadFileContent(undefined);
      setSelectedFiles(undefined);
    } catch (e) {
      console.error(`deleteFile error ${e}`);
    }
  }

  async function submitFile(files: SendMediaUploadProxyType[]) {
    if (!header) {
      return;
    }
    try {
      const [file] = files;
      const format = header.format.toLowerCase() as FileUploadedTypeEnum;
      const fileSizeLimit = getHeaderFileFormatLimit(
        channel,
        format.toUpperCase()
      ).sizeLimit;
      if (fileSizeLimit * MEGABYTE < file.file.size) {
        flash(
          t("flash.inbox.error.attach.fileMax", {
            size: `${fileSizeLimit}MB`,
          })
        );
        return;
      }
      setSelectedFiles({
        ...file,
        isUploading: true,
      });
      let result: { url: string; filename: string; id: string } | undefined =
        undefined;
      if (channel === "whatsappcloudapi") {
        result = await cloudApiUpload.upload(file, format);
      } else if (channel === "whatsapp360dialog") {
        result = await whatsapp360Upload.upload(file, format);
      }
      if (!result) {
        return;
      }
      setSelectedFiles({
        ...file,
        isUploading: false,
        filedId: result.id,
      });
      if (format === "image") {
        upploadFileContent({
          type: format,
          image: {
            link: result.url,
            filename: result.filename,
          },
        });
      } else if (format === "video") {
        upploadFileContent({
          type: format,
          video: {
            link: result.url,
          },
        });
      } else {
        upploadFileContent({
          type: format,
          document: {
            link: result.url,
            filename: result.filename,
          },
        });
      }
    } catch (e) {
      console.error("submitFile", e);
    }
  }

  const { t } = useTranslation();
  const typeMapping = {
    image: t("broadcast.edit.template.content.headerType.image"),
    video: t("broadcast.edit.template.content.headerType.video"),
    document: t("broadcast.edit.template.content.headerType.document"),
  };
  const { validateFormMessage } = useBroadcastLocales();
  return (
    <UploadDocument
      setFiles={(updatedFiles) => submitFile(updatedFiles)}
      files={selectedFile ? [selectedFile as SendMediaUploadProxyType] : []}
      deleteFile={(tmpFile) => deleteFile(tmpFile as EditTemplateFileType)}
      labelElem={
        <>
          <div className={styles.label}>
            {t("broadcast.edit.template.content.header.text")}
          </div>
          <Dropdown
            disabled
            selection
            className={styles.dropdown}
            text={typeMapping[header.format.toLowerCase()]}
            value={header.format.toLowerCase()}
          />
        </>
      }
      className={`${header?.format.toLowerCase()} ${styles.headerFile}`}
      error={validateFormMessage[props.error ?? ""]}
      mimeTypes={
        getHeaderFileFormatLimit(channel, header.format.toUpperCase()).mimeType
      }
      uploadType={fileFormatMappingTranslation(t, header.format).header}
      disabled={disabled}
    />
  );
}
