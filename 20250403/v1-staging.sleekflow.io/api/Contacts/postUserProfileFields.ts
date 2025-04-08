import { POST_UPDATE_ADD_CUSTOM_RPOFILE_FIELD } from "../apiPath";
import { postWithExceptions } from "../apiRequest";
import CompanyType, {
  CustomUserProfileFieldLingualsType,
} from "types/CompanyType";

interface UserProfileFieldOptionsRequestType {
  customUserProfileFieldOptionLinguals: CustomUserProfileFieldLingualsType[];
  value: string;
}

export interface ModifiedFieldRequestType {
  id?: string;
  isDeletable?: boolean;
  type: string;
  fieldName: string;
  customUserProfileFieldLinguals: CustomUserProfileFieldLingualsType[];
  customUserProfileFieldOptions?: UserProfileFieldOptionsRequestType[];
  isVisible: boolean;
  isEditable: boolean;
  order: number;
}

export default async function postUserProfileFields(
  editedFields: ModifiedFieldRequestType[]
): Promise<CompanyType> {
  return await postWithExceptions(POST_UPDATE_ADD_CUSTOM_RPOFILE_FIELD, {
    param: editedFields,
  });
}
