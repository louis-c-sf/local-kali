import { post } from "../../../../api/apiRequest";
import {
  ExpandTypeV2,
  RequestType,
  ResponseType,
  ObjectNormalizedExpandedType,
} from "../Objects/contracts";

export async function fetchCampaignByLead<TExpands extends string>(
  leadsIds: string[],
  limit: number,
  expands: ExpandTypeV2[],
  offsetToken?: string
): Promise<ResponseType<ObjectNormalizedExpandedType<TExpands>>> {
  const request: RequestType = {
    entity_type_name: "Campaign",
    continuation_token: offsetToken ?? null,
    limit: limit,
    filter_groups: [
      {
        filters: [
          {
            field_name: "unified:SalesforceIntegratorId",
            value: {
              entity_type_name: "CampaignMember",
              filter_groups: [
                {
                  filters: [
                    {
                      field_name: "unified:SalesforceIntegratorLeadId",
                      value: leadsIds,
                      operator: "in",
                    },
                  ],
                },
              ],
              select: {
                field_name: "unified:SalesforceIntegratorCampaignId",
              },
            },
            operator: "query",
          },
        ],
      },
    ],
    sorts: [
      {
        field_name: "unified:Name",
        direction: "desc",
        is_case_sensitive: false,
      },
    ],
    expands,
  };

  return await post("/CrmHub/GetObjectsV2", { param: request });
}
