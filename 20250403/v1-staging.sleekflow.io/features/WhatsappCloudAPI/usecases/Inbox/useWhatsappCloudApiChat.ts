import { post, postWithExceptions } from "api/apiRequest";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { useEffect } from "react";
import { ProfileType } from "types/LoginType";

export function useWhatsappCloudApiChat(profile?: ProfileType) {
  const config = useAppSelector((s) => {
    const [config] = s.company?.whatsappCloudApiConfigs ?? [];
    if (profile) {
      return (
        s.company?.whatsappCloudApiConfigs?.find(
          (c) =>
            c.whatsappPhoneNumber ===
            profile.whatsappCloudApiUser?.whatsappChannelPhoneNumber
        ) ?? config
      );
    }
    return config;
  }, equals);
  useEffect(() => {
    if (!config?.whatsappPhoneNumber || !profile?.id) {
      return;
    }
    if (
      profile?.whatsappCloudApiUser?.whatsappChannelPhoneNumber !==
      config?.whatsappPhoneNumber
    ) {
      try {
        postWithExceptions("/userprofile/whatsapp/cloudapi/switch-channel", {
          param: {
            whatsappChannelPhoneNumber: config.whatsappPhoneNumber,
            userProfileId: profile.id,
          },
        });
      } catch (e) {
        console.error(e, { config, profile });
      }
    }
  }, [
    config?.whatsappPhoneNumber,
    profile?.whatsappCloudApiUser?.whatsappChannelPhoneNumber,
    profile?.id,
  ]);
  return {
    wabaId: config?.messagingHubWabaId,
    configId: config?.id,
  };
}
