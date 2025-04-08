import React, { useEffect } from "react";
import {
  Checkbox,
  CheckboxProps,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Message,
} from "semantic-ui-react";
import {
  DispatchingStep,
  ImportState,
  UploadDetailsFormState,
} from "../contracts";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../../config/useRouteConfig";
import { TriggerAutomationCheckbox } from "../../../../component/Contact/TriggerAutomationCheckbox";
import useImportedLists from "../../Imported/useImportedLists";
import { submitProfilesImportBackground } from "../../../../api/Contacts/Import/submitProfilesImportBackground";

interface UploadDetailsFormProps extends DispatchingStep {
  state: ImportState;
  stepState: UploadDetailsFormState;
  history: any;
}

const NEW_LIST_ID = -1;

const UploadDetailsForm: React.FC<UploadDetailsFormProps> = (props) => {
  const { importDispatch, history, state } = props;
  const { agreeWithConditions, isTriggerAutomation } = props.stepState;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  const { lists } = useImportedLists();

  const errors = state.errors || [];

  // send file for parsing on Next click
  useEffect(() => {
    if (!state.saveConfirmed) {
      return;
    }

    try {
      sendForm();
      history.push({
        pathname: routeTo(`/contacts/lists`),
        state: {
          flashMessage: t("flash.profile.import.inProgress", {
            n: state.importName,
          }),
        },
      });
    } catch (error) {
      // should be handled in fail backend signal
      console.error(error);
    }
  }, [state.saveConfirmed, state.file, JSON.stringify(errors)]);

  function getListOptions() {
    const result = lists.map<DropdownItemProps>((l) => {
      return {
        key: l.id,
        text: l.importName,
        value: l.id,
      };
    });

    if (state.importName) {
      result.splice(0, 0, {
        key: NEW_LIST_ID,
        text: state.importName,
        value: NEW_LIST_ID,
      });
    }

    return result;
  }

  async function sendForm() {
    const mapping = state.steps.uploadPreview.columnsMapping.filter(
      (column) => column.name
    );
    const listParam = state.importListId ?? state.importName;
    if (listParam === undefined) {
      throw "Form is invalid";
    }
    if (state.file === undefined) {
      throw "Form is invalid";
    }
    submitProfilesImportBackground(
      state.file,
      listParam as any,
      mapping,
      state.steps.uploadDetailsForm.isTriggerAutomation
    ).catch((e) => {
      console.error(`Import error: ${e}`);
    });
  }

  const selectListId = (_: any, data: DropdownProps) => {
    const id = data.value as number;
    const name = data.options?.find((list) => list.value === id)?.text;
    importDispatch({
      type: "IMPORT_LIST_SELECT",
      id,
      name: typeof name === "string" ? name : "",
    });
  };

  const addNewList = (_: any, data: DropdownProps) => {
    const name = data.value as string;
    importDispatch({ type: "IMPORT_NAME_UPDATE", name });
  };

  return (
    <>
      <h4 className="ui header">
        {t("profile.list.import.step.details.header")}
      </h4>
      <div className={"details-form"}>
        <div className="label-wrap">
          <label htmlFor="">
            {t("profile.list.import.step.details.field.name.label")} *
          </label>
        </div>
        <div className="input-wrap">
          <div className="ui input">
            <Dropdown
              options={getListOptions()}
              value={state.importListId ?? NEW_LIST_ID}
              selection
              fluid
              search
              onChange={selectListId}
              onAddItem={addNewList}
              allowAdditions
              additionLabel={t("profile.list.import.addListLabel")}
            />
          </div>
        </div>
        <div className={"hint"}>
          {t("profile.list.import.step.details.createWarn")}
        </div>
        <div className="input-wrap">
          <div className="checkbox">
            <Checkbox
              value={1}
              checked={agreeWithConditions}
              onClick={(event, data) =>
                importDispatch({
                  type: "AGREE_WITH_CONDITIONS",
                  value: Boolean(data.checked),
                })
              }
              label={t(
                "profile.list.import.step.details.field.confirmTerms.label"
              )}
            />
          </div>
        </div>
        <TriggerAutomationCheckbox
          isChecked={isTriggerAutomation}
          handleChange={(data: CheckboxProps) =>
            importDispatch({
              type: "UPDATE_IS_TRIGGER_AUTOMATION",
              value: Boolean(data.checked),
            })
          }
        />
        <Message warning hidden={errors.length === 0}>
          {t("system.error.unknown")}
        </Message>
      </div>
    </>
  );
};

export default UploadDetailsForm;
