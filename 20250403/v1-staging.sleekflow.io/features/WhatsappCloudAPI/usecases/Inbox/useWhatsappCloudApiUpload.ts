import { OptInContentType } from "features/Whatsapp360/models/OptInType";
import { SendMediaUploadProxyType } from "types/AutomationActionType";
import { FileUploadedTypeEnum } from "component/Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { submitUploadTemplateFile } from "api/CloudAPI/submitUploadTemplateFile";
import { submitDeleteTemplateFile } from "api/CloudAPI/submitDeleteTemplateFile";

export function useWhatsappCloudApiUpload(template?: OptInContentType) {
  async function upload(
    file: SendMediaUploadProxyType,
    format: FileUploadedTypeEnum,
    isTemplateFile?: boolean
  ): Promise<{ url: string; filename: string; id: string }> {
    const result = await submitUploadTemplateFile(
      file.file,
      file.fileName ?? file.file.name,
      format,
      isTemplateFile
    );
    return {
      filename: result.filename,
      id: result.id,
      url: result.url,
    };
  }

  const deleteFile = async function (id: string) {
    return await submitDeleteTemplateFile(id);
  };

  return {
    upload,
    deleteFile: deleteFile,
  };
}
