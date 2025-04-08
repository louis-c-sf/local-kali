import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { ProfileType } from "types/LoginType";

export function useWhatsappTwilioChat(profile?: ProfileType) {
  //todo pass current chat config id
  const twilioAccountSID = useAppSelector((s) => {
    const profileAccount = profile?.whatsAppAccount?.is_twilio
      ? profile?.whatsAppAccount
      : undefined;

    if (profileAccount) {
      const account = s.company?.whatsAppConfigs?.find((c) => {
        return c.twilioAccountId === profileAccount.instanceId;
      });
      return extractId(account?.twilioAccountId ?? "");
    } else {
      const firstOfficialAccount = (s.company?.whatsAppConfigs ?? [])[0];
      return extractId(firstOfficialAccount?.twilioAccountId ?? "");
    }
  }, equals);

  return {
    accountSid: twilioAccountSID,
  };
}

function extractId(twilioAccountId: string) {
  return twilioAccountId.substring(0, twilioAccountId.indexOf(";"));
}
