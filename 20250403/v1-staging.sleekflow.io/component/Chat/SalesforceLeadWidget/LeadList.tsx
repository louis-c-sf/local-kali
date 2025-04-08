import { ObjectNormalizedType } from "features/Salesforce/API/Objects/contracts";
import { fetchObjectFieldVendorChoices } from "features/Salesforce/API/Objects/fetchObjectFieldVendorChoices";
import { fetchObjectFieldTypes } from "features/Salesforce/API/Objects/fetchObjectFieldTypes";
import { FieldReader } from "features/Salesforce/API/Objects/FieldReader/FieldReader";
import { LeadsContextDependenciesType } from "features/Salesforce/usecases/Leads/LeadsContext";
import React, { useEffect, useState } from "react";
import LeadItem from "./LeadItem";
import { useCampaignChoices } from "../../../features/Salesforce/API/Campaigns/useCampaignChoices";

type LeadFieldType = Omit<LeadsContextDependenciesType, "statuses" | "staff">;

function LeadList(props: {
  records: Array<ObjectNormalizedType>;
  getObjectUrl: (id: string) => Promise<string | null>;
}) {
  async function bootFieldChoices(fieldName: string) {
    return await fetchObjectFieldVendorChoices("Lead");
  }

  async function bootFields() {
    return await fetchObjectFieldTypes("Lead");
  }

  const [booted, setBooted] = useState<LeadFieldType>();
  const campaigns = useCampaignChoices();

  useEffect(() => {
    Promise.all([
      bootFields(),
      bootFieldChoices("unified:Status"),
      campaigns.boot(),
    ]).then(([fieldsResult, choicesResult, campaignChoices]) => {
      const sourceField = choicesResult.fields.find(
        (f) => f.name === "LeadSource"
      );
      const sourceChoices = sourceField?.picklist_values ?? [];
      setBooted({
        sources: sourceChoices.map((choice) => ({
          title: choice.label,
          value: choice.value,
        })),
        fieldTypesScalar: fieldsResult.fields,
        fieldTypesChoice: choicesResult.fields,
        campaignChoices: campaignChoices,
      });
    });
  }, []);

  const { records } = props;
  if (booted === undefined) {
    return null;
  }
  const fieldReader = new FieldReader(
    booted.fieldTypesScalar,
    booted.fieldTypesChoice
  );
  return (
    <>
      {records.map((record, index) => (
        <LeadItem
          getObjectUrl={props.getObjectUrl}
          key={record.id}
          index={index}
          fieldReader={fieldReader}
          fieldTypesScalar={booted?.fieldTypesScalar}
          record={record}
        />
      ))}
    </>
  );
}

export default LeadList;
