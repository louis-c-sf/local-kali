import React from "react";
import { CustomProfileField } from "../../../types/ContactType";
import { CustomUserProfileFieldInput } from "../CustomUserProfileFieldInput";
import { Moment } from "moment";
import { useTranslation } from "react-i18next";
import { useFieldLocales } from "../locaizable/useFieldLocales";
import { StaffType } from "../../../types/StaffType";

interface ApplyValueFieldProps {
  field: CustomProfileField;
  fluid: boolean;
  onChange: (value: any) => any;
  value: any;
  staffList: StaffType[];
  companyCountry: string;
  error: string | undefined;
  readonly?: boolean;
}

function ApplyValueField(props: ApplyValueFieldProps) {
  function handleStringChange(data: any) {
    props.onChange(data);
  }

  const { t } = useTranslation();
  const { getFieldDisplayNameLocale } = useFieldLocales();

  return (
    <>
      <CustomUserProfileFieldInput
        field={props.field}
        value={props.value}
        label={"Value"}
        staffList={props.staffList}
        companyCountry={props.companyCountry}
        errMsg={props.error ?? ""}
        handleDateTimeChange={(value: Moment | undefined) =>
          handleStringChange(value)
        }
        phoneNumberChange={(name, value, code) => handleStringChange(value)}
        radioChange={(e, name, data) =>
          handleStringChange(data.checked ? "true" : "false")
        }
        selectOption={(e, data) => handleStringChange(data.value)}
        textAreaFieldChange={(e) => handleStringChange(e.target.value)}
        textFieldChange={(e) => handleStringChange(e.target.value)}
        fluid={props.fluid}
        t={t}
        readonly={props.readonly ?? false}
        getFieldDisplayNameLocale={getFieldDisplayNameLocale}
      />
    </>
  );
}

export default ApplyValueField;
