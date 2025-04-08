import useCompanyChannels from "component/Chat/hooks/useCompanyChannels";
import { AllSet } from "component/CreateWhatsappFlow/AllSet";
import { NewNumberInfoType } from "component/CreateWhatsappFlow/types";
import { PostLogin } from "component/Header";
import { BackLink } from "component/shared/nav/BackLink";
import useRouteConfig from "config/useRouteConfig";
import { WhatsappCloudAPIConfigType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIConfigType";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router";
import styles from "./CheckCloudAPIAccess.module.css";
import { ChannelConfiguredType } from "component/Chat/Messenger/types";

export const getCloudAPIConfig = (
  channels: ChannelConfiguredType<any>[],
  phoneNumber: string
) => {
  const whatsappChannelConfig = channels.reduce<NewNumberInfoType | undefined>(
    (acc, next) => {
      if (acc) {
        return { ...acc };
      }
      if (next.type === "whatsappcloudapi") {
        const foundCloudApi: WhatsappCloudAPIConfigType | undefined = (
          next.configs as WhatsappCloudAPIConfigType[]
        )?.find((c) => c.whatsappPhoneNumber === phoneNumber);
        if (!foundCloudApi) {
          return undefined;
        }
        return {
          businessAccount: foundCloudApi.facebookWabaName,
          channelName: foundCloudApi.channelName,
          phoneNumber: phoneNumber,
          displayName: foundCloudApi.whatsappDisplayName,
          wabaId: foundCloudApi.messagingHubWabaId,
          wabaPhoneNumberId: foundCloudApi.messagingHubWabaPhoneNumberId,
          businessVerificationStatus:
            foundCloudApi.facebookWabaBusinessVerificationStatus,
          whatsappNameStatus: foundCloudApi.facebookPhoneNumberNameStatus,
          messagingLimit: foundCloudApi.facebookPhoneNumberMessagingLimitTier,
          facebookPhoneNumberId: foundCloudApi.facebookWabaId,
          facebookWabaBusinessId: foundCloudApi.facebookWabaBusinessId,
        };
      }
    },
    undefined
  );
  return whatsappChannelConfig;
};

function CheckCloudAPIAccess() {
  const param = useParams<{ phoneNumber: string }>();
  const channelId = param.phoneNumber;
  const { routeTo } = useRouteConfig();
  const channels = useCompanyChannels();
  const history = useHistory();
  const { t } = useTranslation();

  function handleBack() {
    history.push(routeTo("/channels"));
  }

  if (!channelId) {
    handleBack();
  }
  const whatsappChannelConfig = getCloudAPIConfig(channels, channelId);
  if (!whatsappChannelConfig) {
    handleBack();
  }

  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} />
      <div className={`main content create-whatsapp-form`}>
        <div className={styles.container}>
          <div className={styles.action}>
            <BackLink onClick={handleBack}>{t("onboarding.ig.back")}</BackLink>
          </div>
          <AllSet selectedNewNumber={whatsappChannelConfig} />
        </div>
      </div>
    </div>
  );
}

export default CheckCloudAPIAccess;
