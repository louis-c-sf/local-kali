import React, { useState, createContext, useContext } from "react";
import { PostLogin } from "component/Header";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { BackLink } from "component/shared/nav/BackLink";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import styles from "./WhatsappCatalogOnboarding.module.css";
import { Stepper, Step } from "react-form-stepper";
import Connect from "./Connect";
import NoAccount from "./NoAccount";
import CheckFacebookCatalog from "./CheckFacebookCatalog";
import ConnectFacebookCatalog from "./ConnectFacebookCatalog";
import GrantPermission from "./GrantPermission";
import ConnectWhatsappNumber from "./ConnectWhatsappNumber";
import AllSet from "./AllSet";

type CatalogInfo = { wabaName: string; catalogName: string };

const STYLE_CONFIG = {
  activeBgColor: "#6078ff",
  activeTextColor: "white",
  completedBgColor: "#6078ff",
  completedTextColor: "white",
  inactiveBgColor: "#e0e0e0",
  inactiveTextColor: "#ffffff",
  size: "2em",
  circleFontSize: "1em",
  labelFontSize: "16px",
  borderRadius: "50%",
  fontWeight: 500,
};

const WhatsappCatalogOnboardingContext = createContext<{
  currentStep: number;
  goToNextStep(): void;
  goToPreviousStep(): void;
  goToStep(step: number): void;
  accessToken: string;
  setAccessToken: (token: string) => void;
  catalogInfo: CatalogInfo;
  setCatalogInfo: (info: CatalogInfo) => void;
} | null>(null);

export function useWhatsappCatalogOnboarding() {
  const context = useContext(WhatsappCatalogOnboardingContext);

  if (!context) {
    throw new Error(
      "useStripOnboardingStep must be used within a WhatsappCatalogOnboardingProvider"
    );
  }

  return context;
}

const steps = [
  <Connect />,
  <CheckFacebookCatalog />,
  <ConnectFacebookCatalog />,
  <GrantPermission />,
  <ConnectWhatsappNumber />,
  <AllSet />,
  <NoAccount />,
];

export default function WhatsappCatalogOnboarding() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const [step, setStep] = useState(0);
  const [accessToken, setAccessToken] = useState("");
  const [catalogInfo, setCatalogInfo] = useState<CatalogInfo>({
    wabaName: "",
    catalogName: "",
  });

  function goToNextStep() {
    setStep((prev) => prev + 1);
  }

  function goToPreviousStep() {
    setStep((prev) => prev - 1);
  }

  function goToStep(step: number) {
    setStep(step);
  }

  function handleBack() {
    if (step === 0) {
      history.push(routeTo("/channels"));
    } else if (step === 6) {
      goToStep(0);
    } else {
      goToPreviousStep();
    }
  }

  return (
    <div className="post-login">
      <PostLogin selectedItem="" />
      <Helmet title={t("onboarding.whatsappCatalog.pageTitle")} />
      <WhatsappCatalogOnboardingContext.Provider
        value={{
          currentStep: step,
          goToNextStep,
          goToPreviousStep,
          goToStep,
          accessToken,
          setAccessToken,
          catalogInfo,
          setCatalogInfo,
        }}
      >
        <div className={styles.container}>
          <BackLink onClick={handleBack} className={styles.backButton}>
            {t("onboarding.ig.back")}
          </BackLink>
          <div className={styles.contentWrapper}>
            {step > 0 && step < 5 && (
              <Stepper activeStep={step - 1} styleConfig={STYLE_CONFIG}>
                {[...Array(4).keys()].map((v: number) => (
                  <Step key={v} onClick={() => goToStep(v + 1)} />
                ))}
              </Stepper>
            )}
            {steps[step] || null}
          </div>
        </div>
      </WhatsappCatalogOnboardingContext.Provider>
    </div>
  );
}
