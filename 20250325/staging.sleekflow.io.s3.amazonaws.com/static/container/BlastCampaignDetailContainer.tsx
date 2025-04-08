import React, { useEffect, useState } from "react";
import { BlastCampaignDetail } from "../component/Broadcast/BlastCampaign/BlastCampaignDetail";
import { useParams } from "react-router";
import { Dimmer, Loader } from "semantic-ui-react";
import { useWhatsappTemplates } from "./Settings/OfficialWhatsApp/useWhatsappTemplates";
import { fetchBlastCampaign } from "../api/Broadcast/Blast/fetchBlastCampaign";
import useCompanyChannels from "../component/Chat/hooks/useCompanyChannels";
import { PostLogin } from "../component/Header";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { ChannelConfiguredType } from "../component/Chat/Messenger/types";
import { BlastCampaignType } from "../api/Broadcast/Blast/BlastCampaignType";
import { SelectInitTemplates } from "../component/Broadcast/BlastCampaign/SelectInitTemplates";
import { TargetedChannelType } from "../types/BroadcastCampaignType";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { NormalizedWhatsAppTemplateType } from "../features/Whatsapp360/models/OptInType";
import { isWhatsApp360DialogConfigType } from "../features/Whatsapp360/API/get360DialogChannel";

export type TemplatesGroupedByChannelType = {
  [channelId: number]: NormalizedWhatsAppTemplateType;
};

function BlastCampaignDetailContainer() {
  const params = useParams<{ id?: string }>();
  const { t } = useTranslation();
  const [templatesCached, setTemplatesCached] =
    useState<TemplatesGroupedByChannelType>();
  const [templatesBooted, setTemplatesBooted] = useState(false);
  const [campaignBooted, setCampaignBooted] = useState(false);
  const [campaign, setCampaign] = useState<BlastCampaignType>();
  const [channel, setChannel] = useState<TargetedChannelType>();
  const flash = useFlashMessageChannel();
  const { fetch360Templates } = useWhatsappTemplates();
  const [loading, isLoading] = useState(false);
  const channels = useCompanyChannels();
  const channelsAvailable: ChannelConfiguredType<"whatsapp360dialog">[] =
    channels.filter((channel) =>
      (channel.configs ?? []).some(isWhatsApp360DialogConfigType)
    );

  const whatsapp360ChannelIds: number[] = channelsAvailable
    .map((next) => (next.configs ?? []).map((c) => c.id))
    .flat(2);

  // todo check feature availability
  useEffect(() => {
    if (whatsapp360ChannelIds.length === 0 || channel === undefined) {
      return; //todo redirect to channels?
    }

    async function bootWhatsapp() {
      if (!channel?.ids) {
        return;
      }
      isLoading(true);
      const results = await Promise.all(
        channel.ids?.map(async (id) => ({
          id,
          data: await fetch360Templates(Number(id)),
        }))
      );
      setTemplatesCached(
        Object.fromEntries(
          results.map((res) => {
            return [res.id, res.data];
          })
        )
      );
    }

    bootWhatsapp()
      .then(() => {
        setTemplatesBooted(true);
        setCampaignBooted(true);
      })
      .catch((e) => {
        flash(t("system.error.unknown"));
        console.error(`error ${e}`);
        setTemplatesBooted(false);
      })
      .finally(() => {
        isLoading(false);
      });
  }, [channel?.ids?.join(), whatsapp360ChannelIds.join()]);

  useEffect(() => {
    if (!params.id) {
      // setCampaignBooted(true);
      return;
    }
    fetchBlastCampaign(params.id)
      .then((result) => {
        setCampaignBooted(true);
        setCampaign(result);
        setChannel(result.targetedChannelWithIds);
      })
      .catch(console.error);
  }, [params.id]);

  const pageTitle = t("nav.menu.campaigns"); //todo

  return (
    <div className={`post-login`}>
      <PostLogin selectedItem={"Campaigns/Blast"} />
      <Helmet
        title={t("nav.common.title", { page: pageTitle })}
        bodyAttributes={{
          className: "no-margins",
        }}
      />
      {!params.id && !campaignBooted && (
        <SelectInitTemplates
          confirm={(value) => {
            setChannel(value);
          }}
          channelsAllowed={["whatsapp360dialog"]}
          loading={loading}
        />
      )}
      {campaignBooted && templatesBooted && templatesCached && channel ? (
        <BlastCampaignDetail
          channel={channel}
          initCampaign={campaign || null}
          whatsapp360Templates={templatesCached}
          channelsAvailable={channelsAvailable}
        />
      ) : (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      )}
    </div>
  );
}

export default BlastCampaignDetailContainer;
