import { ChannelMessageType } from "../../../types/BroadcastCampaignType";

interface WeChatBroadcastValidateProps {
  name: string;
  campaignChannelMessages: ChannelMessageType[];
}

interface Error {
  [key: string]: string;
}

export function validateWeChatBroadcast(
  value: WeChatBroadcastValidateProps,
  error: Error
) {
  const foundWeChatCampaignIndex = value.campaignChannelMessages.findIndex(
    (chnl) =>
      chnl.targetedChannelWithIds.some(
        (channel) => channel.channel === "wechat"
      )
  );
  if (foundWeChatCampaignIndex > -1) {
    let weChatError: Error = {};
    if (
      value.campaignChannelMessages[foundWeChatCampaignIndex].uploadedFiles
        .length === 0
    ) {
      weChatError = {
        ...weChatError,
        [`campaignChannelMessages[${foundWeChatCampaignIndex}].files`]:
          "missingFile",
      };
    }
    if (value.name.trim() === "") {
      weChatError = {
        ...weChatError,
        name: "missingTitle",
      };
    }
    return {
      ...error,
      ...weChatError,
    };
  }
  return error;
}
