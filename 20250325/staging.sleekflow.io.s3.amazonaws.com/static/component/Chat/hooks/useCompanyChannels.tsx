import { useCallback } from "react";
import {
  ChannelConfigTypeMap,
  ChannelConfiguredType,
} from "../Messenger/types";
import WebIcon from "../../../assets/images/channels/live-chat.svg";
import FacebookIcon from "../../../assets/images/facebook_messenger.svg";
import WhatsappIcon from "../../../assets/images/channels/whatsapp.svg";
import WeChatIcon from "../../../assets/images/channels/wechat.svg";
import LineIcon from "../../../assets/images/channels/line.svg";
import TwilioSmsIcon from "../../../assets/images/channels/sms.svg";
import CompanyType, { ShopifyConfigsType } from "../../../types/CompanyType";
import FacebookLeadAdsImg from "../../../assets/images/channels/facebook-lead-ads.svg";
import EmailImg from "../../../assets/images/channels/mail.svg";
import NoteImg from "../../../assets/images/channels/note.svg";
import WhatsappBusinessImg from "../../../assets/images/channels/whatsapp-business.svg";
import ChatAPIImg from "../../../assets/images/channels/chatapi.svg";
import TwilioImg from "../../../assets/images/channels/twilio.svg";
import InstagramImg from "../../../assets/images/channels/Instagram.svg";
import TelegramImg from "../../../assets/images/channels/telegram.svg";
import ViberImg from "../../../assets/images/channels/viber-filled.svg";
import { useChatChannelLocales } from "../localizable/useChatChannelLocales";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import { withChannel } from "component/Channel/useChannelsPageReducer";
import { useChannelLocales } from "component/Channel/localizable/useChannelLocales";
import ChannelInfoType, { toChannelInfoTypes } from "types/ChannelInfoType";

export default function useCompanyChannels(): ChannelConfiguredType<any>[] {
  const company = useAppSelector((s) => s.company, equals);

  const channelList = [];

  const messagingChannelFactory = useMessagingChannelFactory();
  const { channelNameDisplay } = useChatChannelLocales();

  if (company === undefined) {
    return [];
  }

  channelList.push({
    name: channelNameDisplay["web"],
    type: "web",
    image: WebIcon,
  } as ChannelConfiguredType<never>);

  const channels = [
    "whatsapp",
    "wechat",
    "facebook",
    "line",
    "twilio_whatsapp",
    "sms",
    "email",
    "instagram",
    "whatsapp360dialog",
    "viber",
    "telegram",
    "whatsappcloudapi",
  ] as (keyof ChannelConfigTypeMap)[];

  return channels.reduce<ChannelConfiguredType<any>[]>((acc, ch) => {
    const channelOption = messagingChannelFactory(ch, company);
    return channelOption ? [...acc, channelOption] : acc;
  }, channelList);
}

export function useCompanyChannelIntegrations(
  shopifyStatus?: ShopifyConfigsType[]
): {
  channelsIntegrations: ChannelInfoType[];
  commerceIntegrations: ChannelInfoType[];
  leadAdsIntegrations: ChannelInfoType[];
} {
  const company = useAppSelector((s) => s.company, equals);
  const companyChannels = useCompanyChannels();

  const {
    commerceChannelIntegrationList,
    channelPrototypeList,
    channelIntegrationList,
  } = useChannelLocales();
  const messagingChannelFactory = useMessagingChannelFactory(shopifyStatus);
  if (company === undefined) {
    return {
      channelsIntegrations: [],
      commerceIntegrations: [],
      leadAdsIntegrations: [],
    };
  }
  const integrationChannels = ["facebookLeadAds"];
  const channelsIntegrations = integrationChannels.reduce<
    ChannelConfiguredType<any>[]
  >((acc, ch) => {
    let channelOption = messagingChannelFactory(ch, company);
    return channelOption ? [...acc, channelOption] : acc;
  }, companyChannels);

  const commerceChannels = ["shopify", "whatsappCatalog"];
  //connected commerce channels
  const commerceIntegrations = commerceChannels.reduce<
    ChannelConfiguredType<any>[]
  >((acc, ch) => {
    let channelOption = messagingChannelFactory(ch, company);
    return channelOption ? [...acc, channelOption] : acc;
  }, companyChannels);

  //commerceChannelIntegrationList: can connect commerce channels
  const stripeIntegration = commerceChannelIntegrationList.find(
    (c) => c.name === "stripe"
  );
  const commerceList = commerceIntegrations.reduce(
    toChannelInfoTypes(commerceChannelIntegrationList, []),
    []
  );

  return {
    channelsIntegrations: channelsIntegrations.reduce(
      toChannelInfoTypes(channelPrototypeList, []),
      []
    ),
    commerceIntegrations:
      company.isStripePaymentEnabled && stripeIntegration
        ? withChannel(commerceList, stripeIntegration)
        : commerceList,
    leadAdsIntegrations: channelsIntegrations.reduce(
      toChannelInfoTypes(channelIntegrationList, []),
      []
    ),
  };
}

export function useCompanyChannelsWithIntegrations(
  shopifyStatus?: ShopifyConfigsType[]
): ChannelConfiguredType<any>[] {
  const company = useAppSelector((s) => s.company, equals);
  const companyChannels = useCompanyChannels();
  const messagingChannelFactory = useMessagingChannelFactory(shopifyStatus);
  if (company === undefined) {
    return [];
  }
  const integrationChannels = ["facebookLeadAds", "shopify"];

  return integrationChannels.reduce<ChannelConfiguredType<any>[]>((acc, ch) => {
    let channelOption = messagingChannelFactory(ch, company);
    return channelOption ? [...acc, channelOption] : acc;
  }, companyChannels);
}

function useMessagingChannelFactory(shopifyStatus?: ShopifyConfigsType[]) {
  const { channelNameDisplay } = useChatChannelLocales();

  return useCallback(
    (
      type: string,
      company: CompanyType | undefined
    ): ChannelConfiguredType<any> | undefined => {
      if (!company) {
        return undefined;
      }
      if (
        type === "shopify" &&
        company.shopifyConfigs &&
        company.shopifyConfigs.length > 0 &&
        shopifyStatus
      ) {
        return {
          name: channelNameDisplay["shopify"],
          type: "shopify",
          configs:
            shopifyStatus.length > 0 ? shopifyStatus : company.shopifyConfigs,
          image: iconFactory(type),
        };
      }
      const configs = getChannelConfigs(type, company);

      if (configs) {
        return {
          name: channelNameDisplay[type],
          type: type,
          configs: configs,
          image: iconFactory(type),
        };
      }

      return undefined;
    },
    [channelNameDisplay, shopifyStatus]
  );
}

function getChannelConfigs(
  type: string,
  company: CompanyType | undefined
): any[] | undefined {
  if (!company) {
    return;
  }
  if (
    type === "whatsapp" &&
    company.wsChatAPIConfigs &&
    company.wsChatAPIConfigs.length > 0
  ) {
    return [...company.wsChatAPIConfigs];
  }

  if (
    type === "whatsapp360dialog" &&
    company.whatsApp360DialogConfigs &&
    company.whatsApp360DialogConfigs.length > 0
  ) {
    return [...company.whatsApp360DialogConfigs];
  }

  if (type === "wechat" && company.weChatConfig) {
    return [company.weChatConfig];
  }

  if (
    type === "facebook" &&
    company.facebookConfigs &&
    company.facebookConfigs.length > 0
  ) {
    return [...company.facebookConfigs];
  }
  if (
    type === "instagram" &&
    company.instagramConfigs &&
    company.instagramConfigs.length > 0
  ) {
    return [...company.instagramConfigs];
  }

  if (
    type === "line" &&
    company.lineConfigs &&
    company.lineConfigs.length > 0
  ) {
    return [...company.lineConfigs];
  }

  if (
    type === "twilio_whatsapp" &&
    company.whatsAppConfigs &&
    company.whatsAppConfigs.length > 0
  ) {
    return [...company.whatsAppConfigs];
  }

  if (type === "sms" && company.smsConfigs && company.smsConfigs.length > 0) {
    return [...company.smsConfigs];
  }

  if (
    type === "facebookLeadAds" &&
    company.leadAdsFacebookConfigs &&
    company.leadAdsFacebookConfigs.length > 0
  ) {
    return [...company.leadAdsFacebookConfigs];
  }

  if (
    type === "whatsapp360dialog" &&
    company.whatsApp360DialogConfigs &&
    company.whatsApp360DialogConfigs.length > 0
  ) {
    return [...company.whatsApp360DialogConfigs];
  }

  if (
    type === "viber" &&
    company.viberConfigs &&
    company.viberConfigs.length > 0
  ) {
    return [...company.viberConfigs];
  }

  if (
    type === "telegram" &&
    company.telegramConfigs &&
    company.telegramConfigs.length > 0
  ) {
    return [...company.telegramConfigs];
  }

  if (type === "email" && company.emailConfig) {
    return [company.emailConfig];
  }

  if (
    type === "whatsappcloudapi" &&
    (company.whatsappCloudApiConfigs ?? []).length > 0
  ) {
    return [...(company.whatsappCloudApiConfigs ?? [])];
  }

  const catalogInfo =
    company.whatsappCloudApiConfigs?.filter((c) => c.productCatalogSetting) ??
    [];
  if (
    type === "whatsappCatalog" &&
    (company.whatsappCloudApiConfigs ?? []).length > 0 &&
    catalogInfo.length > 0
  ) {
    return [...catalogInfo];
  }
}

export function iconFactory(type: string) {
  return (
    {
      whatsapp: WhatsappIcon,
      wechat: WeChatIcon,
      sms: TwilioSmsIcon,
      twilio_whatsapp: WhatsappIcon,
      line: LineIcon,
      web: WebIcon,
      facebook: FacebookIcon,
      facebookLeadAds: FacebookLeadAdsImg,
      email: EmailImg,
      note: NoteImg,
      whatsappBusiness: WhatsappBusinessImg,
      twilio: TwilioImg,
      chatapi: ChatAPIImg,
      instagram: InstagramImg,
      telegram: TelegramImg,
      viber: ViberImg,
      whatsapp360dialog: WhatsappIcon,
      whatsappcloudapi: WhatsappIcon,
      sandbox: WhatsappIcon,
    }[type] ?? undefined
  );
}
