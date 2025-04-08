import React, { useContext, useState } from "react";
import stepStyles from "core/features/Crm/components/Onboarding/CrmOnboarding.module.css";
import StepHeader from "core/features/Crm/components/StepHeader/StepHeader";
import { useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";
import postUpdateUserMapping from "core/features/Crm/API/Onboarding/postUpdateUserMapping";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import MapUserTable, {
  StatusType,
} from "core/features/Crm/components/Onboarding/MapUserTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "./onboarding.module.css";
import { ObjectNormalizedType } from "features/Salesforce/API/Objects/contracts";

const crmName = "Salesforce";
const providerType = "salesforce-integrator";

const getCrmUserName = (user: ObjectNormalizedType) =>
  user[`${providerType}:Name`];

export default function StepMapUsers() {
  const { t } = useTranslation();
  const { onboardingDispatch, mapUsers } = useContext(OnboardingContext);
  const [visibleSkip, setVisibleSkip] = useState<boolean>(false);

  const handleNextStep = async () => {
    try {
      const userMappingData = mapUsers
        .filter((user) => user.salesforceUser)
        .reduce(
          (acc, curr) => ({ ...acc, [curr.salesforceUser as string]: curr.id }),
          {}
        );
      await postUpdateUserMapping(userMappingData);
      onboardingDispatch({ type: "NEXT_STEP" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  const handleStatus = (status: StatusType) => {
    setVisibleSkip(status === "FAIL");
  };

  return (
    <div className={`container ${stepStyles.content}`}>
      <StepHeader
        provider={providerType}
        title={t("onboarding.crm.stepMapUsers.title", { crm: crmName })}
        subtitle={t("onboarding.crm.stepMapUsers.subTitle", { crm: crmName })}
      />
      <div className={stepStyles.section}>
        <MapUserTable
          getStatus={handleStatus}
          providerType={providerType}
          crmName={crmName}
          getCrmUserName={getCrmUserName}
          crmField="unified:SalesforceIntegratorId"
          crmIcon={
            <i
              className={`${iconStyles.icon} ${onboardingStyles.salesforceLogo}`}
            />
          }
        />
      </div>
      <div className={stepStyles.footer}>
        <div className={stepStyles.nextButton}>
          {visibleSkip && (
            <Button onClick={handleSkip} className={stepStyles.skipButton}>
              {t("onboarding.crm.action.skip")}
            </Button>
          )}
          <Button primary onClick={handleNextStep} disabled={visibleSkip}>
            {t("onboarding.crm.action.nextButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
