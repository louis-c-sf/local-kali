import React, { useContext, useState } from "react";
import { Dropdown, Input } from "semantic-ui-react";
import { FieldError } from "../../../shared/form/FieldError";
import ApplyValueField from "../../../Contact/BulkEdit/ApplyValueField";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { useCustomProfileFields } from "../../../../container/Contact/hooks/useCustomProfileFields";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import { DropdownType } from "../../../../config/ContactTypeFieldMapping";
import { WaitableActionProps } from "../ActionsForm";
import {
  AutomationActionType,
  UpdateCustomFieldsAutomationActionType,
} from "../../../../types/AutomationActionType";
import { useTranslation } from "react-i18next";
import { useFieldLocales } from "../../../Contact/locaizable/useFieldLocales";
import { pick } from "ramda";
import { useAppSelector } from "../../../../AppRootContext";
import { DummyField } from "../input/DummyField";
import styles from "./AutomationAction.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";
import DateTimeAndNowPicker from "./DateTimeAndNowPicker";

const EXCLUDE_FIELDS = [
  "ContactOwner",
  "LastContact",
  "LastChannel",
  "LastContactFromCustomer",
];

interface CustomFieldsActionProps extends WaitableActionProps {
  action: UpdateCustomFieldsAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
}

function UpdateCustomFieldsAction(props: CustomFieldsActionProps) {
  const { action, setAction, canAddWaitAction } = props;
  const { waitActionRemove, waitActionAdd, waitActionChange } = props;
  const initValue = action.actionUpdateCustomFields[0];
  const [state, setState] = useState<{
    selectedField: string | undefined;
    selectedValue: any;
  }>({
    selectedField: initValue?.customFieldName,
    selectedValue: initValue?.customValue,
  });
  const { staticFieldDisplayNames } = useFieldLocales();
  const { readonly } = useContext(ActionFormContext);

  const STATIC_CHOICES = [
    { value: "FirstName", text: staticFieldDisplayNames.firstname, key: 0 },
    { value: "LastName", text: staticFieldDisplayNames.lastname, key: 1 },
  ];

  const { fields: customFields } = useCustomProfileFields({
    excludeLabels: true,
    excludeCollabors: true,
  });
  const { t } = useTranslation();

  const { staffList, company } = useAppSelector(pick(["staffList", "company"]));

  const currentFieldName = state.selectedField ?? "";
  const currentField = customFields.find(
    (f) => f.fieldName === state.selectedField
  );

  const isSingleLine = currentField?.type.toLowerCase() === "boolean";

  function getControlClasses(field: { type: string } | undefined) {
    const classes = [styles.fieldControl];
    if (field?.type.toLowerCase() === "boolean") {
      classes.push(styles.boolean);
    }
    if (isSingleLine) {
      classes.push("single-line");
    }
    return classes;
  }

  return (
    <div
      className={`${styles.action} ${styles.updateCustomFields} ${
        readonly ? styles.readonly : ""
      }`}
    >
      {action.actionWaitDenormalized && (
        <WaitTimeAction
          action={action.actionWaitDenormalized}
          onChange={waitActionChange}
          onRemove={waitActionRemove}
          error={props.waitError}
        />
      )}
      <div className={styles.controls}>
        <div className={styles.head}>
          <DummyField compact>
            {t("automation.action.update.header")}
          </DummyField>
        </div>
        <div className={styles.body}>
          <div className={styles.fieldsControls}>
            <div className={`${styles.fieldControl}`}>
              <div className="ui fluid input">
                <Dropdown
                  selection
                  fluid
                  search
                  noResultsMessage={t("form.field.dropdown.noResults")}
                  disabled={readonly}
                  options={STATIC_CHOICES.concat(
                    customFields.map<DropdownOptionType>((field, key) => {
                      return {
                        value: field.fieldName,
                        text: field.displayName,
                        key: key + STATIC_CHOICES.length,
                      };
                    })
                  )}
                  value={state.selectedField ?? ""}
                  onChange={(_, data) => {
                    const newFieldName = data.value as string;
                    const newType =
                      customFields.find((f) => f.fieldName === newFieldName)
                        ?.type ?? "";
                    const oldType = customFields.find(
                      (f) => f.fieldName === state.selectedField
                    )?.type;

                    let newValue =
                      oldType !== newType ? "" : state.selectedValue;
                    if (DropdownType.includes(newType.toLowerCase())) {
                      newValue = undefined;
                    } else if ("boolean" === newType.toLowerCase()) {
                      newValue = "false";
                    }

                    setState({
                      ...state,
                      selectedField: newFieldName,
                      selectedValue: newValue,
                    });
                    setAction({
                      ...action,
                      actionUpdateCustomFields: [
                        {
                          customValue: newValue,
                          customFieldName: newFieldName,
                        },
                      ],
                    });
                  }}
                />
              </div>
            </div>
            <div className={getControlClasses(currentField).join(" ")}>
              <div
                className={`ui input fluid ${
                  styles.fieldValue
                } ${getControlClasses(currentField).join(" ")}`}
              >
                {["FirstName", "LastName"].includes(currentFieldName) && (
                  <Input
                    type={"text"}
                    value={state.selectedValue}
                    fluid
                    onChange={(_, data) => {
                      setState({
                        ...state,
                        selectedValue: data.value as string,
                      });
                      setAction({
                        ...action,
                        actionUpdateCustomFields: [
                          {
                            customValue: data.value as string,
                            customFieldName: currentFieldName,
                          },
                        ],
                      });
                    }}
                  />
                )}
                {currentField &&
                  (currentField.type === "DateTime" ? (
                    <DateTimeAndNowPicker
                      defaultValue={state.selectedValue}
                      onChange={(value: any) => {
                        setState({
                          ...state,
                          selectedValue: value,
                        });
                        setAction({
                          ...action,
                          actionUpdateCustomFields: [
                            {
                              customValue: value,
                              customFieldName: currentField.fieldName,
                            },
                          ],
                        });
                      }}
                    />
                  ) : (
                    <ApplyValueField
                      field={currentField}
                      value={state.selectedValue ?? ""}
                      staffList={staffList}
                      companyCountry={company?.companyCountry ?? ""}
                      fluid={true}
                      readonly={readonly}
                      onChange={(value) => {
                        setState({
                          ...state,
                          selectedValue: value,
                        });
                        setAction({
                          ...action,
                          actionUpdateCustomFields: [
                            {
                              customValue: value,
                              customFieldName: currentField.fieldName,
                            },
                          ],
                        });
                      }}
                      error={undefined}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          {canAddWaitAction && (
            <AddWaitActionButton onAddAction={waitActionAdd} />
          )}
        </div>
        {props.error && (
          <div className={styles.errors}>
            <FieldError text={props.error} />
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateCustomFieldsAction;
