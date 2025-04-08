import React, { ReactNode } from "react";
import styles from "./Body.module.css";
import { staffDisplayName } from "component/Chat/utils/staffDisplayName";
import { FieldIterator } from "../../API/Objects/FieldReader/FieldIterator";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { Field } from "./Field";
import { useObjectsGridContext } from "../ObjectsGrid/ObjectsGridContext";
import { FieldReader } from "features/Salesforce/API/Objects/FieldReader/FieldReader";

export const IGNORE_FIELDS = [
  "SystemModstamp",
  "IsDeleted",
  "id",
  "SleekflowId",
  "CleanStatus",
  "SalesforceIntegratorId",
];

export const NoValue = Symbol("NoValue");

export function getFieldType(fieldName: string, fieldReader: FieldReader) {
  switch (true) {
    case fieldReader.isString(fieldName):
      return "string";
    case fieldReader.isDate(fieldName):
      return "date";
    case fieldReader.isBoolean(fieldName):
      return "boolean";
    default:
      return "string";
  }
}

export function Body(props: {
  data: LeadNormalizedType;
  fieldIterator: FieldIterator;
  renderCustom?: (fieldName: string) => ReactNode;
}) {
  const { data, fieldIterator } = props;
  const { fieldReader } = useObjectsGridContext();

  return (
    <div className={styles.grid}>
      {fieldIterator.iterate().map((fieldName) => {
        const customRender =
          props.renderCustom && props.renderCustom(fieldName);

        if (customRender) {
          if (customRender === NoValue) {
            return null;
          }
          return (
            <Field
              key={fieldName}
              label={
                fieldName === "CampaignMembers"
                  ? "Campaign"
                  : fieldReader.getLabel(fieldName) ?? fieldName
              }
              type={getFieldType(fieldName, fieldReader)}
              value={null}
              enlarge={false}
            >
              {customRender}
            </Field>
          );
        }
        if (
          fieldReader.getValue(data, fieldName) === null ||
          IGNORE_FIELDS.includes(fieldName)
        ) {
          return null;
        }

        let value = fieldReader.getValue(data, fieldName);

        if (fieldName === "owner_id") {
          value = data.owner ? staffDisplayName(data.owner) : "-";
        }

        const primaryValues = ["firstName", "lastName"];

        return (
          <Field
            key={fieldName}
            label={fieldReader.getLabel(fieldName) ?? fieldName}
            type={getFieldType(fieldName, fieldReader)}
            value={value}
            enlarge={primaryValues.includes(fieldName)}
          />
        );
      })}
    </div>
  );
}
