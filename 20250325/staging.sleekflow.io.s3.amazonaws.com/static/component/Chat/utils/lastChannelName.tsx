import { CustomFieldType } from "../../../types/LoginType";
import CompanyType from "../../../types/CompanyType";
import { ReadonlyDeep } from "Object/Readonly";

export default function lastChannelName(
  customFields?: Array<CustomFieldType>,
  company?: ReadonlyDeep<CompanyType>
): string {
  const foundLastChannel = company?.customUserProfileFields.find(
    (customUserProfileField) =>
      customUserProfileField.fieldName.toLowerCase() === "lastchannel"
  );
  if (foundLastChannel && customFields) {
    return (
      customFields.find(
        (customField) =>
          customField.companyDefinedFieldId === foundLastChannel.id
      )?.value || ""
    );
  }
  return "";
}
