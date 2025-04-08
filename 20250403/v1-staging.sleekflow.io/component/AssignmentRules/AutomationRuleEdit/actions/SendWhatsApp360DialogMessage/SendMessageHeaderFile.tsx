import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Whatsapp360DialogFileUploadType } from "../../../../../App/reducers/Chat/whatsappTemplatesReducer";
import {
  HeaderComponentType,
  HeaderFormatEnum,
} from "../../../../../types/WhatsappTemplateResponseType";
import styles from "./SendMessageHeaderFile.module.css";
import { UploadDocument } from "../../../../shared/upload/UploadDocument";
import {
  EditTemplateFileType,
  FileUploadedTypeEnum,
} from "../../../../Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { useFlashMessageChannel } from "../../../../BannerMessage/flashBannerMessage";
import { SendMediaUploadProxyType } from "../../../../../types/AutomationActionType";
import {
  DELETE_360DIALOG_TEMPLATE_FILE,
  POST_360DIALOG_TEMPLATE_FILE,
} from "../../../../../api/apiPath";
import { deleteMethod, postFiles } from "../../../../../api/apiRequest";
import { TFunction } from "i18next";
import { extractHeaderFileInfo } from "../../../../Broadcast/shared/BroadcastTemplateDisplay/UploadHeaderFile";
import { useWhatsappCloudApiUpload } from "features/WhatsappCloudAPI/usecases/Inbox/useWhatsappCloudApiUpload";
import { getHeaderFileFormatLimit, MEGABYTE } from "config/MessageConversion";

export function fileFormatMappingTranslation(t: TFunction, format: string) {
  const fileFormatMapping = {
    [HeaderFormatEnum.DOCUMENT]: {
      header: t("form.headerFile.format.document.short"),
      subHeader: t("form.headerFile.format.document.long"),
    },
    [HeaderFormatEnum.IMAGE]: {
      header: t("form.headerFile.format.image.short"),
      subHeader: t("form.headerFile.format.image.long"),
    },
    [HeaderFormatEnum.VIDEO]: {
      header: t("form.headerFile.format.video.short"),
      subHeader: t("form.headerFile.format.video.long"),
    },
  };
  return fileFormatMapping[format];
}

export default function UploadHeaderFile(props: {
  header: HeaderComponentType;
  uploadFileContent: (
    uploadedFile: Whatsapp360DialogFileUploadType | undefined
  ) => void;
  file?: Whatsapp360DialogFileUploadType;
  configId: number;
  channelType: string;
}) {
  const { configId, header, uploadFileContent, file, channelType } = props;
  const { t } = useTranslation();
  const [selectedFile, setSelectedFiles] = useState<EditTemplateFileType>();
  const flash = useFlashMessageChannel();
  const cloudApi = useWhatsappCloudApiUpload();
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
      uploadFileContent(undefined);
      setSelectedFiles(undefined);
    }
    try {
      if (channelType === "whatsappcloudapi") {
        await cloudApi.deleteFile(file.filedId!);
      } else {
        await deleteMethod(
          DELETE_360DIALOG_TEMPLATE_FILE.replace("{id}", configId + "").replace(
            "{fileId}",
            file.filedId!
          ),
          {
            param: {},
          }
        );
      }
      uploadFileContent(undefined);
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
        channelType,
        format.toUpperCase()
      ).sizeLimit;
      if (fileSizeLimit * MEGABYTE < file.file.size) {
        flash(
          t("flash.inbox.error.attach.fileMax", { size: `${fileSizeLimit}MB` })
        );
        return;
      }
      setSelectedFiles({
        ...file,
        isUploading: true,
      });
      let result: { id: string; filename: string; url: string } | undefined =
        undefined;
      if (channelType === "whatsappcloudapi") {
        result = await cloudApi.upload(file, format);
      } else {
        result = await postFiles(
          POST_360DIALOG_TEMPLATE_FILE.replace("{id}", configId + ""),
          [{ ...file, name: "file" }],
          {
            param: {
              whatsappMediaType: format,
              isTemplateFile: true,
              file: file.file,
            },
          }
        );
      }
      if (!result) {
        return;
      }
      setSelectedFiles({
        ...file,
        isUploading: false,
        filedId: result?.id,
      });
      if (format === "image") {
        uploadFileContent({
          type: format,
          image: {
            link: result.url,
            filename: result.filename,
          },
        });
      } else if (format === "video") {
        uploadFileContent({
          type: format,
          video: {
            link: result.url,
          },
        });
      } else {
        uploadFileContent({
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

  return (
    <UploadDocument
      setFiles={(updatedFiles) => submitFile(updatedFiles)}
      files={selectedFile ? [selectedFile as SendMediaUploadProxyType] : []}
      deleteFile={(tmpFile) => deleteFile(tmpFile as EditTemplateFileType)}
      labelElem={
        <>
          <div className={styles.header}>
            {t("automation.action.sendMessage.field.headerFile.header", {
              type: fileFormatMappingTranslation(t, header.format.toUpperCase())
                .header,
            })}
          </div>
          <div>
            {t("automation.action.sendMessage.field.headerFile.subHeader", {
              type: fileFormatMappingTranslation(t, header.format.toUpperCase())
                .subHeader,
            })}
          </div>
        </>
      }
      className={`${header?.format.toLowerCase()} ${styles.headerFile}`}
      mimeTypes={
        getHeaderFileFormatLimit(channelType, header.format.toUpperCase())
          .mimeType
      }
      uploadType={
        fileFormatMappingTranslation(t, header.format.toUpperCase()).header
      }
      disabled={false}
    />
  );
}
