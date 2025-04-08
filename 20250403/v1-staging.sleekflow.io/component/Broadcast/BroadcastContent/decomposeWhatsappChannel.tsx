import { ChannelConfiguredType, ChannelType } from "../../Chat/Messenger/types";
import {
  TargetedChannelType,
  ChannelMessageType,
} from "../../../types/BroadcastCampaignType";
import { ChannelMessageWithoutTargetedChannel } from "./BroadcastContent";

export function decomposeWhatsappChannel(
  companyWhatsappChannels: ChannelConfiguredType<any>[],
  broadcastChannel: TargetedChannelType,
  content: ChannelMessageWithoutTargetedChannel
): ChannelMessageType[] {
  const filterCompanyOfficialChannelIds = companyWhatsappChannels
    .filter((chnl) => chnl.type === "twilio_whatsapp")
    .reduce(
      (officialIds: string[], curr) => [
        ...officialIds,
        ...(curr.configs?.map((config) => config.twilioAccountId) ?? []),
      ],
      []
    );
  const filterChatApiChannelIds = companyWhatsappChannels
    .filter((chnl) => chnl.type === "whatsapp")
    .reduce(
      (chatapiIds: string[], curr) => [
        ...chatapiIds,
        ...(curr.configs?.map((config) => config.wsChatAPIInstance) ?? []),
      ],
      []
    );
  let whatsappChannelMessages: ChannelMessageType[] = [];
  if (
    broadcastChannel.ids?.some((id) =>
      filterCompanyOfficialChannelIds.includes(id)
    )
  ) {
    whatsappChannelMessages = [
      ...whatsappChannelMessages,
      {
        ...content,
        isSelectedTemplate: false,
        targetedChannelWithIds: [
          {
            channel: "twilio_whatsapp" as ChannelType,
            ids: broadcastChannel.ids?.filter((id) =>
              filterCompanyOfficialChannelIds.includes(id)
            ),
          },
        ],
      },
    ];
  }
  if (
    broadcastChannel.ids?.some((id) => filterChatApiChannelIds.includes(id))
  ) {
    whatsappChannelMessages = [
      ...whatsappChannelMessages,
      {
        ...content,
        isSelectedTemplate: false,
        targetedChannelWithIds: [
          {
            channel: "whatsapp" as ChannelType,
            ids: broadcastChannel.ids?.filter((id) =>
              filterChatApiChannelIds.includes(id)
            ),
          },
        ],
      },
    ];
  }
  if (whatsappChannelMessages.length === 0) {
    if (filterCompanyOfficialChannelIds.length > 0) {
      const [firstOfficialChannel] = filterCompanyOfficialChannelIds;
      whatsappChannelMessages = [
        ...whatsappChannelMessages,
        {
          ...content,
          isSelectedTemplate: false,
          targetedChannelWithIds: [
            {
              channel: "twilio_whatsapp" as ChannelType,
              ids: [firstOfficialChannel],
            },
          ],
        },
      ];
    } else {
      const [firstChatApiId] = filterChatApiChannelIds;
      whatsappChannelMessages = [
        ...whatsappChannelMessages,
        {
          ...content,
          isSelectedTemplate: false,
          targetedChannelWithIds: [
            {
              channel: "whatsapp" as ChannelType,
              ids: [firstChatApiId],
            },
          ],
        },
      ];
    }
  }
  return whatsappChannelMessages;
}
