import React, { useEffect, useState } from "react";
import { LoggedInLayoutBasic } from "../../../../core/Layout/LoggedInLayoutBasic";
import { useTranslation } from "react-i18next";
import { useCompanyStaff } from "../../../../api/User/useCompanyStaff";
import { ObjectsGridProvider } from "../../components/ObjectsGrid/ObjectsGridContext";
import { FieldReader } from "../../API/Objects/FieldReader/FieldReader";
import { ObjectsGridDummy } from "../../components/ObjectsGridDummy";
import {
  createOpportunitiesReducer,
  defaultOpportunitiesState,
  OpportunitiesContextDependenciesType,
  OpportunitiesContextProvider,
  OpportunitiesFilterFormType,
} from "./OpportunitiesContext";
import { OpportunityNormalizedType } from "../../API/Opportunities/fetchOpportunities";
import { OpportunitiesGrid } from "./OpportunitiesGrid";
import { useObjectsApi } from "../../API/Objects/useObjectsApi";
import { useSalesforceUsers } from "../../API/Users/useSalesforceUsers";
import { useFieldsBoot } from "../../models/useFieldsBoot";

const PAGE_SIZE = 20;
const PAGES_PER_STEP = 5;

function OpportunitiesScreen() {
  const { t } = useTranslation();

  const [booted, setBooted] = useState<OpportunitiesContextDependenciesType>();
  const { staffList, refresh: refreshStaff } = useCompanyStaff();
  const { getObjectOwner } = useSalesforceUsers();

  async function bootStaff() {
    return (await refreshStaff()) ?? staffList;
  }

  const api = useObjectsApi({ type: "Opportunity" });
  const boot = useFieldsBoot({ entityType: "Opportunity" });

  useEffect(() => {
    Promise.all([
      boot.bootScalarFields(),
      boot.bootChoiceFields(["unified:StageName"]),
      bootStaff(),
    ]).then(([fieldsResult, choicesResult, staff]) => {
      setBooted({
        staff: staff,
        stages:
          choicesResult.choices.find((i) => i.name === "unified:StageName")
            ?.choices ?? [],
        fieldTypesScalar: fieldsResult,
        fieldTypesChoice: choicesResult.fields,
      });
    });
  }, []);

  return (
    <LoggedInLayoutBasic
      pageTitle={t("salesforce.opportunities.pageTitle")}
      selectedItem={"Salesforce/Opportunities"}
      extraMainClass={"salesforce-table"}
    >
      {booted ? (
        <OpportunitiesContextProvider value={{ ...booted }}>
          <ObjectsGridProvider<
            OpportunityNormalizedType,
            OpportunitiesFilterFormType
          >
            type={"Opportunity"}
            initState={defaultOpportunitiesState()}
            reducer={createOpportunitiesReducer(PAGE_SIZE, PAGES_PER_STEP)}
            getObjectUrl={api.getObjectUrl}
            getObjectCount={api.getCount}
            getObjectConversation={api.getConversation}
            getObjectOwner={getObjectOwner}
            fieldReader={
              new FieldReader(booted.fieldTypesScalar, booted.fieldTypesChoice)
            }
          >
            <OpportunitiesGrid
              pagesPerGroup={PAGES_PER_STEP}
              pageSize={PAGE_SIZE}
            />
          </ObjectsGridProvider>
        </OpportunitiesContextProvider>
      ) : (
        <ObjectsGridDummy title={t("salesforce.opportunities.pageTitle")} />
      )}
    </LoggedInLayoutBasic>
  );
}

export default OpportunitiesScreen;
