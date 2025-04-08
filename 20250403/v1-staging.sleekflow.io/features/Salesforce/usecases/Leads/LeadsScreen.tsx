import React, { useEffect, useState } from "react";
import { LoggedInLayoutBasic } from "../../../../core/Layout/LoggedInLayoutBasic";
import { useTranslation } from "react-i18next";
import { LeadsGrid } from "./LeadsGrid";
import { ObjectsGridDummy } from "../../components/ObjectsGridDummy";
import { useCompanyStaff } from "../../../../api/User/useCompanyStaff";
import {
  createLeadsReducer,
  defaultLeadsState,
  LeadFilterFormType,
  LeadsContextDependenciesType,
  LeadsContextProvider,
} from "./LeadsContext";
import { ObjectsGridProvider } from "../../components/ObjectsGrid/ObjectsGridContext";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { FieldReader } from "../../API/Objects/FieldReader/FieldReader";
import { useObjectsApi } from "../../API/Objects/useObjectsApi";
import { useSalesforceUsers } from "../../API/Users/useSalesforceUsers";
import { useFieldsBoot } from "../../models/useFieldsBoot";
import { useLocation } from "react-router";
import { useCampaignChoices } from "../../API/Campaigns/useCampaignChoices";

const PAGE_SIZE = 20;
const PAGES_PER_STEP = 5;

function LeadsScreen() {
  const { t } = useTranslation();

  const [booted, setBooted] = useState<LeadsContextDependenciesType>();
  const { staffList, refresh: refreshStaff } = useCompanyStaff();
  const locationState = useLocation<{ campaignId?: string }>().state;

  async function bootStaff() {
    return (await refreshStaff()) ?? staffList;
  }

  const { getObjectOwner } = useSalesforceUsers();

  const api = useObjectsApi({ type: "Lead" });
  const boot = useFieldsBoot({ entityType: "Lead" });
  const campaigns = useCampaignChoices();

  useEffect(() => {
    Promise.all([
      boot.bootScalarFields(),
      boot.bootChoiceFields(["unified:Status", "unified:LeadSource"]),
      campaigns.boot(),
      bootStaff(),
    ])
      .then(([fieldsResult, choicesResult, campaignsResult, staff]) => {
        setBooted({
          staff: staff,
          sources:
            choicesResult.choices.find((i) => i.name === "unified:LeadSource")
              ?.choices ?? [],
          statuses:
            choicesResult.choices.find((i) => i.name === "unified:Status")
              ?.choices ?? [],
          fieldTypesScalar: fieldsResult,
          fieldTypesChoice: choicesResult.fields,
          campaignChoices: campaignsResult,
        });
      })
      .catch(console.error);
  }, []);

  let initFilter: Partial<LeadFilterFormType> = {
    campaign: locationState?.campaignId ?? null,
  };

  const initState = defaultLeadsState();

  return (
    <LoggedInLayoutBasic
      pageTitle={t("salesforce.leads.pageTitle")}
      selectedItem={"Salesforce/Leads"}
      extraMainClass={"salesforce-table"}
    >
      {booted ? (
        <LeadsContextProvider value={{ ...booted }}>
          <ObjectsGridProvider<LeadNormalizedType, LeadFilterFormType>
            type={"Lead"}
            initState={{
              ...initState,
              filter: { ...initState.filter, ...initFilter },
            }}
            reducer={createLeadsReducer(PAGE_SIZE, PAGES_PER_STEP)}
            getObjectUrl={api.getObjectUrl}
            getObjectOwner={getObjectOwner}
            getObjectConversation={api.getConversation}
            getObjectCount={api.getCount}
            fieldReader={
              new FieldReader(booted.fieldTypesScalar, booted.fieldTypesChoice)
            }
          >
            <LeadsGrid pagesPerGroup={PAGES_PER_STEP} pageSize={PAGE_SIZE} />
          </ObjectsGridProvider>
        </LeadsContextProvider>
      ) : (
        <ObjectsGridDummy title={t("salesforce.leads.pageTitle")} />
      )}
    </LoggedInLayoutBasic>
  );
}

export default LeadsScreen;
