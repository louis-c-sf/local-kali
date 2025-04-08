import { CustomProfileField } from "../../types/ContactType";
import {
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Form,
} from "semantic-ui-react";
import Textarea from "react-textarea-autosize";
import PhoneNumber from "../PhoneNumber";
import DatePicker from "react-datepicker";
import { DropdownType } from "../../config/ContactTypeFieldMapping";
import {
  CustomUserProfileFieldLingualsType,
  UserProfileFieldOptionsType,
} from "../../types/CompanyType";
import { ProfileChannelField } from "../../config/ProfileFieldMapping";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useCurrentUtcOffset } from "../Chat/hooks/useCurrentUtcOffset";
import {
  toDatePickerDate,
  toUserUtcDate,
} from "../AssignmentRules/AutomationRuleEdit/fields/helpers";
import moment, { Moment } from "moment";
import { TFunction } from "i18next";
import { StaffType } from "../../types/StaffType";
import { WrapField } from "../shared/form/WrapField";
import wrapStyles from "../shared/form/WrapField.module.css";
import { DummyField } from "../AssignmentRules/AutomationRuleEdit/input/DummyField";
import { useCountryDialList } from "../../config/localizable/useCountryDialList";

export interface MultiChangeHandlerType {
  handleDateTimeChange: (
    date: Moment | undefined,
    e: React.SyntheticEvent | undefined,
    fieldName: string
  ) => any;
  phoneNumberChange: (fieldName: string, value: string, code: string) => any;
  radioChange: (e: any, fieldName: string, data: { checked: boolean }) => any;
  selectOption: (e: any, data: DropdownProps, labelName: string) => any;
  textAreaFieldChange: (e: ChangeEvent<HTMLTextAreaElement>) => any;
  textFieldChange: (e: ChangeEvent<HTMLInputElement>) => any;
}

interface CustomUserProfileFieldInputProps extends MultiChangeHandlerType {
  field: CustomProfileField;
  value: any;
  label?: string;
  staffList: StaffType[];
  companyCountry: string;
  errMsg: string;
  fluid: boolean;
  readonly?: boolean;
  t: TFunction;
  getFieldDisplayNameLocale: (
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ) => string;
}

export function CustomUserProfileFieldInput(
  props: CustomUserProfileFieldInputProps
) {
  const {
    field,
    textAreaFieldChange,
    textFieldChange,
    phoneNumberChange,
    radioChange,
    handleDateTimeChange,
    selectOption,
    staffList,
    companyCountry,
    errMsg,
    fluid,
    t,
    getFieldDisplayNameLocale,
    readonly = false,
  } = props;
  const labelName =
    Object.keys(field).find((fieldName) => fieldName === "displayName") || "";
  const [countryCode, setCountryCode] = useState<string>();
  const { getCountryCodeByAbbreviationOrName } = useCountryDialList();

  let fieldLabel = props.label ?? field[labelName];

  const utcOffset = useCurrentUtcOffset();
  const fieldType = field.type.toLowerCase();
  const fieldBaseId = field["displayName"];

  useEffect(() => {
    if (fieldType === "phonenumber" && !props.value && !countryCode) {
      getCountryCodeByAbbreviationOrName(companyCountry)
        .then(setCountryCode)
        .catch(console.error);
    }
  }, [fieldType, countryCode, companyCountry]);

  if (fieldType === "singlelinetext") {
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
      >
        <Form.Input
          fluid
          value={props.value || ""}
          disabled={readonly}
          id={field["fieldName"]}
          onChange={textFieldChange}
          placeholder={t("form.prompt.enterValue", {
            n: field[labelName],
          })}
        />
      </WrapField>
    );
  } else if (fieldType === "multilinetext") {
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
      >
        <Textarea
          maxRows={2}
          minRows={1}
          disabled={readonly}
          id={field["fieldName"]}
          value={props.value || ""}
          onChange={textAreaFieldChange}
          placeholder={t("form.prompt.enterValue", {
            n: field[labelName],
          })}
        />
      </WrapField>
    );
  } else if (fieldType === "phonenumber") {
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
      >
        <div className="field">
          {readonly ? (
            <DummyField fluid>
              {props.value
                ? `${countryCode ? `+${countryCode}` : ""} ${props.value}`
                : ""}
            </DummyField>
          ) : (
            <PhoneNumber
              countryCode={companyCountry}
              existValue={props.value}
              fieldName={field["fieldName"]}
              onChange={phoneNumberChange}
            />
          )}
        </div>
      </WrapField>
    );
  } else if (fieldType === "email") {
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
      >
        <Form.Input
          fluid
          type="text"
          disabled={readonly}
          placeholder={t("form.prompt.enterValue", {
            n: field[labelName],
          })}
          id={field["fieldName"]}
          value={props.value || ""}
          onChange={textFieldChange}
        />
      </WrapField>
    );
  } else if (fieldType === "number") {
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
      >
        <Form.Input
          fluid
          type="number"
          disabled={readonly}
          placeholder={t("form.prompt.enterValue", {
            n: field[labelName],
          })}
          id={field["fieldName"]}
          value={props.value || ""}
          onChange={textFieldChange}
        />
      </WrapField>
    );
  } else if (fieldType === "boolean") {
    let checked = field["fieldName"] === "Subscriber" ? "true" : "";
    if (props.value !== undefined) {
      checked = props.value.toLowerCase();
    }
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        fieldClass={"toggle"}
        readonly={readonly}
      >
        <Form.Radio
          value={field["fieldName"]}
          checked={checked === "true"}
          disabled={readonly}
          toggle
          onChange={(e, data) => {
            radioChange(e, field["fieldName"], data as { checked: boolean });
          }}
        />
      </WrapField>
    );
  } else if (fieldType === "date") {
    let dateValue = undefined;
    if (props.value) {
      const date = moment(props.value);
      dateValue = date.isValid()
        ? toDatePickerDate(date, utcOffset)
        : undefined;
    }
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
      >
        <DatePicker
          selected={
            dateValue && !isNaN(dateValue?.getTime()) ? dateValue : undefined
          }
          disabled={readonly}
          placeholderText={t("form.field.date.placeholder")}
          onChange={(date, e) =>
            handleDateTimeChange(
              date
                ? toUserUtcDate(moment(date).startOf("day").toDate(), utcOffset)
                : undefined,
              e,
              field["fieldName"]
            )
          }
          dateFormat={"yyyy/MM/dd"}
        />
      </WrapField>
    );
  } else if (fieldType === "datetime") {
    let dateValue = undefined;
    if (props.value) {
      const date = moment(props.value);
      dateValue = date.isValid()
        ? toDatePickerDate(date, utcOffset)
        : undefined;
    }
    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
        fieldClass={wrapStyles.hasTime}
      >
        <DatePicker
          selected={
            dateValue && !isNaN(dateValue?.getTime()) ? dateValue : undefined
          }
          showTimeSelect
          disabled={readonly}
          onChange={(date, e) =>
            handleDateTimeChange(
              date ? toUserUtcDate(date, utcOffset) : undefined,
              e,
              field["fieldName"]
            )
          }
          placeholderText={t("form.field.datetime.placeholder")}
          dateFormat={"yyyy/MM/dd h:mm aa"}
        />
      </WrapField>
    );
  } else if (DropdownType.includes(fieldType)) {
    let optionsVal: DropdownItemProps[] = [];
    if (field.options && field.options.length > 0) {
      const userFieldsOptions = field.options as UserProfileFieldOptionsType[];
      optionsVal = userFieldsOptions
        .sort((a, b) => a.order - b.order)
        .map((option, i) => {
          const displayFieldName = getFieldDisplayNameLocale(
            option.customUserProfileFieldOptionLinguals,
            option.value
          );
          return {
            key: i + 1,
            value: option.value,
            text: displayFieldName,
          };
        });
    } else if (fieldType === "channel") {
      optionsVal = Object.keys(ProfileChannelField).map((profileChannel, i) => {
        return {
          key: i + 1,
          value: profileChannel,
          text: profileChannel,
        };
      });
    } else if (fieldType === "travisuser") {
      optionsVal = staffList.map((staff, i) => {
        const { userInfo } = staff;
        return {
          value: userInfo.id,
          text: userInfo.displayName || userInfo.email,
          key: i + 1,
        };
      });
    }
    const selectedVal = optionsVal.find(
      (optionVal) => optionVal.value === props.value
    );
    const placeholder = t("form.field.any.placeholder.select", {
      name: fieldLabel,
    });

    return (
      <WrapField
        id={fieldBaseId}
        label={fieldLabel}
        error={errMsg}
        readonly={readonly}
      >
        <Dropdown
          scrolling
          lazyLoad
          upward={false}
          search
          fluid={fluid}
          disabled={readonly}
          text={(selectedVal?.text as string) || ""}
          noResultsMessage={t("form.field.dropdown.noResults")}
          value={
            props.value && optionsVal.some((v) => v.value === props.value)
              ? props.value
              : ""
          }
          options={[
            {
              value: "",
              text: selectedVal?.text ? t("form.field.any.reset") : placeholder,
              className: "option-default",
              key: 0,
            },
            ...optionsVal,
          ]}
          onChange={(e, data) => selectOption(e, data, field.fieldName)}
          placeholder={placeholder}
        />
      </WrapField>
    );
  }
  return <></>;
}
