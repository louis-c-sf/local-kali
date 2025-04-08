import React from "react";
import { Stepper, Step } from "react-form-stepper";

const StepsStyleConfig = {
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

export default function Steps(props: {
  activeStep: number;
  stepCount: number;
  handleGotoStep: (step: number) => () => void;
}) {
  const { activeStep, stepCount, handleGotoStep } = props;
  return (
    <Stepper activeStep={activeStep} styleConfig={StepsStyleConfig}>
      {[...Array(stepCount).keys()].map((v: number) => (
        <Step key={v} onClick={handleGotoStep(v)} />
      ))}
    </Stepper>
  );
}
