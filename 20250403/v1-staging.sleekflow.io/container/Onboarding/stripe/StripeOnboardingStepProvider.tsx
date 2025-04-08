import { useAppSelector } from "AppRootContext";
import { redirectToStripe } from "lib/stripe/redirectToStripe";
import { equals } from "ramda";
import React, { useState, createContext, useContext } from "react";

const StripeOnboardingStepContext = createContext<{
  currentStep: number;
  goToNextStep(): void;
  goToPreviousStep(): void;
  goTo(step: number): void;
  trackingUrl?: string;
  setTrackingUrl: (url?: string) => void;
  country: string;
  setCountry: (country: string) => void;
} | null>(null);

export function useStripeOnboardingStep() {
  const context = useContext(StripeOnboardingStepContext);

  if (!context) {
    throw new Error(
      "useStripOnboardingStep must be used within a StripeOnboardingStepProvider"
    );
  }

  return context;
}

export default function StripeOnboardingStepProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [step, setStep] = useState(1);
  const [trackingUrl, setTrackingUrl] = useState<string>();
  const [country, setCountry] = useState<string>("");

  function goToNextStep() {
    setStep((prev) => prev + 1);
  }

  function goToPreviousStep() {
    setStep((prev) => prev - 1);
  }

  function goTo(step: number) {
    setStep(step);
  }

  return (
    <StripeOnboardingStepContext.Provider
      value={{
        currentStep: step,
        goToNextStep,
        goToPreviousStep,
        goTo,
        trackingUrl,
        setTrackingUrl,
        country,
        setCountry,
      }}
    >
      {children}
    </StripeOnboardingStepContext.Provider>
  );
}
