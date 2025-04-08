import { ChannelConfiguredType, ChannelType } from "../../Chat/Messenger/types";
import { BroadcastResponseType } from "../../../api/Broadcast/fetchBroadcastCampaign";
import {
  ChannelMessageType,
  TargetedChannelType,
} from "../../../types/BroadcastCampaignType";
import { transformToEditableContent } from "./transformToEditableContent";
import { formatDenormalizedCampaignChannelMessage } from "./formatDenormalizedCampaignChannelMessage";
import { decomposeWhatsappChannel } from "./decomposeWhatsappChannel";
import { ChannelMessageWithoutTargetedChannel } from "./BroadcastContent";
import { FacebookOTNBroadcastMapType } from "features/Facebook/models/FacebookOTNTypes";

export function denormalizeCampaignChannelMessages(
  channels: ChannelConfiguredType<any>[],
  broadcast: BroadcastResponseType
): ChannelMessageType[] {
  if (broadcast.campaignChannelMessages?.length > 0) {
    const channelMessages = broadcast.campaignChannelMessages.reduce(
      (acc: ChannelMessageType[], curr) => {
        const filterChatApiChannelIds = channels
          .filter((chnl) => chnl.type === "twilio_whatsapp")
          .reduce(
            (officialIds: string[], curr) => [
              ...officialIds,
              ...(curr.configs?.map((config) => config.twilioAccountId) ?? []),
            ],
            []
          );
        if (
          curr.targetedChannels.some(
            (chnl) =>
              chnl.channel === "whatsapp" &&
              filterChatApiChannelIds.some((id) => chnl.ids?.includes(id))
          )
        ) {
          return [
            ...acc,
            {
              ...formatDenormalizedCampaignChannelMessage(curr),
              targetedChannelWithIds: curr.targetedChannels.map((chnl) => ({
                channel: "twilio_whatsapp" as ChannelType,
                ids: chnl.ids,
              })),
              ...(curr?.extendedMessagePayloadDetail && {
                extendedMessagePayloadDetail: curr.extendedMessagePayloadDetail,
              }),
              templateName: curr.templateName,
              ...(curr.officialTemplateParams && {
                officialTemplateParams: curr.officialTemplateParams,
              }),
            },
          ];
        } else if (
          curr.targetedChannels.some(
            (chnl) => chnl.channel === "whatsapp360dialog"
          ) &&
          curr.whatsApp360DialogExtendedCampaignMessage
        ) {
          return [
            ...acc,
            {
              ...formatDenormalizedCampaignChannelMessage(curr),
              templateName:
                curr.whatsApp360DialogExtendedCampaignMessage
                  .whatsapp360DialogTemplateMessage.templateName,
              targetedChannelWithIds: curr.targetedChannels,
              whatsApp360DialogExtendedCampaignMessage:
                curr.whatsApp360DialogExtendedCampaignMessage,
            },
          ];
        } else if (
          curr.targetedChannels.some((chnl) => chnl.channel === "facebook")
        ) {
          let facebookOTNPayload;
          if (curr.messageTag) {
            facebookOTNPayload = {
              tab: FacebookOTNBroadcastMapType.messageTag,
              option: curr.messageTag,
            };
          } else {
            facebookOTNPayload = {
              tab: FacebookOTNBroadcastMapType.facebookOTN,
              option: curr.facebookOTNTopicId ?? "",
            };
          }
          return [
            ...acc,
            {
              ...formatDenormalizedCampaignChannelMessage(curr),
              targetedChannelWithIds: curr.targetedChannels,
              facebookOTN: facebookOTNPayload,
            },
          ];
        } else if (
          curr.targetedChannels.some(
            (chnl) => chnl.channel === "whatsappcloudapi"
          ) &&
          curr.extendedMessagePayloadDetail
            ?.whatsappCloudApiTemplateMessageObject
        ) {
          const targetedChannelWithIds = curr.targetedChannels.map(
            (channel) => ({
              ...channel,
              ids: channel.ids,
            })
          );
          return [
            ...acc,
            {
              ...formatDenormalizedCampaignChannelMessage(curr),
              templateName:
                curr.extendedMessagePayloadDetail
                  .whatsappCloudApiTemplateMessageObject.templateName,
              targetedChannelWithIds,
              whatsappCloudApiTemplateMessageObject:
                curr.extendedMessagePayloadDetail
                  .whatsappCloudApiTemplateMessageObject,
            },
          ];
        }
        return [
          ...acc,
          {
            ...formatDenormalizedCampaignChannelMessage(curr),
            targetedChannelWithIds: curr.targetedChannels,
          },
        ];
      },
      []
    );
    return channelMessages;
  }

  const content = transformToEditableContent(
    broadcast.templateContent,
    broadcast.templateParams
  );

  const channelOfficialWhatsapp = broadcast.targetedChannelWithIds.reduce(
    (acc: ChannelMessageType[], curr: TargetedChannelType) => {
      const channelMessageContent: ChannelMessageWithoutTargetedChannel = {
        content: content,
        uploadedFiles: broadcast.uploadedFiles,
        params: broadcast.templateParams,
      };
      if (!curr.channel) {
        return acc;
      }
      if (curr.channel.toLowerCase() === "whatsapp") {
        return [
          ...acc,
          ...decomposeWhatsappChannel(channels, curr, channelMessageContent),
        ];
      }
      return [
        ...acc,
        {
          ...channelMessageContent,
          targetedChannelWithIds: [
            {
              channel: curr.channel,
              ids: curr.ids,
            },
          ],
        },
      ];
    },
    []
  );
  return channelOfficialWhatsapp;
}
