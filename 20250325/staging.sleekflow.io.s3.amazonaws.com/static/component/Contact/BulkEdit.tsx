import React, { Reducer, useReducer, useRef } from "react";
import {
  Button,
  CheckboxProps,
  Dropdown,
  Icon,
  Message,
  Modal,
} from "semantic-ui-react";
import ProfileSearchType from "../../types/ProfileSearchType";
import ApplyValueField from "./BulkEdit/ApplyValueField";
import { post } from "../../api/apiRequest";
import { POST_USERPROFILE_CUSTOMFIELD_BACKGROUND } from "../../api/apiPath";
import { useSignalRGroup } from "../SignalR/useSignalRGroup";
import { useAppSelector } from "../../AppRootContext";
import { TaskResponseType } from "../Header/ProgressBar/types/TaskType";
import {
  BulkEditAction,
  bulkEditReducer,
  BulkEditState,
  castField,
  defaultState,
} from "./BulkEdit/bulkEditReducer";
import { HashTagCountedType } from "../../types/ConversationType";
import { propEq } from "ramda";
import { TagInput } from "../shared/input/TagInput";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { CustomProfileField } from "../../types/ContactType";
import { StaffType } from "../../types/StaffType";
import { TriggerAutomationCheckbox } from "./TriggerAutomationCheckbox";
import ApplyStatusField from "./BulkEdit/ApplyStatusField";
import ApplyCollaboratorField from "./BulkEdit/ApplyCollaboratorField";

const FIELD_TYPE_NONEDITABLE = ["email", "phonenumber"];
const FIELD_NAME_NONEDITABLE = ["LastChannel", "LastContact"];

export const FIELD_ADD_TAGS = "hashtags-add";
export const FIELD_REMOVE_TAGS = "hashtags-remove";
export const STATUS = "status";
export const COLLABORATORS = "collaborators";
export const TAG_FIELD_MODES = [FIELD_ADD_TAGS, FIELD_REMOVE_TAGS] as const;
export const FIELD_MODES = [
  FIELD_ADD_TAGS,
  FIELD_REMOVE_TAGS,
  STATUS,
  COLLABORATORS,
] as const;

function BulkEdit(props: {
  profiles: ProfileSearchType[];
  setProfiles: (p: ProfileSearchType[]) => any;
  selectedCount: number;
  staffList: StaffType[];
  companyCountry: string | undefined;
  companyTags: HashTagCountedType[];
  selectAllIds: () => Promise<string[]>;
  customFields: CustomProfileField[];
  refreshPage?: () => void;
}) {
  const {
    companyCountry,
    companyTags,
    profiles,
    setProfiles,
    staffList,
    selectAllIds,
    selectedCount,
    customFields,
    refreshPage = () => {},
  } = props;

  const { t } = useTranslation();
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);
  const taskId = useRef();

  const fieldsBulkEditable = customFields
    .map((f) => ({
      ...f,
      type: f.type.toLowerCase(),
    }))
    .filter(
      (f) =>
        !(
          FIELD_TYPE_NONEDITABLE.includes(f.type) ||
          FIELD_NAME_NONEDITABLE.includes(f.fieldName)
        )
    );

  const [state, dispatch] = useReducer<Reducer<BulkEditState, BulkEditAction>>(
    bulkEditReducer,
    defaultState([...fieldsBulkEditable])
  );
  const fieldSelected = fieldsBulkEditable.find(propEq("id", state.field));
  const fieldChoices = fieldsBulkEditable
    .map((field) => ({
      value: field.id,
      text: field.displayName,
    }))
    .concat([
      {
        text: t("profile.bulkEdit.action.addLabels"),
        value: FIELD_ADD_TAGS,
      },
      {
        text: t("profile.bulkEdit.action.removeLabels"),
        value: FIELD_REMOVE_TAGS,
      },
      {
        text: t("profile.bulkEdit.action.status"),
        value: STATUS,
      },
      {
        text: t("profile.bulkEdit.action.collaborators"),
        value: COLLABORATORS,
      },
    ]);

  function openModal() {
    dispatch({ type: "SHOW_MODAL" });
  }

  function closeModal() {
    dispatch({ type: "HIDE_MODAL" });
  }

  function updateIsTriggerAutomation(data: CheckboxProps) {
    dispatch({
      type: "UPDATE_IS_TRIGGER_AUTOMATION",
      value: Boolean(data.checked),
    });
  }

  async function applyBulkValue() {
    dispatch({ type: "SEND_FORM_START" });
    let error = undefined;
    try {
      const selectedIds = await selectAllIds();
      let profilesUpdated: ProfileSearchType[] = [];
      const body: any = {
        UserProfileIds: selectedIds,
      };
      if (state.fieldMode === "CUSTOM_FIELD") {
        if (!fieldSelected) {
          throw `applyBulkValue: No field selected`;
        }
        body.UpdateCustomFields = [
          {
            CustomFieldName: fieldSelected.fieldName,
            CustomValue: castField(fieldSelected, state.value),
          },
        ];
        body.isTriggerAutomation = state.isTriggerAutomation;
      } else if (
        [FIELD_ADD_TAGS, FIELD_REMOVE_TAGS].includes(state.fieldMode)
      ) {
        const modeFields: Record<typeof TAG_FIELD_MODES[number], string> = {
          "hashtags-add": "AddConversationLabels",
          "hashtags-remove": "RemoveConversationLabels",
        };
        body[modeFields[state.fieldMode]] = state.tags.map((t) => ({
          Hashtag: t.hashtag,
        }));
      } else if (state.fieldMode === STATUS) {
        body.status = state.status;
      } else if (state.fieldMode === COLLABORATORS) {
        body.assigneeIdList = state.assigneeIdList;
      }

      const result = await post(POST_USERPROFILE_CUSTOMFIELD_BACKGROUND, {
        param: body,
      });
      if (result) {
        taskId.current = result.id;
      }
      closeModal();
    } catch (e) {
      console.error("applyBulkValue", e, state);
      error =
        typeof e === "string"
          ? e
          : e?.message ?? t("form.field.any.error.common");
    }
    dispatch({
      type: "SEND_FORM_END",
      error: error?.toString(),
    });
  }

  useSignalRGroup(
    signalRGroupName,
    {
      OnBackgroundTaskStatusChange: [
        (state, task: TaskResponseType) => {
          if (task.isCompleted && task.id === taskId.current) {
            refreshPage();
          }
        },
      ],
    },
    "BulkEdit"
  );

  const renderField = () => {
    if ([FIELD_ADD_TAGS, FIELD_REMOVE_TAGS].includes(state.fieldMode)) {
      return (
        <TagInput
          availableTags={companyTags}
          onChange={(tags) => {
            dispatch({ type: "TAGS_UPDATED", tags });
          }}
          value={state.tags}
        />
      );
    } else if (state.fieldMode === STATUS) {
      return (
        <ApplyStatusField
          status={state.status}
          onSelect={(status) => {
            dispatch({ type: "SET_STATUS", status });
          }}
        />
      );
    } else if (state.fieldMode === COLLABORATORS) {
      return (
        <ApplyCollaboratorField
          onSelect={(value: string[]) => {
            dispatch({ type: "SET_COLLABORATORS", assigneeIdList: value });
          }}
        />
      );
    }
    return (
      fieldSelected && (
        <ApplyValueField
          fluid={false}
          field={fieldSelected}
          onChange={(value) => {
            dispatch({ type: "SET_VALUE", value });
          }}
          value={state.value}
          error={state.error ?? ""}
          companyCountry={companyCountry ?? ""}
          staffList={staffList}
        />
      )
    );
  };

  return (
    <div>
      <InfoTooltip
        placement={"bottom"}
        children={t("profile.tooltip.action.bulkEdit")}
        trigger={<Button onClick={openModal}>{t("form.button.edit")}</Button>}
      />
      <Modal open={state.showModal} className={"create-form bulk-edit-form"}>
        <Modal.Header>
          {t("profile.bulkEdit.header", { count: selectedCount })}
          <Icon name={"delete"} className={"lg"} onClick={closeModal} />
        </Modal.Header>
        <Modal.Content>
          <div className="ui form">
            <div className="field">
              <label>{t("profile.bulkEdit.field.field.label")}</label>
              <Dropdown
                upward={false}
                search
                placeholder={t("profile.bulkEdit.field.field.placeholder")}
                onChange={(event, data) =>
                  dispatch({
                    type: "SELECT_FIELD",
                    fieldId: data.value as string,
                  })
                }
                options={fieldChoices}
                noResultsMessage={t("form.field.dropdown.noResults")}
              />
              {state.error && <Message error>{state.error}</Message>}
            </div>
            <div className="field">{renderField()}</div>
            {fieldSelected?.fieldName === "ContactOwner" && (
              <TriggerAutomationCheckbox
                isChecked={state.isTriggerAutomation}
                handleChange={updateIsTriggerAutomation}
              />
            )}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => applyBulkValue()}
            disabled={!state.valid}
            loading={state.pending}
            primary
          >
            {t("form.button.update")}
          </Button>
          <Button onClick={closeModal}>{t("form.button.cancel")}</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}

export default BulkEdit;
