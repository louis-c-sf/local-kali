import { LeadNormalizedType } from "features/Salesforce/API/Leads/fetchLeads";
import { ScalarFieldNormalizedType } from "features/Salesforce/API/Objects/fetchObjectFieldTypes";
import { FieldIterator } from "features/Salesforce/API/Objects/FieldReader/FieldIterator";
import { FieldReader } from "features/Salesforce/API/Objects/FieldReader/FieldReader";
import { useSalesforceObjectLink } from "features/Salesforce/API/Objects/useSalesforceObjectLink";
import {
  getFieldType,
  IGNORE_FIELDS,
} from "features/Salesforce/components/Detail/Body";
import { Field } from "features/Salesforce/components/Detail/Field";
import React from "react";
import { useTranslation } from "react-i18next";
import { Accordion } from "../BaseWidget/Accordion";
import { staffDisplayName } from "../utils/staffDisplayName";
import redirectIconStyles from "../../shared/RedirectIcon.module.css";
import RedirectIcon from "assets/tsx/icons/RedirectIcon";
import styles from "./SalesforceLeadWidget.module.css";

function LeadItem(props: {
  record: LeadNormalizedType;
  index: number;
  getObjectUrl: (id: string) => Promise<string | null>;
  fieldTypesScalar: ScalarFieldNormalizedType[] | undefined;
  fieldReader: FieldReader | undefined;
}) {
  const { record, fieldTypesScalar, fieldReader, index } = props;
  const { t } = useTranslation();
  const { openLink } = useSalesforceObjectLink({
    getLeadUrl: props.getObjectUrl,
  });
  if (!fieldTypesScalar || !fieldReader || !record) {
    return null;
  }
  const iterator = new FieldIterator(fieldTypesScalar);
  const title = t("chat.salesforces.lead.leadSource", {
    leadSource:
      fieldReader.getValue(record, "LeadSource") ??
      t("chat.salesforces.lead.notApplication"),
  });

  async function onClick(id: string) {
    await openLink(id);
  }

  return (
    <Accordion initOpen={index === 0} head={title}>
      {iterator.iterate().map((fieldName) => {
        if (
          !fieldReader.isValid(record, fieldName) ||
          fieldReader.getValue(record, fieldName) === null ||
          IGNORE_FIELDS.includes(fieldName)
        ) {
          return null;
        }
        let value = fieldReader.getValue(record, fieldName);

        if (fieldName === "owner_id") {
          value = record.owner ? staffDisplayName(record.owner) : "-";
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
      <div
        className={`${styles.link} ${redirectIconStyles.headerClickArea}`}
        onClick={() => onClick(record.id)}
      >
        <span>{t("chat.salesforces.lead.salesForcesLink")}</span>
        <RedirectIcon className={redirectIconStyles.redirectIcon} />
      </div>
    </Accordion>
  );
}

export default LeadItem;
