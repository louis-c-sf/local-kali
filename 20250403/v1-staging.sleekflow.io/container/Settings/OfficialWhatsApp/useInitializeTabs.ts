import fetch360DialogWaba from "../../../api/Company/fetch360DialogWaba";
import {
  isWhatsApp360DialogConfigsType,
  WhatsAppCloudAPIByWabaIdConfigType,
} from "../../../types/CompanyType";
import { useChatChannelLocales } from "../../../component/Chat/localizable/useChatChannelLocales";
import { useTranslation } from "react-i18next";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import { ChannelTabType } from "../../../component/Settings/types/SettingTypes";
import fetchCloudAPIWaba from "api/Company/fetchCloudAPIWaba";
import { WhatsApp360DialogByWabaIdConfigs } from "types/LoginType";
import { useAppSelector } from "AppRootContext";

export default function useInitializeTabs(isDisplayedAutomation?: boolean) {
  const { broadcastChannelNameDisplay } = useChatChannelLocales();
  const { t } = useTranslation();
  const accessRuleGuard = useAccessRulesGuard();
  const twilioConfigs = useAppSelector((s) => s.company?.whatsAppConfigs ?? []);
  const has360Dialog = accessRuleGuard.is360DialogAccount();
  const hasCloudAPI = accessRuleGuard.isCloudAPIAccount();
  const hasTwilio = accessRuleGuard.isTwilioAccount();

  async function fetchTabs(): Promise<ChannelTabType[]> {
    function denormalizedWabaResponse(
      config: Array<
        WhatsApp360DialogByWabaIdConfigs | WhatsAppCloudAPIByWabaIdConfigType
      >
    ): ChannelTabType[] {
      return config.map((c, index) =>
        isWhatsApp360DialogConfigsType(c)
          ? {
              channel: `${broadcastChannelNameDisplay["whatsapp360dialog"]} ${
                index + 1
              }`,
              wabaId: c.wabaAccountId,
              facebookManagerId: undefined,
              is360Dialog: true,
              channelType: "whatsapp360dialog",
              isCloudAPI: false,
              ids: c.whatsApp360DialogConfigs.map((t) => t.id),
              config: c.whatsApp360DialogConfigs,
              phone: c.whatsApp360DialogConfigs[0].whatsAppPhoneNumber,
            }
          : {
              channel: c.wabaName,
              wabaId: c.wabaAccountId,
              facebookWabaId: c.facebookWabaId,
              facebookManagerId: c.facebookWabaBusinessId,
              is360Dialog: false,
              isCloudAPI: true,
              channelType: "whatsappcloudapi",
              ids: c.whatsappCloudApiConfigs.map((t) => t.id),
              config: c.whatsappCloudApiConfigs,
              phone: c.whatsappCloudApiConfigs[0].whatsappPhoneNumber,
            }
      );
    }

    let channelTabs: ChannelTabType[] = [];
    if (has360Dialog) {
      try {
        const result = await fetch360DialogWaba();
        channelTabs = denormalizedWabaResponse(
          result.whatsApp360DialogByWabaIdConfigs
        );
      } catch (e) {
        console.error(`fetch360DialogWaba error ${e}`);
      }
    }
    if (hasCloudAPI) {
      try {
        const result = await fetchCloudAPIWaba();
        channelTabs = [
          ...channelTabs,
          ...denormalizedWabaResponse(result.whatsappCloudApiByWabaIdConfigs),
        ];
      } catch (e) {
        console.error(`fetchCloudAPIWaba error ${e}`);
      }
    }
    if (hasTwilio && twilioConfigs[0] && !isDisplayedAutomation) {
      const twilioChannel: ChannelTabType = {
        channel: t("settings.templates.tab.twilio"),
        is360Dialog: false,
        isCloudAPI: false,
        channelType: "twilio_whatsapp",
        wabaId: "twilio",
        phone: twilioConfigs[0].whatsAppSender.replace("whatsapp:+", ""),
      };
      return [...channelTabs, twilioChannel];
    }
    return channelTabs;
  }

  return {
    fetchTabs,
    hasMultipleWhatsappProviders: ((has360Dialog && hasTwilio) ||
      has360Dialog ||
      hasCloudAPI) as boolean,
  };
}
