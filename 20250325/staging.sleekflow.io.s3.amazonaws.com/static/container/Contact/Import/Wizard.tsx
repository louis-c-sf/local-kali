import React, { ReactNode, useRef } from "react";
import { Popup } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { Step, Stepper } from "react-form-stepper";
import { StepsStyleConfig } from "../../../component/Channel/Onboarding/Instagram";
import iconStyles from "../../../component/shared/Icon/Icon.module.css";
import actionStyles from "./Action.module.css";
import { useHistory } from "react-router";
import { Button } from "component/shared/Button/Button";
import { NextButtonInfoType } from "container/Onboarding/migrateNumber/types";

interface WizardProps {
  stepNumber: number;
  stepsTotal: number;
  onPrevClick: any;
  onNextClick: any;
  onCancelClick?: any;
  allowPrev: boolean;
  allowNext: boolean;
  nextError?: string;
  children: ReactNode;
  hasBackPrevPage?: boolean;
  prevPageLink?: string;
  nextButtonInfo?: NextButtonInfoType;
  loading?: boolean;
}

export default function Wizard(props: WizardProps) {
  const { children, onCancelClick, onNextClick, onPrevClick } = props;
  const {
    stepNumber,
    stepsTotal,
    allowNext,
    allowPrev,
    nextError,
    hasBackPrevPage = false,
    prevPageLink = "",
    nextButtonInfo,
    loading = false,
  } = props;
  const btnRef = useRef<HTMLSpanElement>(null);
  const history = useHistory();
  const { t } = useTranslation();
  const goPrevPage = () => history.push(prevPageLink);
  const hasGoPrevPage = stepNumber === 1 && hasBackPrevPage;
  const showBackButton = allowPrev && (hasGoPrevPage || stepNumber !== 1);
  const hasNextButton = nextButtonInfo?.showButton ?? true;
  const nextButtonText =
    (hasNextButton && nextButtonInfo?.text) ?? t("form.button.next");

  return (
    <div className={"wizard"}>
      <section className="wizard-body">
        <header className={"status"}>
          {showBackButton && (
            <div
              className={`${actionStyles.backButton} backButton`}
              onClick={hasGoPrevPage ? goPrevPage : onPrevClick}
            >
              <span
                className={`${iconStyles.icon} ${actionStyles.backIcon}`}
              ></span>
              {t("nav.backShort")}
            </div>
          )}
          <Stepper
            activeStep={stepNumber - 1}
            styleConfig={StepsStyleConfig}
            className="stepper"
          >
            {Array(stepsTotal)
              .fill(0)
              .map((_, index) => (
                <Step key={`step_${index}`} />
              ))}
          </Stepper>
          {onCancelClick && (
            <div
              className={`${iconStyles.icon} ${actionStyles.cancelIcon}`}
              onClick={onCancelClick}
            />
          )}
        </header>
        <div className="wizard-body-contents">{children}</div>
        {hasNextButton && (
          <footer className={"buttons-panel"}>
            <Button
              onClick={loading ? undefined : onNextClick}
              ref={btnRef}
              primary
              className={`ui button primary button-next`}
              disabled={!allowNext}
              loading={loading}
            >
              {nextButtonText}
            </Button>
            {nextError && (
              <Popup context={btnRef} open position={"top right"} offset={0}>
                {nextError}
              </Popup>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}
