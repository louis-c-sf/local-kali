import CompanyType from "../../types/CompanyType";
import {
  parsePhoneNumberFromString,
  parsePhoneNumberWithError,
} from "libphonenumber-js";
import moment from "moment";
import ChannelInfoType, {
  ChannelInfoConfiguredType,
  HasChannelConfig,
} from "../../types/ChannelInfoType";
import {
  ChannelConfigTypeMap,
  ChannelConfiguredType,
  ChannelType,
} from "../Chat/Messenger/types";
import { TargetedChannelType } from "../../types/BroadcastCampaignType";
import { parseWhatsappChatApiPhone } from "../Chat/localizable/parseWhatsappChatApiPhone";
import { isObject } from "lodash-es";

export function getWhatsappPhone(channel: ChannelInfoConfiguredType<any>) {
  if (channel.name === "whatsappcloudapi") {
    return channel.config?.whatsappPhoneNumber;
  }
  if (channel.name === "whatsapp360dialog") {
    return parseAndFormatAnyPhone(channel.config?.whatsAppPhoneNumber);
  } else {
    return parseWhatsappChatApiPhone(channel.config.whatsAppSender);
  }
}

export function getChannelLabels(channel: ChannelInfoConfiguredType<any>) {
  let labels: string[] = [];
  const channelName = channel.name;

  switch (channelName) {
    case "facebook":
    case "facebookLeadAds": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.pageName ?? ""];
      break;
    }

    case "whatsapp": {
      let config = castConfig<typeof channelName>(channel);
      let sender;
      if (config) {
        const phoneParsed = getWhatsappPhone(channel);
        if (channel.name === "whatsapp360dialog") {
          sender = channel.config.whatsAppPhoneNumber;
        } else {
          sender = config.whatsAppSender;
        }
        if (phoneParsed || sender) {
          labels.push(phoneParsed || sender);
        }
      }
      break;
    }
    case "wechat": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.name ?? config?.appId ?? ""];
      break;
    }
    case "line": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.name ?? ""];
      labels.push(config?.basicId ?? "");
      break;
    }
    case "email": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.email ?? ""];
      break;
    }
    case "twilio_whatsapp": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.name ?? ""];
      const phoneParsed = parseAndFormatAnyPhone(
        config?.whatsAppSender?.replace(/whatsapp:/i, "") ?? ""
      );
      labels.push(phoneParsed ?? "");
      break;
    }
    case "whatsapp360dialog":
      let config = castConfig<typeof channelName>(channel);
      const phoneParsed = parseAndFormatAnyPhone(
        config?.whatsAppPhoneNumber ?? ""
      );
      labels.push(phoneParsed ?? "");
      break;
    case "shopify": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.usersMyShopifyUrl ?? ""];
      break;
    }
    case "instagram": {
      let config = castConfig<typeof channelName>(channel);
      labels = [`@${config?.name}` ?? ""];
      break;
    }
    case "viber": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.displayName ?? ""];
      break;
    }
    case "telegram": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.displayName ?? ""];
      break;
    }
    case "whatsappcloudapi": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.channelName ?? ""];
      const phoneParsed = parseAndFormatAnyPhone(
        config?.whatsappPhoneNumber ?? ""
      );
      labels.push(phoneParsed ?? "");
      break;
    }
    case "sms": {
      let config = castConfig<typeof channelName>(channel);
      labels = [config?.name ?? ""];
      const phoneParsed = parseAndFormatAnyPhone(config?.smsSender ?? "");
      if (phoneParsed) {
        labels.push(phoneParsed ?? "");
      }
      break;
    }
  }

  return labels.filter(Boolean);
}

export function parseAndFormatAnyPhone(match: string) {
  try {
    const phoneParsed = parsePhoneNumberFromString(
      `+${match.replace(/\D/, "")}`,
      "HK"
    );
    if (
      !phoneParsed?.isValid() &&
      phoneParsed?.countryCallingCode === "852" &&
      phoneParsed.nationalNumber.length === 8
    ) {
      const allowedPhoneNumber = ["4", "7", "8"];
      return allowedPhoneNumber.some((s) =>
        phoneParsed.nationalNumber.startsWith(s)
      )
        ? phoneParsed.formatInternational()
        : undefined;
    }
    return phoneParsed?.isValid()
      ? phoneParsed.formatInternational()
      : undefined;
  } catch (e) {
    console.debug(`Error parsing phone number: ${match}`, e);
  }
}

export function castConfig<T extends keyof ChannelConfigTypeMap>(
  channel: ChannelInfoConfiguredType<T>
) {
  return channel.config;
}

export function getConfigId(
  channel: HasChannelConfig<any>
): string | undefined {
  if (!channel.config) {
    return undefined;
  }
  switch (channel.name) {
    case "wechat":
      return (channel as HasChannelConfig<"wechat">).config?.appId;
    case "whatsapp":
      return (channel as HasChannelConfig<"whatsapp">).config
        ?.wsChatAPIInstance;
    case "sms":
      return (channel as HasChannelConfig<"sms">).config?.twilioAccountId;
    case "twilio_whatsapp":
      return (channel as HasChannelConfig<"twilio_whatsapp">).config
        ?.twilioAccountId;
    case "email":
      return (channel as HasChannelConfig<"email">).config?.email;
    case "facebook":
    case "facebookLeadAds":
      return (channel as HasChannelConfig<"facebook">).config?.pageId;
    case "instagram":
      return (channel as HasChannelConfig<"instagram">).config?.instagramPageId;
    case "shopify":
      return `${(channel as HasChannelConfig<"shopify">).config?.id}`;
    case "line":
      return (channel as HasChannelConfig<"line">).config?.channelID;
    case "whatsapp360dialog":
      return `${(channel as HasChannelConfig<"whatsapp360dialog">).config?.id}`;
    case "whatsappcloudapi":
      return `${
        (channel as HasChannelConfig<"whatsappcloudapi">).config
          ?.whatsappPhoneNumber
      }`;
    case "viber":
      return `${(channel as HasChannelConfig<"viber">).config?.id}`;
    case "telegram":
      return `${
        (channel as HasChannelConfig<"telegram">).config?.telegramBotId
      }`;
    default:
      return undefined;
  }
}

export function is360DialogConfig(
  c: ChannelConfigTypeMap[keyof ChannelConfigTypeMap]
): c is ChannelConfigTypeMap["whatsapp360dialog"] {
  if (!isObject(c)) {
    return false;
  }

  return (
    (c as ChannelConfigTypeMap["whatsapp360dialog"])
      ?.whatsAppChannelSetupName !== undefined &&
    (c as ChannelConfigTypeMap["whatsapp360dialog"]).wabaStatus !== undefined
  );
}

export function getExpiryDates(channelName: string, company: CompanyType) {
  const utcOffsetInHour = company?.timeZoneInfo.baseUtcOffsetInHour || 0;
  switch (channelName.toLowerCase()) {
    case "whatsapp":
      return (company?.wsChatAPIConfigs ?? []).map((config) => {
        const today = moment.utc(config.expireDate).utcOffset(utcOffsetInHour);
        const daysPassed = moment
          .utc()
          .subtract(7, "days")
          .utcOffset(utcOffsetInHour);

        return (
          Boolean(config.whatsAppSender) &&
          config.isTrial &&
          today.diff(daysPassed) > 0
        );
      });
    default:
      return [];
  }
}

type ChannelFilterType = (testChannel: ChannelInfoType) => boolean;

function getChannelNameLowercase(channel: ChannelInfoType | string) {
  if (typeof channel === "string") {
    return channel.toLowerCase();
  } else {
    return channel.name.toLowerCase();
  }
}

export function nameMatches(
  channel: ChannelInfoType | string
): ChannelFilterType {
  const name = getChannelNameLowercase(channel);
  return (testChannel) => testChannel.name.toLowerCase() === name;
}

export function nameNotMatches(
  channel: ChannelInfoType | string
): ChannelFilterType {
  const name = getChannelNameLowercase(channel);
  return (testChannel) => testChannel.name.toLowerCase() !== name;
}

export function findConfigInCompany(
  companyChannels: ChannelConfiguredType<any>[],
  type: ChannelType,
  id: string
) {
  const searchTypes = Object.entries(MERGE_ALIASES)
    .filter(([from, to]) => to === type)
    .reduce<string[]>((aliases, [from]) => [...aliases, from], [type]);

  return companyChannels
    .filter((c) => searchTypes.includes(c.type))
    .reduce<any[]>((configs, c) => [...configs, ...(c.configs ?? [])], [])
    .find((config) => {
      return searchTypes.some((sType) => {
        return (
          id ===
          getConfigId({
            name: sType as ChannelType,
            config,
          })
        );
      });
    });
}

export const MERGE_ALIASES: { [from: string]: ChannelType } = {
  twilio_whatsapp: "whatsapp",
};

export function aliasChannelName(name: ChannelType) {
  return MERGE_ALIASES[name] ?? name;
}

export function splitDefaultChannel(channelsWithId: TargetedChannelType) {
  return (
    channels: TargetedChannelType[],
    c: TargetedChannelType
  ): TargetedChannelType[] => {
    if (c.channel === channelsWithId.channel) {
      if (c.ids && channelsWithId.ids) {
        const ids = c.ids.filter(
          (id) => channelsWithId.ids?.indexOf(id) === -1
        );
        if (ids.length > 0) {
          channels.push({ channel: c.channel, ids });
        }
      }
    } else {
      channels.push({ ...c });
    }
    return channels;
  };
}
