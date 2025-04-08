import React, { useContext } from "react";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { useTranslation } from "react-i18next";
import { WhatsappFlowHeader } from "./WhatsappFlowHeader";
import { WayChoice } from "../../container/Onboarding/WayChoice";
import { WhatsappOnboardingContext } from "../../container/Onboarding/assets/WhatsappOnboardingContext";

export type ApiAccessScenarioType = "newNumber" | "migrate";

export function ChooseTwilioScenario(props: {
  onScenarioChange: (scenario: ApiAccessScenarioType) => void;
  scenario: ApiAccessScenarioType;
}) {
  const { machineSend } = useContext(WhatsappOnboardingContext);
  const { t } = useTranslation();

  const officialScenarios = [
    {
      id: "newNumber",
      title: t("onboarding.twilioStart.way.connect.header"),
      options: t("onboarding.twilioStart.way.connect.options", {
        returnObjects: true,
      }) as string[],
    },
    {
      id: "migrate",
      title: t("onboarding.twilioStart.way.migrate.header"),
      options: t("onboarding.twilioStart.way.migrate.options", {
        returnObjects: true,
      }) as string[],
    },
  ] as const;

  return (
    <div className={flowStyles.contentContainer}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("onboarding.twilioStart.header")}
        subheader={t("onboarding.twilioStart.subHeader")}
      />
      <WayChoice
        nextAction={() => {
          machineSend({
            type: props.scenario === "newNumber" ? "SETUP" : "MIGRATE",
          });
        }}
        onSelect={props.onScenarioChange}
        selectedId={props.scenario}
        ways={officialScenarios}
      />
    </div>
  );
}
