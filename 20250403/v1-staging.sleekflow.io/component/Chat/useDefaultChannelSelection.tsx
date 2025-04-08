import useCompanyChannels from "./hooks/useCompanyChannels";
import { useTransformChannelsToDropdown } from "./localizable/useTransformChannelsToDropdown";
import { useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";

export default function useDefaultChannelSelection() {
  const { transformChannelsToDropdown } = useTransformChannelsToDropdown();
  const companyChannels = useCompanyChannels();
  const channelsInit = transformChannelsToDropdown(companyChannels, true);
  let channels = channelsInit;
  const profile = useAppSelector((s) => s.profile, equals);

  if (profile?.id) {
    if (profile.whatsAppAccount?.is_group) {
      const updatedList = channelsInit.filter(
        (channel) =>
          channel.value === "whatsapp" &&
          channel.instanceId === profile.whatsAppAccount?.instanceId
      );
      channels = [...updatedList];
    } else {
      channels = channelsInit.filter((channel) => {
        if (
          [
            "whatsapp",
            "twilio_whatsapp",
            "whatsapp360dialog",
            "whatsappcloudapi",
          ].includes(channel.value)
        ) {
          if (
            (profile.whatsAppAccount && profile.whatsApp360DialogUser) ||
            profile.whatsAppAccount
          ) {
            return true;
          } else if (
            channel.value === "whatsapp360dialog" &&
            profile.whatsApp360DialogUser
          ) {
            return true;
          } else if (
            channel.value === "whatsappcloudapi" &&
            profile.whatsappCloudApiUser
          ) {
            return true;
          }
        } else if (channel.value === "facebook") {
          // only display the facebook channel that the message is sending from.
          return profile.facebookAccount?.pageId === channel.instanceId;
        } else if (channel.value === "line" && profile.lineUser) {
          return true;
        } else if (channel.value === "web" && profile.webClient) {
          return true;
        } else if (
          channel.value === "sms" &&
          (profile.smsUser || profile.whatsAppAccount)
        ) {
          return true;
        } else if (channel.value === "wechat" && profile.weChatUser) {
          return true;
        } else if (channel.value === "email" && profile.emailAddress) {
          return true;
        } else if (channel.value === "telegram" && profile.telegramUser) {
          return `${profile.telegramUser.telegramBotId}` === channel.instanceId;
        } else if (channel.value === "viber" && profile.viberUser) {
          return true;
        } else if (channel.value === "instagram" && profile.instagramUser) {
          return profile.instagramUser.instagramPageId === channel.instanceId;
        }
        return false;
      });
    }
  }
  return {
    channels,
  };
}
