import { CustomProfileField } from "../../../types/ContactType";
import { Button, Form, Header } from "semantic-ui-react";
import React, { useEffect, SyntheticEvent } from "react";
import { FieldValue } from "./NewContact";
import {
  CustomUserProfileFieldInput,
  MultiChangeHandlerType,
} from "../CustomUserProfileFieldInput";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../shared/sidebar/Drawer";
import { useFieldLocales } from "../locaizable/useFieldLocales";
import { useAppSelector } from "../../../AppRootContext";
import { cond } from "ramda";
import { StaffType } from "../../../types/StaffType";

interface NewContactViewProps extends MultiChangeHandlerType {
  editMode: boolean;
  topError: string;
  errorMessages: { [fieldName: string]: string };
  fields: CustomProfileField[];
  fieldValues: FieldValue;
  handleClose: any;
  handleSubmit: (
    fieldValues: Record<string, string>,
    keepVisible?: boolean
  ) => void;
  loading: boolean;
  staffList: StaffType[];
  submittable: boolean;
  updateContact: (fieldValues: Record<string, string>) => void;
  visible: boolean;
  fieldFocusedName?: string;
}

export function NewContactView(props: NewContactViewProps) {
  const {
    loading,
    visible,
    topError,
    editMode,
    fields,
    fieldValues,
    handleClose,
    staffList,
    textFieldChange,
    handleSubmit,
    updateContact,
    fieldFocusedName,
  } = props;

  const company = useAppSelector((s) => s.company);
  const { t } = useTranslation();
  const { getFieldDisplayNameLocale } = useFieldLocales();

  const visibleFields = fields.filter((field) => field.isVisible);
  const fieldFocused = visibleFields.find(
    (f) => f.displayName === fieldFocusedName
  );
  const fieldType = fieldFocused?.type;

  useEffect(() => {
    if (!fieldFocusedName || !visible) {
      return;
    }
    let wrapperNode: HTMLDivElement | null = document.querySelector(
      `.field[data-id="${fieldFocusedName}__wrap"]`
    ) as HTMLDivElement;

    const findInput = (n: HTMLDivElement) =>
      n.querySelectorAll("input").item(0);
    const findTextarea = (n: HTMLDivElement) => n.querySelector("textarea");
    const findElement = cond([
      // when no wrapper found
      [
        (node) => node == null,
        () => {
          const defaultWrapperNode = document.querySelector(
            `.field[data-id="First Name__wrap"]`
          ) as HTMLDivElement;
          return defaultWrapperNode && findInput(defaultWrapperNode);
        },
      ],
      // special textarea case
      [() => fieldType === "multilinetext", findTextarea],
      // when some known fields requested
      [
        () =>
          ["First Name", "Last Name"].includes(fieldFocusedName) ||
          [
            "singlelinetext",
            "email",
            "number",
            "boolean",
            "phoneNumber",
          ].includes(fieldType ?? ""),
        findInput,
      ],
      // default case
      [() => true, findInput],
    ]);

    let element = findElement(wrapperNode);
    if (!element) {
      return;
    }

    const timeout = setTimeout(() => element?.focus(), 100);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [visible, fieldFocused, fieldType, fieldFocusedName]);

  return (
    <Drawer visible={visible} dim hide={handleClose}>
      <div className="new-contact">
        <Header as={"h1"} className={"top"}>
          <div className="text">
            {editMode
              ? t("form.profile.header.edit")
              : t("form.profile.header.add")}
          </div>
          <i className={"ui icon close lg-white"} onClick={handleClose} />
        </Header>
        {topError && <div className="general-error-message">{topError}</div>}
        <Form as="div" id="newContactForm">
          <Form.Field data-id={"First Name__wrap"}>
            <label>{t("profile.staticField.firstName.name")}</label>
            <input
              type="text"
              placeholder={t("profile.staticField.firstName.placeholder")}
              id={"firstName"}
              value={props.fieldValues["firstName"] || ""}
              onChange={textFieldChange}
            />
          </Form.Field>
          <Form.Field data-id={"Last Name__wrap"}>
            <label>{t("profile.staticField.lastName.name")}</label>
            <input
              type="text"
              placeholder={t("profile.staticField.lastName.placeholder")}
              id={"lastName"}
              value={fieldValues["lastName"] || ""}
              onChange={textFieldChange}
            />
          </Form.Field>
          {visibleFields.map((field, idx) => {
            return (
              <CustomUserProfileFieldInput
                field={field}
                fluid={false}
                value={fieldValues[field.fieldName]}
                handleDateTimeChange={props.handleDateTimeChange}
                phoneNumberChange={props.phoneNumberChange}
                radioChange={props.radioChange}
                selectOption={props.selectOption}
                textAreaFieldChange={props.textAreaFieldChange}
                textFieldChange={textFieldChange}
                staffList={staffList}
                companyCountry={company?.companyCountry ?? ""}
                errMsg={props.errorMessages[field.fieldName] ?? ""}
                t={t}
                getFieldDisplayNameLocale={getFieldDisplayNameLocale}
                key={idx}
              />
            );
          })}
          {/* <div className="form-note">
            <Trans i18nKey={"form.profile.prompt.editColumns"}>
              You can <a onClick={() => {}}>edit the columns</a> your team sees here
            </Trans>
          </div> */}
        </Form>
        <div className="action-footer">
          {editMode ? (
            <Button
              type="submit"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                updateContact(fieldValues);
              }}
              className="create"
            >
              {t("form.profile.button.update")}
            </Button>
          ) : (
            <ActionButtons
              loading={loading}
              submittable={props.submittable}
              onCreateClick={(e) => {
                e.stopPropagation();
                handleSubmit(fieldValues, false);
              }}
              onCreateAndAddAnotherClick={(e) => {
                e.stopPropagation();
                handleSubmit(fieldValues, true);
              }}
              onCancelClick={handleClose}
            />
          )}
        </div>
      </div>
    </Drawer>
  );
}

function ActionButtons(props: {
  loading: boolean;
  submittable: boolean;
  onCreateClick: (event: SyntheticEvent) => void;
  onCreateAndAddAnotherClick: (event: SyntheticEvent) => void;
  onCancelClick: any;
}) {
  const {
    onCancelClick,
    loading,
    onCreateAndAddAnotherClick,
    onCreateClick,
    submittable,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <Button
        type="submit"
        loading={loading}
        onClick={submittable ? onCreateClick : undefined}
        disabled={!submittable || loading}
        className={"create primary"}
      >
        {t("form.profile.button.create")}
      </Button>
      <Button
        type="submit"
        loading={loading}
        disabled={!submittable || loading}
        onClick={submittable ? onCreateAndAddAnotherClick : undefined}
        className="add-other"
      >
        {t("form.profile.button.createAndAdd")}
      </Button>
      <Button onClick={loading ? undefined : onCancelClick} disabled={loading}>
        {t("form.profile.button.cancel")}
      </Button>
    </>
  );
}
