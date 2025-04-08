import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router";
import SettingTemplateTwilio from "../../../component/Settings/SettingTemplates/Twilio/SettingTemplate";
import SettingTemplates from "../../../component/Settings/SettingTemplates/SettingTemplates";
import Helmet from "react-helmet";
import { useAppSelector } from "AppRootContext";
import { ChannelTabType } from "../../../component/Settings/types/SettingTypes";
import useInitializeTabs from "./useInitializeTabs";
import Setting360DialogTemplates from "../../../component/Settings/SettingTemplates/360Dialog/Setting360DialogTemplates";
import { SettingTemplatesTwilio } from "../../../component/Settings/SettingTemplates/Twilio/SettingTemplatesTwilio";
import { useLocation } from "react-router-dom";
import { InboxLocationStateType } from "../../../component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import useRouteConfig from "config/useRouteConfig";
import { useWhatsappTwilioChat } from "features/WhatsappTwilio/usecases/Inbox/useWhatsappTwilioChat";
import SettingCloudApiTemplates from "component/Settings/SettingTemplates/CloudApi/SettingCloudApiTemplates";
import SettingTemplateCloudApi from "component/Settings/SettingTemplates/CloudApi/EditTemplate";
import { useRequireRBAC } from "component/shared/useRequireRBAC";
import { PERMISSION_KEY } from "types/Rbac/permission";

export default function SettingTemplateMessage() {
  useRequireRBAC([PERMISSION_KEY.channelTemplateView]);

  const { templateId } = useParams<{ templateId: string }>();
  const location = useLocation<{ backToInbox: InboxLocationStateType }>();
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const whatsAppConfigs = useAppSelector((s) => s.company?.whatsAppConfigs);
  const companyId = useAppSelector((s) => s.company?.id);
  const { t } = useTranslation();
  const [channelSelected, setChannelSelected] = useState<ChannelTabType>();
  const [channels, setChannels] = useState<ChannelTabType[]>([]);
  const { fetchTabs, hasMultipleWhatsappProviders } = useInitializeTabs();
  const twilioChat = useWhatsappTwilioChat();
  const backState = location.state?.backToInbox;
  const searchParams = new URLSearchParams(location.search);
  const channelTabId = searchParams.get("id");

  let backUrl = "";
  if (backState) {
    const backUrlQuery = backState.query ? `?${backState.query}` : "";
    backUrl = `${routeTo(backState.path)}${backUrlQuery}`;
  }

  useEffect(() => {
    async function initializeTabs() {
      const result = await fetchTabs();
      setChannels(result);
      const foundChannel = channelTabId
        ? result.find((c) => c.wabaId === channelTabId)
        : undefined;
      if (channelTabId && foundChannel) {
        setChannelSelected(foundChannel);
      } else if (!channelTabId) {
        setChannelSelected(result[0]);
      } else {
        history.push(routeTo("/settings/templates"));
      }
    }

    try {
      if (companyId) {
        initializeTabs();
      }
    } catch (e) {
      console.error(`fetch360DialogWaba error ${e}`);
    }
  }, [companyId]);

  function selectChannel(channel: ChannelTabType) {
    setChannelSelected(channel);
  }

  const pageTitle = t("nav.menu.settings.templateManager");

  const getTemplates = () => {
    if (!channelSelected) {
      return null;
    }
    if (channelSelected.is360Dialog) {
      return (
        <Setting360DialogTemplates
          isCloudAPI={false}
          channelId={channelSelected?.ids?.[0]}
          wabaId={channelSelected?.facebookWabaId}
          facebookId={channelSelected.facebookManagerId}
        />
      );
    }
    if (channelSelected.isCloudAPI) {
      return <SettingCloudApiTemplates wabaId={channelSelected.wabaId} />;
    }
    return (
      <SettingTemplatesTwilio
        channel={channelSelected}
        whatsAppConfigs={whatsAppConfigs}
        accountSID={twilioChat.accountSid}
        backUrl={backUrl}
      />
    );
  };

  const getTemplate = () => {
    if (!channelSelected) {
      return null;
    }
    if (channelSelected.isCloudAPI) {
      return (
        <SettingTemplateCloudApi
          templateId={templateId}
          wabaId={channelSelected.wabaId}
          phone={channelSelected.phone}
        />
      );
    }
    return (
      <SettingTemplateTwilio
        accountSID={twilioChat.accountSid}
        templateId={templateId}
      />
    );
  };

  return (
    <>
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      {templateId ? (
        getTemplate()
      ) : (
        <SettingTemplates
          showTabs={
            channels.map((c) => c.wabaId).length > 0 ||
            hasMultipleWhatsappProviders
          }
          channels={channels}
          selectedChannel={channelSelected}
          onChannelSelected={selectChannel}
        >
          {getTemplates()}
        </SettingTemplates>
      )}
    </>
  );
}
