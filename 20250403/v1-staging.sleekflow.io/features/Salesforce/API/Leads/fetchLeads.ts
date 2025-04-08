import {
  ObjectNormalizedType,
  EntityType,
  QueryOperatorType,
  CommonOperatorType,
  ObjectNormalizedExpandedType,
} from "../Objects/contracts";
import { fetchObjects } from "../Objects/fetchObjects";
import { FetchObjectsInterface } from "../../components/ObjectsGrid/ObjectsGridContextType";
import { fetchObjectsV2 } from "../Objects/fetchObjectsV2";

export const CampaignField = Symbol("Campaign");

export const fetchLeads: FetchObjectsInterface<LeadNormalizedType> =
  async function (filters, sorts, limit, offsetToken) {
    const filtersNormalized = filters;
    const campaignFilterIndex = filters.findIndex((group) => {
      return group.filters.some((f) => f.field_name === CampaignField);
    });

    if (campaignFilterIndex > -1) {
      const value = filters[campaignFilterIndex]?.filters.shift()?.value;
      if (typeof value === "string") {
        filtersNormalized.splice(campaignFilterIndex, 1, {
          filters: [
            {
              field_name: "unified:SalesforceIntegratorId",
              operator: "query",
              value: {
                entity_type_name: "CampaignMember",
                select: { field_name: "unified:SalesforceIntegratorLeadId" },
                filter_groups: [
                  {
                    filters: [
                      {
                        operator: "=",
                        value: value,
                        field_name: "unified:SalesforceIntegratorCampaignId",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        });
      }
      return await fetchObjectsV2(
        "Lead",
        filtersNormalized,
        sorts,
        limit,
        [],
        offsetToken
      );
    }

    return await fetchObjectsV2(
      "Lead",
      filtersNormalized,
      sorts,
      limit,
      [],
      offsetToken
    );
  };

export type LeadNormalizedType = ObjectNormalizedType & {
  [k: string]: any;
};
