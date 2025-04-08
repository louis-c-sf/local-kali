import React, { useContext, useState } from "react";
import styles from "./Create360DialogAccount.module.css";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { useTranslation } from "react-i18next";
import { WhatsappOnboardingContext } from "../../container/Onboarding/assets/WhatsappOnboardingContext";
import iconStyles from "../../component/shared/Icon/Icon.module.css";
import { WhatsappFlowHeader } from "./WhatsappFlowHeader";
import { Button } from "../shared/Button/Button";
import { TickedList } from "../shared/content/TickedList";
import { Create360DialogForm } from "./steps/Create360DialogForm";
import { CreateAccountTutorial } from "./CreateAccountTutorial";

export function MigrateTo360Dialog(props: {
  onSuccess: () => void;
  migrateTo360DialogUrl: string;
}) {
  const { machineState } = useContext(WhatsappOnboardingContext);
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  const isNewNumber =
    Boolean(machineState.matches("haveTwilio.migrate")) ||
    Boolean(machineState.matches("official.migrate"));
  const { t } = useTranslation();

  const step1Items = isNewNumber
    ? t<string[]>(
        "form.createWhatsapp.requestAPI.description.createSteps.newNumber.items",
        { returnObjects: true }
      ) ?? []
    : t<string[]>(
        "form.createWhatsapp.requestAPI.description.createSteps.migrate.items",
        { returnObjects: true }
      ) ?? [];

  return (
    <div className={flowStyles.contentContainer}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("form.createWhatsapp.migrate.header")}
        subheader={t("form.createWhatsapp.migrate.subheader.complete")}
      />
      <div className={styles.header}>
        {t("form.createWhatsapp.requestAPI.description.createSteps.header")}
      </div>
      <p className={styles.text}>
        1.{" "}
        {isNewNumber
          ? t(
              "form.createWhatsapp.requestAPI.description.createSteps.newNumber.step1"
            )
          : t(
              "form.createWhatsapp.requestAPI.description.createSteps.migrate.step1"
            )}
      </p>
      <TickedList items={step1Items} />
      <div className={styles.actionsInline}>
        <a
          target={"_blank"}
          rel={"noopener noreferrer"}
          href={props.migrateTo360DialogUrl}
        >
          <Button
            as={"span"}
            content={
              <>
                {t("form.createWhatsapp.requestAPI.action.signupAt360Dialog")}
                <i
                  className={`${iconStyles.icon} ${styles.icon} ${styles.externalLink}`}
                />
              </>
            }
            primary
          />
        </a>
        {isNewNumber && (
          <a
            target={"_blank"}
            rel={"noopener noreferrer"}
            href={props.migrateTo360DialogUrl}
          >
            <Button
              as={"span"}
              content={t("form.createWhatsapp.requestAPI.action.watchTutorial")}
            />
          </a>
        )}
        {!isNewNumber && (
          <a
            target={"_blank"}
            rel={"noopener noreferrer"}
            href={`https://docs.sleekflow.io/messaging-channels/twilio-whatsapp/apply-via-360dialog`}
          >
            <Button
              as={"span"}
              content={t("form.createWhatsapp.requestAPI.action.readGuide")}
            />
          </a>
        )}
      </div>
      <p className={styles.text}>
        2.{" "}
        {isNewNumber
          ? t(
              "form.createWhatsapp.requestAPI.description.createSteps.newNumber.step2"
            )
          : t(
              "form.createWhatsapp.requestAPI.description.createSteps.migrate.step2"
            )}
      </p>
      <Create360DialogForm onSuccess={props.onSuccess} />
      {isTutorialVisible && (
        <CreateAccountTutorial onClose={() => setIsTutorialVisible(false)} />
      )}
    </div>
  );
}
