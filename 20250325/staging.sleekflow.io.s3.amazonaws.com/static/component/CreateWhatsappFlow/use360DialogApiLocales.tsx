import { WhatsappAccessLevel } from "./WhatsappAccessLabel";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export function use360DialogApiLocales() {
  const { t } = useTranslation();

  const titleMap: Record<WhatsappAccessLevel, string> = useMemo(
    () => ({
      [WhatsappAccessLevel.Unknown]: t(
        "onboarding.whatsapp.accessLevel.Unknown"
      ),
      [WhatsappAccessLevel.BasicTrial]: t(
        "onboarding.whatsapp.accessLevel.BasicTrial"
      ),
      [WhatsappAccessLevel.ExpandedTrial]: t(
        "onboarding.whatsapp.accessLevel.ExpandedTrial"
      ),
      [WhatsappAccessLevel.LimitedAccess]: t(
        "onboarding.whatsapp.accessLevel.LimitedAccess"
      ),
      [WhatsappAccessLevel.Standard]: t(
        "onboarding.whatsapp.accessLevel.Standard"
      ),
    }),
    []
  );

  return {
    titleMap,
  };
}
