import React from "react";
import DotIcon from "../../../assets/tsx/icons/DotIcon";
import styles from "./ProgressDots.module.css";

const DefaultIcon = () => {
  return <DotIcon />;
};

const ActiveIcon = () => {
  return <DotIcon color="#6078FF" />;
};

const ProgressDots = (props: { currentStep: number; stepsTotal: number }) => {
  const { currentStep, stepsTotal } = props;

  return (
    <div className={styles.container}>
      {Array(stepsTotal)
        .fill(null)
        .map((row, step) => {
          return step === currentStep ? <ActiveIcon /> : <DefaultIcon />;
        })}
    </div>
  );
};
export default ProgressDots;
