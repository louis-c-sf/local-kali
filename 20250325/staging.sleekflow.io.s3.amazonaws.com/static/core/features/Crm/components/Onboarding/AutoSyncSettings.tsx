import React, { ReactNode, useContext } from "react";
import onboardingStyles from "./CrmOnboarding.module.css";
import StepHeader from "core/features/Crm/components/StepHeader/StepHeader";
import { useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";
import styles from "./AutoSyncSettings.module.css";
import { Checkbox, Divider, Radio } from "semantic-ui-react";
import { ProviderType } from "../../API/Onboarding/contracts";
import OnboardingContext from "../../reducers/OnboardingContext";
import { CrmConfigType } from "core/features/Crm/API/Onboarding/contracts";
import { AutoSyncSettingsType } from "core/features/Crm/API/Onboarding/contracts";

export const syncModeMap = [
  { toSleekflow: true, toCrm: false, syncMode: "from-provider" },
  { toSleekflow: false, toCrm: true, syncMode: "to-provider" },
  { toSleekflow: false, toCrm: false, syncMode: "no-sync" },
  { toSleekflow: true, toCrm: true, syncMode: "two-way-sync" },
] as const;

export const getSyncMode = (
  crmConfig?: CrmConfigType
): AutoSyncSettingsType => {
  if (!crmConfig) {
    return { field: "Contact", syncMode: "from-provider" };
  }
  const entitySyncConfig =
    crmConfig?.entity_type_name_to_sync_config_dict || {};
  const field =
    Object.keys(entitySyncConfig).find(
      (entity) =>
        entitySyncConfig[entity].sync_mode &&
        entitySyncConfig[entity].sync_mode !== "from-provider"
    ) || "Contact";

  return {
    field,
    syncMode: entitySyncConfig[field]?.sync_mode || "from-provider",
  };
};

export default function AutoSyncSettings(props: {
  providerType: ProviderType;
  submitBtnText: string;
  onSubmitSuccess: () => void;
  crmName: string;
  crmIcon: ReactNode;
  canSelectContactType?: boolean;
}) {
  const {
    providerType,
    crmName,
    submitBtnText,
    onSubmitSuccess,
    canSelectContactType = false,
  } = props;
  const { t } = useTranslation();
  const { onboardingDispatch, autoSyncSetting } = useContext(OnboardingContext);

  const handleNextStep = () => {
    onSubmitSuccess();
  };

  const switchSyncToggle = (field: string, value: boolean) => {
    onboardingDispatch({
      type: "UPDATE_AUTO_SYNC_IS_ENABLE",
      syncMode: {
        ...autoSyncSetting.syncMode,
        [field]: value,
      },
    });
  };

  return (
    <div className={`container ${onboardingStyles.content}`}>
      <StepHeader
        provider={providerType}
        title={t("onboarding.crm.stepAutoSyncSetting.title")}
        subtitle={t("onboarding.crm.stepAutoSyncSetting.subTitle", {
          crm: crmName,
        })}
      />
      <div className={onboardingStyles.section}>
        <div className={styles.title}>
          {t("onboarding.crm.stepAutoSyncSetting.toCrm", {
            crm: crmName,
          })}
        </div>
        <div className={styles.description}>
          {t("onboarding.crm.stepAutoSyncSetting.toCrmDescription", {
            crm: crmName,
          })}
        </div>
        <div className={styles.checkboxWrapper}>
          <Checkbox
            toggle
            checked={autoSyncSetting.syncMode.toCrm}
            onChange={(e, data) => {
              switchSyncToggle("toCrm", !!data.checked);
            }}
          />
          {autoSyncSetting.syncMode.toCrm ? (
            <div className={`${styles.checkboxLabel} ${styles.checkboxOn}`}>
              {t("onboarding.crm.stepAutoSyncSetting.toggle.on")}
            </div>
          ) : (
            <div className={`${styles.checkboxLabel} ${styles.checkboxOff}`}>
              {t("onboarding.crm.stepAutoSyncSetting.toggle.off")}
            </div>
          )}
        </div>
        {canSelectContactType && (
          <>
            <div className={styles.title}>
              {t("onboarding.crm.stepAutoSyncSetting.contactType")}
            </div>
            <div className={styles.radioWrapper}>
              <Radio
                className={styles.radio}
                label={t("onboarding.crm.stepAutoSyncSetting.newContact")}
                name="propertyType"
                value="contact"
                onChange={(_, { value }) =>
                  onboardingDispatch({
                    type: "UPDATE_AUTO_SYNC_FIELD",
                    field: "Contact",
                  })
                }
                checked={autoSyncSetting.field === "Contact"}
              />
              <Radio
                className={styles.radio}
                label={t("onboarding.crm.stepAutoSyncSetting.newLead")}
                name="propertyType"
                value="lead"
                onChange={(_, { value }) =>
                  onboardingDispatch({
                    type: "UPDATE_AUTO_SYNC_FIELD",
                    field: "Lead",
                  })
                }
                checked={autoSyncSetting.field === "Lead"}
              />
            </div>
            <Divider />
          </>
        )}
        <div className={styles.title}>
          {t("onboarding.crm.stepAutoSyncSetting.toSleekflow", {
            crm: crmName,
          })}
        </div>
        <div className={styles.description}>
          {t("onboarding.crm.stepAutoSyncSetting.toSleekflowDescription", {
            crm: crmName,
          })}
        </div>
        <div className={styles.checkboxWrapper}>
          <Checkbox
            toggle
            checked={autoSyncSetting.syncMode.toSleekflow}
            onChange={(e, data) => {
              switchSyncToggle("toSleekflow", !!data.checked);
            }}
          />
          {autoSyncSetting.syncMode.toSleekflow ? (
            <div className={`${styles.checkboxLabel} ${styles.checkboxOn}`}>
              {t("onboarding.crm.stepAutoSyncSetting.toggle.on")}
            </div>
          ) : (
            <div className={`${styles.checkboxLabel} ${styles.checkboxOff}`}>
              {t("onboarding.crm.stepAutoSyncSetting.toggle.off")}
            </div>
          )}
        </div>
      </div>
      <div className={onboardingStyles.footer}>
        <Button
          primary
          customSize="mid"
          onClick={handleNextStep}
          className={onboardingStyles.nextButton}
        >
          {submitBtnText}
        </Button>
      </div>
    </div>
  );
}
