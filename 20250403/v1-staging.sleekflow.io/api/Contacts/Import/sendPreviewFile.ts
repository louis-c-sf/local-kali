import { ColumnMapping } from "container/Contact/Import/contracts";
import { PreviewType } from "types/Contact/Import/PreviewType";
import { postFiles } from "api/apiRequest";

export async function sendPreviewFile(
  file: File,
  mapping?: ColumnMapping[]
): Promise<PreviewType> {
  let param: any = {};
  if (mapping) {
    param.columnsMap = JSON.stringify(mapping);
  }
  return await postFiles(
    "/UserProfile/Import/Preview",
    [{ name: "files", file }],
    {
      param,
    }
  );
}
