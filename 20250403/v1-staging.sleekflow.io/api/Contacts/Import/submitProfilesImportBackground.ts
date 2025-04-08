import { postFiles } from "../../apiRequest";
import { isString, isNumber } from "lodash-es";
import { ColumnMapping } from "../../../container/Contact/Import/contracts";

export async function submitProfilesImportBackground(
  file: File,
  list: unknown,
  mapping: ColumnMapping[],
  triggerAutomation: boolean
) {
  const param: any = {
    columnsMap: JSON.stringify(mapping),
    IsTriggerAutomation: triggerAutomation,
  };
  if (isString(list)) {
    param.ImportName = list;

    return await postFiles(
      "/UserProfile/Import/Spreadsheet/background",
      [
        {
          name: "files",
          file: file,
        },
      ],
      {
        param,
      }
    );
  } else if (isNumber(list)) {
    param.ListId = list;
    return await postFiles(
      "/userprofile/import-into-list/spreadsheet/background",
      [
        {
          name: "files",
          file: file,
        },
      ],
      {
        param,
      }
    );
  } else {
    throw `Invalid list param: ${JSON.stringify(list)}`;
  }
}
