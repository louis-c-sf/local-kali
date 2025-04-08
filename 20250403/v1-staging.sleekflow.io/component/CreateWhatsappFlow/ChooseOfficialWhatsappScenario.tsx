import React, { useContext } from "react";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { useTranslation } from "react-i18next";
import { WhatsappFlowHeader } from "./WhatsappFlowHeader";
import { WayChoice } from "../../container/Onboarding/WayChoice";
import { WhatsappOnboardingContext } from "../../container/Onboarding/assets/WhatsappOnboardingContext";
import { ApiAccessScenarioType } from "./ChooseTwilioScenario";

export function ChooseOfficialWhatsappScenario(props: {
  onScenarioChange: (scenario: ApiAccessScenarioType) => void;
  scenario: ApiAccessScenarioType;
}) {
  const { machineSend } = useContext(WhatsappOnboardingContext);
  const { t } = useTranslation();

  const officialScenarios = [
    {
      id: "newNumber",
      title: t("onboarding.officialStart.way.newNumber.header"),
      text: t("onboarding.officialStart.way.newNumber.text"),
    },
    {
      id: "migrate",
      title: t("onboarding.officialStart.way.migrate.header"),
      text: t("onboarding.officialStart.way.migrate.text"),
    },
  ] as const;

  return (
    <div className={flowStyles.contentContainer}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("onboarding.officialStart.header")}
        subheader={t("onboarding.officialStart.subHeader")}
      />
      <WayChoice
        nextAction={() =>
          machineSend({
            type: props.scenario === "newNumber" ? "SETUP" : "MIGRATE",
          })
        }
        onSelect={props.onScenarioChange}
        selectedId={props.scenario}
        ways={officialScenarios}
      />
    </div>
  );
}
