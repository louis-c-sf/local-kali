import { OptionType } from "../../components/Filter/contracts";
import { fetchCampaigns } from "./fetchCampaigns";
import { fetchObjectFieldTypes } from "../Objects/fetchObjectFieldTypes";
import { FieldReader } from "../Objects/FieldReader/FieldReader";
import { useState } from "react";
import {
  ObjectNormalizedExpandedType,
  ObjectNormalizedType,
} from "../Objects/contracts";

export function useCampaignChoices() {
  const toOption = (campaign: ObjectNormalizedType) => {
    const name = campaign["unified:Name"] ?? "";
    const value = campaign["unified:SalesforceIntegratorId"] ?? "";
    return {
      title: name,
      value: value,
    };
  };

  async function bootCampaignChoices(): Promise<OptionType[]> {
    const [campaigns, campaignFields] = await Promise.all([
      fetchCampaigns([], [], 200),
      fetchObjectFieldTypes("Campaign"),
    ]);
    const reader = new FieldReader(campaignFields.fields, []);

    return campaigns.records.map<OptionType>(toOption);
  }

  return {
    boot: bootCampaignChoices,
    search: async (text: string) => {
      try {
        const result = await fetchCampaigns(
          [
            {
              filters: [
                {
                  field_name: "unified:Name",
                  value: text,
                  operator: "contains",
                },
              ],
            },
          ],
          [],
          40
        );
        return result.records.map(toOption);
      } catch (e) {
        console.error(e);
        return [];
      }
    },
  };
}
