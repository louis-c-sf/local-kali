import React, { useEffect, useState } from "react";
import { LoggedInLayoutBasic } from "core/Layout/LoggedInLayoutBasic";
import { useTranslation } from "react-i18next";
import { ObjectsGridDummy } from "features/Salesforce/components/ObjectsGridDummy";
import { CampaignsGrid } from "features/Salesforce/usecases/Campaigns/CampaignsGrid";
import {
  CampaignsDependencenciesProvider,
  CampaignsScreenDependenciesType,
} from "./models/CampaignsDependencenciesProvider";
import { FieldReader } from "../../API/Objects/FieldReader/FieldReader";
import { useObjectsApi } from "../../API/Objects/useObjectsApi";
import { useSalesforceUsers } from "../../API/Users/useSalesforceUsers";
import { ChoiceFieldNormalizedType } from "../../API/Objects/fetchObjectFieldVendorChoices";
import { ScalarFieldNormalizedType } from "../../API/Objects/fetchObjectFieldTypes";
import { useCompanyStaff } from "../../../../api/User/useCompanyStaff";
import { ChoiceFieldsBooted, useFieldsBoot } from "../../models/useFieldsBoot";
import { CampaignsGridProvider } from "./models/CampaignsGridProvider";
import { useLocation } from "react-router";
import { fetchObjects } from "../../API/Objects/fetchObjects";
import { StaffType } from "../../../../types/StaffType";
import { ObjectNormalizedType } from "../../API/Objects/contracts";

const PAGE_SIZE = 20;
const PAGES_PER_STEP = 5;

function CampaignsScreen(props: {}) {
  const { t } = useTranslation();
  const [booted, setBooted] = useState<CampaignsScreenDependenciesType>();
  const { staffList, refresh: refreshStaff } = useCompanyStaff();
  const location = useLocation();
  const param = new URLSearchParams(location.search);

  async function bootStaff() {
    return (await refreshStaff()) ?? staffList;
  }

  const api = useObjectsApi({ type: "Campaign" });
  const boot = useFieldsBoot({ entityType: "Campaign" });

  async function bootDetail(): Promise<ObjectNormalizedType | undefined> {
    const campaignId = param.get("id");
    if (campaignId) {
      try {
        const results = await fetchObjects(
          "Campaign",
          [
            {
              filters: [
                {
                  value: campaignId,
                  field_name: "unified:SalesforceIntegratorId",
                  operator: "=",
                },
              ],
            },
          ],
          [],
          1
        );
        if (results.records) {
          return results.records.shift() as ObjectNormalizedType;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  useEffect(() => {
    Promise.all<
      ScalarFieldNormalizedType[],
      {
        fields: ChoiceFieldNormalizedType[];
        choices: ChoiceFieldsBooted<"unified:Status">;
      },
      StaffType[],
      ObjectNormalizedType | undefined
    >([
      boot.bootScalarFields(),
      boot.bootChoiceFields(["unified:Status"]),
      bootStaff(),
      bootDetail(),
    ])
      .then(([fieldsResult, choicesResult, staff, detailData]) => {
        setBooted({
          staff: staff,
          stages:
            choicesResult.choices.find((i) => i.name === "unified:Status")
              ?.choices ?? [],
          fieldTypesScalar: fieldsResult,
          fieldTypesChoice: choicesResult.fields,
          detailData: detailData ?? null,
        });
      })
      .catch(console.error);
  }, []);

  const { getObjectOwner } = useSalesforceUsers();

  return (
    <LoggedInLayoutBasic
      pageTitle={t("salesforce.campaigns.pageTitle")}
      selectedItem={"Salesforce/Campaigns"}
      extraMainClass={"salesforce-table"}
    >
      {!booted ? (
        <ObjectsGridDummy title={t("salesforce.campaigns.pageTitle")} />
      ) : (
        <CampaignsDependencenciesProvider value={booted}>
          <CampaignsGridProvider
            getObjectUrl={api.getObjectUrl}
            getObjectOwner={getObjectOwner}
            getObjectConversation={api.getConversation}
            getObjectCount={api.getCount}
            fieldReader={
              new FieldReader(booted.fieldTypesScalar, booted.fieldTypesChoice)
            }
            pageSize={PAGE_SIZE}
            pagesPerGroup={PAGES_PER_STEP}
            initDetail={booted.detailData}
          >
            <CampaignsGrid
              pageSize={PAGE_SIZE}
              pagesPerGroup={PAGES_PER_STEP}
            />
          </CampaignsGridProvider>
        </CampaignsDependencenciesProvider>
      )}
    </LoggedInLayoutBasic>
  );
}

export default CampaignsScreen;
