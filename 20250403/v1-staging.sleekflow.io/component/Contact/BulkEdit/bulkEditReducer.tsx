import produce from "immer";
import { CustomProfileField } from "../../../types/ContactType";
import { DropdownType } from "../../../config/ContactTypeFieldMapping";
import { mixed, string } from "yup";
import { HashTagCountedType } from "../../../types/ConversationType";
import { TAG_FIELD_MODES, FIELD_MODES } from "../BulkEdit";
import { propEq } from "ramda";

export interface BulkEditState {
  showModal: boolean;
  pending: boolean;
  valid: boolean;
  error?: string;
  field?: string;
  tags: HashTagCountedType[];
  value?: any;
  status?: string;
  assigneeIdList?: string[];
  editableFields: CustomProfileField[];
  fieldMode: "CUSTOM_FIELD" | typeof FIELD_MODES[number];
  isTriggerAutomation: boolean;
}

export type BulkEditAction =
  | { type: "SHOW_MODAL" }
  | { type: "HIDE_MODAL" }
  | { type: "SELECT_FIELD"; fieldId: string | typeof TAG_FIELD_MODES[number] }
  | { type: "SEND_FORM_START" }
  | { type: "SEND_FORM_END"; error: string | undefined }
  | { type: "SET_VALUE"; value: any }
  | { type: "SET_STATUS"; status: string }
  | { type: "SET_COLLABORATORS"; assigneeIdList: string[] }
  | { type: "TAGS_UPDATED"; tags: HashTagCountedType[] }
  | { type: "ERROR"; error: string }
  | { type: "FIELDS_FETCHED"; fields: CustomProfileField[] }
  | { type: "UPDATE_IS_TRIGGER_AUTOMATION"; value: boolean };
export const defaultState = (
  editFields: CustomProfileField[]
): BulkEditState => {
  return {
    showModal: false,
    pending: false,
    valid: false,
    error: undefined,
    field: undefined,
    value: undefined,
    status: undefined,
    assigneeIdList: [],
    editableFields: [...editFields],
    tags: [],
    fieldMode: "CUSTOM_FIELD",
    isTriggerAutomation: true,
  };
};

function validateField(field: CustomProfileField, value: any) {
  return fieldValidator(field).validateSync(value);
}

export function castField(field: CustomProfileField, value: any) {
  return fieldValidator(field).cast(value);
}

function fieldValidator(field: CustomProfileField) {
  const commonSchema = mixed();
  switch (field.type) {
    case "singlelinetext":
    case "multilinetext":
    case "phonenumber":
    case "email":
    case "number":
    case "datetime":
    case "channel":
    case "travisuser":
    case "date":
      commonSchema.concat(string().trim());
      break;
    case "boolean":
      commonSchema.concat(string().trim()).transform((value) => {
        return value && value.toString().toLowerCase() === "true"
          ? "true"
          : "false";
      });
  }
  return commonSchema;
}

export const bulkEditReducer = produce(
  (draft: BulkEditState, action: BulkEditAction) => {
    switch (action.type) {
      case "FIELDS_FETCHED":
        draft.editableFields = action.fields;
        break;

      case "SHOW_MODAL":
        draft.showModal = true;
        break;

      case "HIDE_MODAL":
        draft = Object.assign(draft, defaultState([...draft.editableFields]));
        draft.showModal = false;
        break;

      case "SELECT_FIELD":
        if (
          FIELD_MODES.includes(action.fieldId as typeof FIELD_MODES[number])
        ) {
          draft.fieldMode = action.fieldId as typeof FIELD_MODES[number];
          draft.field = undefined;
        } else {
          draft.fieldMode = "CUSTOM_FIELD";
          const fieldChosen = draft.editableFields.find(
            propEq("id", action.fieldId)
          );
          if (fieldChosen) {
            draft.field = action.fieldId;
            draft.value = defaultValue(fieldChosen);
          }
        }
        draft.valid = Boolean(draft.field);
        break;

      case "SET_VALUE":
        const fieldChosen = draft.editableFields.find(
          propEq("id", draft.field)
        );
        if (fieldChosen) {
          draft.valid = validateField(fieldChosen, action.value);
          draft.value = action.value ?? "";
        } else {
          draft.valid = false;
        }
        break;

      case "SEND_FORM_START":
        draft.pending = true;
        draft.error = undefined;
        break;

      case "SEND_FORM_END":
        draft.pending = false;
        draft.error = action.error;
        break;

      case "TAGS_UPDATED":
        draft.tags = action.tags;
        draft.valid = draft.tags.length > 0;
        break;

      case "SET_STATUS":
        draft.status = action.status;
        draft.valid = ["open", "pending", "closed"].includes(action.status);
        break;

      case "SET_COLLABORATORS":
        draft.assigneeIdList = action.assigneeIdList;
        draft.valid = draft.assigneeIdList.length > 0;
        break;

      case "ERROR":
        draft.error = action.error;
        break;

      case "UPDATE_IS_TRIGGER_AUTOMATION":
        draft.isTriggerAutomation = action.value;
        break;
    }
  }
);

function defaultValue(field: CustomProfileField): any {
  // todo show already assigned value when all selected items got the same value
  // const distinctValues: any[] =
  //   profiles
  //     .map(p => p.customFields.find(f => f.companyDefinedFieldId === field.id) as CustomFieldType)
  //     .filter(Boolean)
  //     .reduce<any[]>((found, fld) => {
  //       if (!found.includes(fld.value)) {
  //         found.push(fld.value);
  //       }
  //       return found;
  //     }, [])
  // ;
  // console.debug('distinctValues', { field, profiles, distinctValues });

  // if (distinctValues.length === 1) {
  //   return distinctValues[0].value;
  // }

  if (DropdownType.includes(field.type)) {
    return undefined;
  }

  switch (field.type) {
    case "boolean":
      return "true";

    case "number":
      return 0;

    case "singlelinetext":
    case "multilinetext":
    case "email":
      return "";
    case "date":
    case "datetime":
      return undefined;
  }

  return undefined;
}
