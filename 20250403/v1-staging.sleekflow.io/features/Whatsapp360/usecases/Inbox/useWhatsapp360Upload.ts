import { SendMediaUploadProxyType } from "types/AutomationActionType";
import { Whatsapp360DialogFileResponseType } from "types/MessageType";
import { postFiles, deleteMethod } from "api/apiRequest";
import {
  POST_360DIALOG_TEMPLATE_FILE,
  DELETE_360DIALOG_TEMPLATE_FILE,
} from "api/apiPath";
import { FileUploadedTypeEnum } from "component/Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { useAppSelector } from "AppRootContext";
import { useWhatsapp360Chat } from "features/Whatsapp360/usecases/Inbox/useWhatsapp360Chat";

export function useWhatsapp360Upload(configId?: string) {
  const profile = useAppSelector((s) => s.profile);
  const chat = useWhatsapp360Chat(profile);

  const upload = async (
    file: SendMediaUploadProxyType,
    format: FileUploadedTypeEnum,
    configId?: string
  ): Promise<Whatsapp360DialogFileResponseType> => {
    if (!chat.configId) {
      throw `Missing channel config`;
    }
    return await postFiles(
      POST_360DIALOG_TEMPLATE_FILE.replace(
        "{id}",
        `${configId ?? chat.configId}`
      ),
      [{ ...file, name: "undefined" }],
      {
        param: {
          whatsappMediaType: format,
          isTemplateFile: true,
          file: file.file,
        },
      }
    );
  };

  const deleteFile = async (fileId: string) => {
    try {
      await deleteMethod(
        DELETE_360DIALOG_TEMPLATE_FILE.replace(
          "{id}",
          `${configId ?? chat.configId}`
        ).replace("{fileId}", fileId!),
        {
          param: {},
        }
      );
    } catch (e) {
      console.error(`deleteFile error ${e}`);
    }
  };

  return {
    upload,
    deleteFile,
  };
}
