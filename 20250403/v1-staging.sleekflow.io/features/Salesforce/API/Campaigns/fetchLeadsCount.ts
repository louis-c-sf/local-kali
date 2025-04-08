import { postWithExceptions } from "../../../../api/apiRequest";
import { EntityType } from "../Objects/contracts";

export interface ObjectCountType {
  id: string;
  count: number;
}

interface ResponseType {
  aggregated_counts: Array<{
    count: number;
    "unified:CampaignId": string;
  }>;
  count: number;
}

export async function fetchLeadsCount(
  campaignIntegratorIds: string[]
): Promise<Array<ObjectCountType>> {
  const result: ResponseType = await postWithExceptions(
    "/CrmHub/GetObjectsCountV2",
    {
      param: {
        entity_type_name: "CampaignMember",
        filter_groups: [
          {
            filters: [
              {
                field_name: "unified:SalesforceIntegratorLeadId",
                operator: "!=",
                value: null,
              },
            ],
          },
          {
            filters: [
              {
                field_name: "unified:SalesforceIntegratorCampaignId",
                operator: "in",
                value: campaignIntegratorIds,
              },
            ],
          },
        ],
        group_bys: [
          {
            field_name: "unified:SalesforceIntegratorCampaignId",
            is_case_sensitive: true,
          },
        ],
      },
    }
  );

  return result.aggregated_counts.map((count) => ({
    count: count.count,
    id: count["unified:SalesforceIntegratorCampaignId"],
  }));
}
