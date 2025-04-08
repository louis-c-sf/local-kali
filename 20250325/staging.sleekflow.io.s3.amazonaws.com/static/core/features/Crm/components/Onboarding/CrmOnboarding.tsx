import React, { ReactNode, useEffect, useReducer } from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "component/Header";
import styles from "./CrmOnboarding.module.css";
import { BackLink } from "component/shared/nav/BackLink";
import { useHistory } from "react-router";
import crmOnboardingReducer, {
  defaultState,
} from "core/features/Crm/reducers/onboardingReducer";
import CrmOnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import Steps from "../Steps";
import { toFloat } from "utility/string";

export default function CrmOnboarding(props: {
  steps: ReactNode[];
  stepsCount: number;
  pageTitle: string;
  handleBack: () => void;
  backBtnText?: string;
}) {
  const { steps, stepsCount, pageTitle, handleBack, backBtnText } = props;
  const { t } = useTranslation();
  const history = useHistory();
  const [onboardingState, onboardingDispatch] = useReducer(
    crmOnboardingReducer,
    defaultState()
  );

  useEffect(() => {
    const params = new URLSearchParams(history.location.search);
    const stepN = toFloat(params.get("step") || "");
    if (stepN === 1) {
      onboardingDispatch({
        type: "GOTO_STEP",
        step: 1,
      });
    }
  }, []);

  const handleGotoStep = (step: number) => () => {
    onboardingDispatch({ type: "GOTO_STEP", step });
  };

  return (
    <div className="post-login">
      <PostLogin selectedItem={""} />
      <Helmet
        title={t("nav.common.title", {
          page: pageTitle,
        })}
      />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {onboardingState.step < stepsCount && (
            <div>
              <BackLink onClick={handleBack}>
                {backBtnText || t("onboarding.ig.backToChannels")}
              </BackLink>
            </div>
          )}
          <CrmOnboardingContext.Provider
            value={{
              ...onboardingState,
              onboardingDispatch,
            }}
          >
            <>
              {onboardingState.step < stepsCount && stepsCount > 1 && (
                <Steps
                  activeStep={onboardingState.step}
                  stepCount={stepsCount}
                  handleGotoStep={handleGotoStep}
                />
              )}
              <div>{steps[onboardingState.step] || null}</div>
            </>
          </CrmOnboardingContext.Provider>
        </div>
      </div>
    </div>
  );
}
