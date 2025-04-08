import { ProfileType } from "../../../types/LoginType";
import CompanyType from "../../../types/CompanyType";
import { useCallback } from "react";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";

export function useChatSelectors() {
  const company = useAppSelector((s) => s.company, equals);
  const getLastChannel = useCallback(
    (chat: ProfileType) => {
      return chat.lastChannel || getProfileChannel(chat, company);
    },
    [company]
  );

  const channel = useAppSelector((s) => {
    return s.profile.id && s.profile.isSandbox
      ? "whatsapp"
      : s.selectedChannelFromConversation ?? getLastChannel(s.profile);
  });

  return {
    /** @deprecated Replace with lastChannel ⬇️ */
    getLastChannel,
    lastChannel: channel,
  };
}

export function getProfileChannel(
  chat: ProfileType,
  company: CompanyType | undefined
): string {
  if (company) {
    if (
      (company.whatsAppConfigs && company.whatsAppConfigs.length > 0) ||
      (company.wsChatAPIConfigs && company.wsChatAPIConfigs.length > 0)
    ) {
      if (chat.whatsAppAccount) {
        return chat.whatsAppAccount.is_twilio ? "twilio_whatsapp" : "whatsapp";
      }
    }
    if (
      company.whatsApp360DialogConfigs &&
      company.whatsApp360DialogConfigs.length > 0
    ) {
      if (chat.whatsApp360DialogUser) {
        return "whatsapp360dialog";
      }
    }
    if (company.instagramConfigs && company.instagramConfigs.length > 0) {
      return chat.instagramUser ? "instagram" : "";
    }
    if (company.lineConfigs && company.lineConfigs.length > 0) {
      if (chat.lineUser) {
        return "line";
      }
    }
    if (company.weChatConfig) {
      if (chat.weChatUser) {
        return "wechat";
      }
    }
    if (company.facebookConfigs && company.facebookConfigs.length > 0) {
      if (chat.facebookAccount) {
        return "facebook";
      }
    }
    if (company.emailConfig) {
      if (chat.emailAddress) {
        return "email";
      }
    }
    if (company.smsConfigs && company.smsConfigs.length > 0) {
      if (chat.smsUser) {
        return "sms";
      }
    }
  }
  return "";
}

export function getChannelId(channelName: string, profile: ProfileType) {
  if (profile) {
    switch (channelName) {
      case "email":
        return profile.emailAddress && profile.emailAddress.email;
      case "sms":
        return (
          profile.smsUser?.id ?? `+${profile.whatsAppAccount?.phone_number}`
        );
      case "whatsapp":
      case "twilio_whatsapp":
        return profile.whatsAppAccount?.id;
      case "facebook":
        return profile.facebookAccount?.id;
      case "web":
        return profile.webClient?.webClientUUID;
      case "wechat":
        return profile.weChatUser?.openid;
      case "line":
        return profile.lineUser?.userId;
      case "instagram":
        return profile.instagramUser?.instagramPageId;
      case "whatsapp360dialog":
        return profile.whatsApp360DialogUser?.channelId;
      case "whatsappcloudapi":
        return profile.whatsappCloudApiUser?.whatsappChannelPhoneNumber;
      default:
        return "";
    }
  }
}

export function getChannelInstanceId(
  channelName: string,
  profile: ProfileType
) {
  if (profile) {
    switch (channelName) {
      case "whatsapp":
      case "twilio_whatsapp":
        return profile.whatsAppAccount?.instanceId;
      case "whatsappcloudapi":
        return profile.whatsappCloudApiUser?.whatsappChannelPhoneNumber;
      case "whatsapp360dialog":
        return profile.whatsApp360DialogUser?.channelId + "";
      case "facebook":
        return profile.facebookAccount?.pageId;
      case "instagram":
        return profile.instagramUser?.instagramPageId;
      case "telegram":
        return `${profile.telegramUser?.telegramBotId}`;
      default:
        return undefined;
    }
  }
  return undefined;
}
