import { useAppSelector } from "AppRootContext";
import { getDefaultWhatsapp360Config } from "features/Whatsapp360/API/getDefaultWhatsapp360Config";
import { equals } from "ramda";
import { ProfileType } from "types/LoginType";

export function useWhatsapp360Chat(profile?: ProfileType) {
  const config = useAppSelector((s) => {
    const channelConfigId = profile?.whatsApp360DialogUser?.channelId;
    if (!channelConfigId) {
      return s.company ? getDefaultWhatsapp360Config(s.company) : undefined;
    }

    return s.company?.whatsApp360DialogConfigs?.find(
      (c) => c.id === channelConfigId
    );
  }, equals);

  return {
    configId: config?.id,
  };
}
