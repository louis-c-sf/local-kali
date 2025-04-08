import { post } from "api/apiRequest";
import { POST_BROADCAST } from "api/apiPath";
import React from "react";
import {
  ChannelMessageType,
  TargetedChannelType,
} from "types/BroadcastCampaignType";
import { BroadcastResponseType } from "api/Broadcast/fetchBroadcastCampaign";
import { buildSaveCampaignRequest } from "api/Broadcast/buildSaveCampaignRequest";
import { submitUpdateCampaign } from "api/Broadcast/submitUpdateCampaign";
import { uploadedFiles } from "./uploadedFiles";
import { AutomationActionType } from "types/AutomationActionType";
import CompanyType from "../../../types/CompanyType";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { getCompanyCustomFieldNames } from "container/Contact/hooks/useCustomProfileFields";

export async function saveCampaign(
  id: string | undefined,
  name: string,
  contactLists: number[] | undefined,
  channelsWithIds: TargetedChannelType[],
  campaignChannelMessages: ChannelMessageType[],
  automationActions: AutomationActionType[],
  company: CompanyType,
  scheduledAt?: string,
  stripePaymentRequestOption?: PaymentLinkSetType
) {
  const fieldNames = getCompanyCustomFieldNames(company);
  const param = buildSaveCampaignRequest(
    campaignChannelMessages,
    stripePaymentRequestOption
      ? ["payment_url", ...fieldNames]
      : [...fieldNames],
    contactLists,
    name,
    channelsWithIds,
    automationActions,
    company,
    scheduledAt,
    stripePaymentRequestOption
  );
  let result: BroadcastResponseType = {
    id: "",
    templateContent: "",
    targetedChannels: [],
    targetedChannelWithIds: [],
    status: "",
    templateName: "",
    conditions: [
      {
        conditionOperator: "",
        nextOperator: "And",
        values: [""],
        fieldName: "",
      },
    ],
    templateParams: [],
    createdAt: "",
    updatedAt: "",
    companyId: "",
    uploadedFiles: [],
    campaignChannelMessages: [],
    isBroadcastOn: false,
    campaignAutomationActions: [],
  };
  try {
    if (id) {
      result = await submitUpdateCampaign(id, param);
      await uploadedFiles(result, campaignChannelMessages);
    } else {
      result = await post(POST_BROADCAST, { param });
      if (result.id) {
        await uploadedFiles(result, campaignChannelMessages);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return result;
}
