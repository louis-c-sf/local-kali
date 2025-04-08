import React from "react";
import { FieldIterator } from "../../API/Objects/FieldReader/FieldIterator";
import { Detail } from "../../components/Detail/Detail";
import { useObjectsGridContext } from "../../components/ObjectsGrid/ObjectsGridContext";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { useTranslation } from "react-i18next";
import {
  OpportunitiesFilterFormType,
  useOpportunitiesContext,
} from "./OpportunitiesContext";
import { OpportunityNormalizedType } from "../../API/Opportunities/fetchOpportunities";

export function OpportunityDetail(props: { data: LeadNormalizedType }) {
  const { fieldTypesScalar } = useOpportunitiesContext();
  const { dispatch, fieldReader } = useObjectsGridContext<
    OpportunityNormalizedType,
    OpportunitiesFilterFormType
  >();
  const iterator = new FieldIterator(fieldTypesScalar);
  const { t } = useTranslation();

  const stage = fieldReader.getValue(props.data, "StageName");
  return (
    <Detail
      close={() => dispatch({ type: "HIDE_LEAD" })}
      data={props.data}
      fieldIterator={iterator}
      name={fieldReader.getValue(props.data, "Name")}
      statusText={
        <>
          {stage ? (
            <>
              {t("salesforce.table.column.stage.head")}: {stage}
            </>
          ) : null}
        </>
      }
    />
  );
}
