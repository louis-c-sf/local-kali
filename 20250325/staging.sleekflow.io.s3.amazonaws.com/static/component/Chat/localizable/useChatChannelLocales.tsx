import { useTranslation } from "react-i18next";
import { HasChannelConfig } from "../../../types/ChannelInfoType";
import {
  findConfigInCompany,
  parseAndFormatAnyPhone,
} from "../../Channel/selectors";
import { ChannelOptionValueType } from "../../shared/ChannelsValueDropdown";
import {
  ChannelConfigTypeMap,
  ChannelConfiguredType,
  ChannelType,
} from "../Messenger/types";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { ProfileType } from "../../../types/LoginType";
import ProfileSearchType from "../../../types/ProfileSearchType";
import { getProfileChannels } from "../../Contact/ContactsTable";
import { iconFactory } from "../hooks/useCompanyChannels";
import { useCallback, useMemo } from "react";
import { parseWhatsappChatApiPhone } from "./parseWhatsappChatApiPhone";
import { WhatsappAccessLevel } from "../../CreateWhatsappFlow/WhatsappAccessLabel";
import { use360DialogApiLocales } from "../../CreateWhatsappFlow/use360DialogApiLocales";

export function useChatChannelLocales() {
  const { t, i18n } = useTranslation();

  const channelNameDisplay: Record<keyof ChannelConfigTypeMap, string> =
    useMemo(
      () => ({
        facebook: t("channels.display.facebook"),
        line: t("channels.display.line"),
        wechat: t("channels.display.wechat"),
        whatsapp: t("channels.display.whatsapp"),
        twilio_whatsapp: t("channels.display.whatsapp"),
        "twilio whatsapp": t("channels.display.whatsapp"),
        instagram: t("channels.display.instagram"),
        sms: t("channels.display.sms"),
        twiliosms: t("channels.display.sms"),
        email: t("channels.display.email"),
        web: t("channels.display.web"),
        webclient: t("channels.display.web"),
        shopify: t("channels.display.shopify"),
        note: t("channels.display.note"),
        facebookLeadAds: t("channels.display.facebookLeadAds"),
        all: t("channels.display.all"),
        whatsapp360dialog: t("channels.display.whatsapp"),
        viber: t("channels.display.viber"),
        telegram: t("channels.display.telegram"),
        sandbox: t("channels.display.sandbox"),
        whatsappcloudapi: t("channels.display.whatsapp"),
        whatsappCatalog: t("channels.display.whatsappCatalog"),
      }),
      [i18n.language]
    );

  const { titleMap: whatsapp360DialogStatusMap } = use360DialogApiLocales();

  const broadcastChannelNameDisplay = useMemo(
    () => ({
      ...channelNameDisplay,
      note: t("channels.display.broadcast.note"),
      twilio_whatsapp: t("channels.display.broadcast.twilioWhatsapp"),
      whatsapp360dialog: t("channels.display.broadcast.whatsapp360dialog"),
      whatsapp: t("channels.display.broadcast.whatsapp"),
    }),
    [i18n.language, channelNameDisplay]
  );

  function getConfigName(channel: HasChannelConfig<any>): string | undefined {
    if (!channel.config) {
      return undefined;
    }

    switch (channel.name) {
      case "wechat":
        return (channel as HasChannelConfig<"wechat">).config?.name;
      case "whatsapp":
        let name = (channel as HasChannelConfig<"whatsapp">).config?.name;
        if (!name) {
          const phoneParsed = parseWhatsappChatApiPhone(channel.config);
          return phoneParsed || channel.config.whatsAppSender;
        }
        return name;
      case "sms":
        return (channel as HasChannelConfig<"sms">).config?.name;
      case "twilio_whatsapp":
        return (channel as HasChannelConfig<"twilio_whatsapp">).config?.name;
      case "email":
        return (channel as HasChannelConfig<"email">).config?.email;
      case "facebook":
        return (channel as HasChannelConfig<"facebook">).config?.pageName;
      case "line":
        return (channel as HasChannelConfig<"line">).config?.name;
      case "instagram":
        return (channel as HasChannelConfig<"instagram">).config?.name;
      case "shopify":
        return (channel as HasChannelConfig<"shopify">).config?.name;
      case "web":
        return t("channels.display.web");
      case "whatsapp360dialog":
        return (channel as HasChannelConfig<"whatsapp360dialog">).config
          ?.channelName;
      case "whatsappcloudapi":
        return (channel as HasChannelConfig<"whatsappcloudapi">).config
          ?.channelName;
      case "telegram":
        return (channel as HasChannelConfig<"telegram">).config?.displayName;
      default:
        return undefined;
    }
  }

  function getPhoneNumber(channel: HasChannelConfig<any>): string | undefined {
    if (!channel.config) {
      return undefined;
    }
    switch (channel.name) {
      case "whatsappcloudapi":
        return parseAndFormatAnyPhone(
          (channel as HasChannelConfig<"whatsappcloudapi">).config
            ?.whatsappPhoneNumber ?? ""
        );
      default:
        return undefined;
    }
  }

  const toChannelNames = useCallback(
    (channels: ChannelConfiguredType<any>[]) =>
      (all: string[], c: TargetedChannelType): string[] => {
        if (c.ids) {
          c.ids.forEach((id) => {
            let configName = getConfigName({
              name: c.channel,
              config: findConfigInCompany(channels, c.channel, id),
            });
            configName && all.push(configName);
          });
        } else {
          if (channels.some((ch) => ch.type === c.channel)) {
            all.push(channelNameDisplay[c.channel] ?? c.channel);
          }
        }
        return all;
      },
    [channelNameDisplay]
  );

  const toChannelTypeWithNames = useCallback(
    (channels: ChannelConfiguredType<any>[]) =>
      (
        prev: ChannelConfiguredType<any>[],
        next: TargetedChannelType
      ): ChannelConfiguredType<any>[] => {
        if (next.ids) {
          next.ids.forEach((id) => {
            const config = findConfigInCompany(channels, next.channel, id);
            let configName = getConfigName({
              name: next.channel,
              config,
            });
            configName &&
              prev.push({
                name: configName,
                configs: config,
                type: next.channel,
                image: iconFactory(next.channel),
              });
          });
        } else {
          if (channels.some((ch) => ch.type === next.channel)) {
            prev.push({
              name: channelNameDisplay[next.channel] ?? next.channel,
              type: next.channel,
              image: iconFactory(next.channel),
            });
          }
        }
        return prev;
      },
    [channelNameDisplay]
  );

  const getProfileLastChannelName = useCallback(
    (
      lastChannel: string,
      companyChannels: ChannelConfiguredType<any>[],
      profile: ProfileType | ProfileSearchType
    ) => {
      if (!lastChannel) {
        return "";
      }
      const profileChannelName = getProfileChannels(profile)
        .filter((profileChannel) => profileChannel.channel === lastChannel)
        .reduce<string[]>(toChannelNames(companyChannels), [])
        .join("");
      const needsExtraName = [
        "whatsapp",
        "facebook",
        "whatsapp360dialog",
        "whatsappcloudapi",
      ].includes(lastChannel);
      return (
        channelNameDisplay[lastChannel.toLowerCase()] +
        (needsExtraName && profileChannelName ? ` - ${profileChannelName}` : "")
      );
    },
    [channelNameDisplay]
  );

  const optionText = useCallback(
    (
      channel: ChannelOptionValueType,
      companyChannels: ChannelConfiguredType<any>[]
    ) => {
      let text = channelNameDisplay[channel.type] ?? channel.type;
      if (channel.id) {
        let config = findConfigInCompany(
          companyChannels,
          channel.type as ChannelType,
          channel.id
        );
        if (config) {
          text =
            getConfigName({
              name: channel.type as ChannelType,
              config: config,
            }) ?? text;
        }
      }
      return text;
    },
    [channelNameDisplay]
  );
  const optionPhoneNumber = useCallback(
    (
      channel: ChannelOptionValueType,
      companyChannels: ChannelConfiguredType<any>[]
    ) => {
      let text = channelNameDisplay[channel.type] ?? channel.type;
      if (channel.id) {
        let config = findConfigInCompany(
          companyChannels,
          channel.type as ChannelType,
          channel.id
        );
        if (config) {
          text =
            getPhoneNumber({
              name: channel.type as ChannelType,
              config: config,
            }) ?? text;
        }
      }
      return text;
    },
    [channelNameDisplay]
  );
  const channelStatusMapping = useMemo(
    () => ({
      "": t("channels.status.initial"),
      None: t("channels.status.none"),
      Authenticated: t("channels.status.authenticated"),
      Loading: t("channels.status.loading"),
      ReconnectInstance: t("channels.status.loading"),
      Rebooting: t("channels.status.rebooting"),
      Syncing: t("channels.status.syncing"),
      Synced: t("channels.status.synced"),
      QueueIsFull: t("channels.status.queueIsFull"),
      NoHistory: t("channels.status.noHistory"),
      Invalid: t("channels.status.invalid"),
    }),
    [i18n.language]
  );

  const statusTooltips = useMemo(
    () => ({
      whatsapp360dialog: {
        [WhatsappAccessLevel.Unknown]: [
          t("channels.statusTooltip.360Dialog.unknown"),
        ],
        [WhatsappAccessLevel.Standard]: [
          t("channels.statusTooltip.360Dialog.standardItem1"),
          t("channels.statusTooltip.360Dialog.standardItem2"),
          t("channels.statusTooltip.360Dialog.standardItem3"),
        ],
        [WhatsappAccessLevel.BasicTrial]: [
          t("channels.statusTooltip.360Dialog.basicTrialItem1"),
          t("channels.statusTooltip.360Dialog.basicTrialItem2"),
        ],
        [WhatsappAccessLevel.ExpandedTrial]: [
          t("channels.statusTooltip.360Dialog.expandedTrialItem1"),
          t("channels.statusTooltip.360Dialog.expandedTrialItem2"),
        ],
        [WhatsappAccessLevel.LimitedAccess]: [
          t("channels.statusTooltip.360Dialog.limitedAccessItem1"),
          t("channels.statusTooltip.360Dialog.limitedAccessItem2"),
          t("channels.statusTooltip.360Dialog.limitedAccessItem3"),
        ],
      },
      whatsapp: {
        "": t("channels.statusTooltip.whatsapp.initial"),
        None: t("channels.statusTooltip.whatsapp.none"),
        Authenticated: t("channels.statusTooltip.whatsapp.authenticated"),
        Synced: t("channels.statusTooltip.whatsapp.authenticated"),
        QueueIsFull: t("channels.statusTooltip.whatsapp.queueIsFull"),
        Loading: t("channels.statusTooltip.whatsapp.loading"),
        ReconnectInstance: t(
          "channels.statusTooltip.whatsapp.reconnectInstance"
        ),
        Rebooting: t("channels.statusTooltip.whatsapp.rebooting"),
        Syncing: t("channels.statusTooltip.whatsapp.syncing"),
        NoHistory: t("channels.statusTooltip.whatsapp.noHistory"),
      },
      facebook: {
        Authenticated: t("channels.statusTooltip.facebook.authenticated"),
        Invalid: t("channels.statusTooltip.facebook.invalid"),
        Syncing: t("channels.statusTooltip.facebook.syncing"),
      },
    }),
    [i18n.language]
  );

  return {
    channelStatusMapping,
    statusTooltips,
    channelNameDisplay,
    broadcastChannelNameDisplay,
    optionText,
    toChannelNames,
    getProfileLastChannelName,
    toChannelTypeWithNames,
    getConfigName,
    optionPhoneNumber,
  };
}
