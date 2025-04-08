import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import styles from "./IsContinueTooltipContent.module.css";

export const IsContinueTooltipContent = (props: { close: () => void }) => {
  const { close } = props;
  const { t } = useTranslation();
  type stepType = "default" | "other";
  const [step, setStep] = useState<stepType>("default");

  return (
    <div className={styles.tooltip}>
      <div className={styles.title}>
        {step === "default"
          ? t("automation.tooltip.grid.isContinue.defaultRule.title")
          : t("automation.tooltip.grid.isContinue.triggerOtherRule.title")}
      </div>
      <div className={styles.content}>
        {step === "default"
          ? t("automation.tooltip.grid.isContinue.defaultRule.content")
          : t("automation.tooltip.grid.isContinue.triggerOtherRule.content")}
      </div>
      <div
        className={`${styles.commonButtonContainer} ${
          step === "default" ? styles.buttonsContainer : styles.buttonContainer
        }`}
      >
        {step === "default" && (
          <span className={styles.skip} onClick={close}>
            {t("automation.tooltip.grid.isContinue.defaultRule.button.skip")}
          </span>
        )}
        <Button
          primary
          size="mini"
          className={styles.lastButton}
          onClick={() => {
            step === "default" ? setStep("other") : close();
          }}
        >
          {step === "default"
            ? t("automation.tooltip.grid.isContinue.defaultRule.button.next")
            : t(
                "automation.tooltip.grid.isContinue.triggerOtherRule.button.gotIt"
              )}
        </Button>
      </div>
    </div>
  );
};
