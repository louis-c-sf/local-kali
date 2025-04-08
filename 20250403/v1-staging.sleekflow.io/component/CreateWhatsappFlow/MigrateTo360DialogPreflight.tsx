import React, { useContext, useState } from "react";
import styles from "./MigrateTo360DialogPreflight.module.css";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { useTranslation } from "react-i18next";
import { WhatsappOnboardingContext } from "../../container/Onboarding/assets/WhatsappOnboardingContext";
import { WhatsappFlowHeader } from "./WhatsappFlowHeader";
import {
  TierType,
  VerticalStepper,
} from "../shared/content/VerticalStepper/VerticalStepper";
import { Button } from "../shared/Button/Button";
import { Dropdown } from "semantic-ui-react";
import { DropdownOptionType } from "../Chat/ChannelFilterDropdown";
import { ChannelConfiguredType } from "../Chat/Messenger/types";
import useCompanyChannels from "../Chat/hooks/useCompanyChannels";
import { equals } from "ramda";
import { postWithExceptions } from "../../api/apiRequest";
import { POST_ONBOARDING_MIGRATE_REQUEST } from "../../api/apiPath";
import { useHistory } from "react-router";
import useRouteConfig from "../../config/useRouteConfig";
import { parseWhatsappChatApiPhone } from "../Chat/localizable/parseWhatsappChatApiPhone";
import { TFunction } from "i18next";
import { migrateProviders } from "./migrateProviders";

type ChannelChoiceType = DropdownOptionType & {
  channel: ChannelConfiguredType<any>;
  phoneNumber?: string;
};

const getApiTypeChoices: (t: TFunction) => Readonly<DropdownOptionType[]> = (
  t
) => migrateProviders.map((n, i) => ({ text: n, value: n, key: i }));

export function MigrateTo360DialogPreflight() {
  const { machineSend, machineState } = useContext(WhatsappOnboardingContext);
  const defaultApiType = machineState.context.haveTwilio ? "Twilio" : undefined;

  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const [isSubmitTwilioLoading, setIsSubmitTwilioLoading] = useState(false);
  const [apiType, setApiType] = useState<string | undefined>(defaultApiType);
  const [isTwilioLinkingToSleekflow, setIsTwilioLinkingToSleekflow] =
    useState<boolean>();
  const [isDisabledTwoFactor, setIsDisabledTwoFactor] = useState<boolean>();
  const [migrateChannels, setMigrateChannels] = useState<DropdownOptionType[]>(
    []
  );

  const channelsAvailable = useCompanyChannels();
  const twilioChannelOptions: ChannelChoiceType[] = channelsAvailable
    .filter((c) => c.type === "twilio_whatsapp")
    .reduce<ChannelChoiceType[]>((acc, c, i) => {
      const configNames = c.configs?.map((config, index) => {
        const configDropdown = {
          value: JSON.stringify(config),
          text: config.name,
          key: index,
          selected: migrateChannels.some(equals(config)),
          channel: c,
          phoneNumber: config.whatsAppSender,
        };
        return {
          ...configDropdown,
          value: JSON.stringify(configDropdown),
        };
      });
      return configNames ?? [];
    }, []);

  function isTwoFactorRequired() {
    if (
      ["conversocial", "twilio", "haptik", "kaleyra", "zendesk"].includes(
        apiType?.toLowerCase() ?? ""
      )
    ) {
      return true;
    }
    return (
      isTwilioLinkingToSleekflow !== undefined && !isTwilioLinkingToSleekflow
    );
  }

  function selectApiType(type: string) {
    setApiType(type);
    setIsTwilioLinkingToSleekflow(undefined);
    setMigrateChannels([]);
    setIsDisabledTwoFactor(undefined);
  }

  function isApiTypeSelected() {
    return apiType !== undefined;
  }

  function isChannelListRequired() {
    return apiType?.toLowerCase() === "twilio" && isTwilioLinkingToSleekflow;
  }

  function hasChannelsSelected() {
    return migrateChannels.length > 0;
  }

  function isTwoFactorInputVisible() {
    return (
      isApiTypeSelected() &&
      isTwoFactorRequired() &&
      (apiType?.toLowerCase() !== "twilio" ||
        isTwilioLinkingToSleekflow !== undefined)
    );
  }

  function isErrorResult() {
    return buildTiers().some((t) => t.final && t.error);
  }

  function isSubmitAvailable() {
    return buildTiers().some((t) => t.final && t.active);
  }

  function getTwoFactorPromptTier() {
    return {
      active: isApiTypeSelected() && isDisabledTwoFactor !== undefined,
      header: { text: t("form.createWhatsapp.migrate.step.twoFactor.label") },
      body: (
        <div className={styles.prompt}>
          <Button
            content={t("form.createWhatsapp.migrate.button.yes")}
            active={isDisabledTwoFactor === true}
            onClick={() => setIsDisabledTwoFactor(true)}
          />
          <Button
            content={t("form.createWhatsapp.migrate.button.no")}
            active={isDisabledTwoFactor === false}
            onClick={() => setIsDisabledTwoFactor(false)}
          />
        </div>
      ),
    };
  }

  function getReadyPromptTier(active?: boolean): TierType {
    return {
      active: active ?? !!isDisabledTwoFactor,
      header: { text: t("form.createWhatsapp.migrate.step.ready") },
      body: <></>,
      final: true,
    };
  }

  function getSleekflowLinkPromptTier() {
    return {
      active: isTwilioLinkingToSleekflow !== undefined,
      header: {
        text: t("form.createWhatsapp.migrate.step.sleekflowLink.label"),
      },
      body: (
        <div className={styles.prompt}>
          <Button
            content={t("form.createWhatsapp.migrate.button.yes")}
            active={isTwilioLinkingToSleekflow === true}
            onClick={() => setIsTwilioLinkingToSleekflow(true)}
          />
          <Button
            content={t("form.createWhatsapp.migrate.button.no")}
            active={isTwilioLinkingToSleekflow === false}
            onClick={() => setIsTwilioLinkingToSleekflow(false)}
          />
        </div>
      ),
    };
  }

  function getContactProviderTier(): TierType {
    return {
      active: true,
      error: true,
      header: {
        text: t("form.createWhatsapp.migrate.step.contactProvider.head"),
      },
      body: <>{t("form.createWhatsapp.migrate.step.contactProvider.body")}</>,
      final: true,
    };
  }

  function buildTiers() {
    const tiers: TierType[] = [
      {
        active: isApiTypeSelected(),
        header: { text: t("form.createWhatsapp.migrate.step.apiType.label") },
        body: (
          <div className={"form ui"}>
            <Dropdown
              search
              placeholder={t(
                "form.createWhatsapp.migrate.step.apiType.placeholder"
              )}
              options={[...getApiTypeChoices(t)]}
              onChange={(_, data) => {
                selectApiType(data.value as string);
              }}
              value={apiType}
            />
          </div>
        ),
      },
    ];

    if (apiType?.toLowerCase() === "twilio") {
      tiers.push(getSleekflowLinkPromptTier());

      if (isTwilioLinkingToSleekflow) {
        tiers.push({
          active: hasChannelsSelected(),
          final: hasChannelsSelected(),
          header: { text: t("form.createWhatsapp.migrate.step.channels.head") },
          body: (
            <>
              <p>
                {t("form.createWhatsapp.migrate.step.channels.description")}
              </p>
              <div className="form ui">
                <div className={styles.label}>
                  {t("form.createWhatsapp.migrate.step.channels.label")}
                  <Dropdown
                    multiple
                    selection
                    options={twilioChannelOptions}
                    value={migrateChannels.map((ch) => JSON.stringify(ch))}
                    onChange={(_, data) => {
                      try {
                        const valuesSerialized = (
                          data.value as string[]
                        ).filter((v) => v !== null);
                        const value = valuesSerialized.map((v) =>
                          JSON.parse(v)
                        );
                        setMigrateChannels(value);
                      } catch (e) {
                        console.error(`unable to parse value ${e}`);
                      }
                    }}
                  />
                </div>
              </div>
            </>
          ),
        });
      } else {
        if (isTwoFactorInputVisible()) {
          tiers.push(getTwoFactorPromptTier());
        }
        if (isDisabledTwoFactor === false) {
          tiers.push(getContactProviderTier());
        } else {
          tiers.push(getReadyPromptTier());
        }
      }
    } else {
      if (isTwoFactorInputVisible()) {
        tiers.push(getTwoFactorPromptTier());

        if (isDisabledTwoFactor === true || isDisabledTwoFactor === undefined) {
          tiers.push(getReadyPromptTier());
        }

        if (isDisabledTwoFactor === false) {
          tiers.push(getContactProviderTier());
        }
      } else {
        if (!isTwoFactorRequired() && apiType) {
          tiers.push({
            active: true,
            header: { text: t("form.createWhatsapp.migrate.step.goAhead") },
            body: <></>,
            final: true,
          });
        }
      }
    }
    return tiers;
  }

  function isNeedToSubmitTwilioChannels() {
    return apiType?.toLowerCase() === "twilio" && isTwilioLinkingToSleekflow;
  }

  async function submitTwilioChannels() {
    setIsSubmitTwilioLoading(true);
    const phoneNumbers = migrateChannels
      .map((c) => {
        const foundConfig = JSON.parse(c.value);
        if (foundConfig) {
          return parseWhatsappChatApiPhone(foundConfig) ?? null;
        }
        return null;
      })
      .filter((num) => num !== null);

    try {
      await postWithExceptions(POST_ONBOARDING_MIGRATE_REQUEST, {
        param: {
          phoneNumbers: phoneNumbers,
        },
      });
      machineSend({ type: "REQUEST_SLEEKFLOW_MIGRATION" });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitTwilioLoading(false);
    }
  }

  function submitBlockedState() {
    history.push(routeTo("/channels"));
  }

  function submitToMigration() {
    machineSend({ type: "SUBMIT" });
  }

  return (
    <div className={flowStyles.contentContainer}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("form.createWhatsapp.migrate.header")}
        subheader={t("form.createWhatsapp.migrate.subheader.letKnowMore")}
      />
      <div className={styles.stepperWrap}>
        <VerticalStepper tiers={buildTiers()} checkType={"check"} />
      </div>
      <div className={styles.actions}>
        <Button
          content={
            isNeedToSubmitTwilioChannels()
              ? t("form.createWhatsapp.migrate.button.submit")
              : isErrorResult()
              ? t("form.createWhatsapp.migrate.button.gotIt")
              : t("form.button.next")
          }
          customSize={"mid"}
          centerText
          primary
          fluid
          loading={isSubmitTwilioLoading}
          disabled={!isSubmitAvailable() || isSubmitTwilioLoading}
          onClick={
            isNeedToSubmitTwilioChannels()
              ? submitTwilioChannels
              : isErrorResult()
              ? submitBlockedState
              : submitToMigration
          }
        />
      </div>
    </div>
  );
}
