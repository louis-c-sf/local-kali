import React from "react";
import { Checkbox, CheckboxProps } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import StatusAlert from "../shared/StatusAlert";
import styles from "./TriggerAutomationCheckbox.module.css";

export const TriggerAutomationCheckbox = (props: {
  isChecked: boolean;
  handleChange: (data: CheckboxProps) => void;
}) => {
  const { isChecked, handleChange } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className="checkbox">
        <Checkbox
          checked={isChecked}
          onClick={(event, data) => handleChange(data)}
          label={t("automation.triggerCheckboxWarning.label")}
        />
      </div>
      {isChecked && (
        <StatusAlert type="warning" headerText={t("warning")}>
          <span>{t("automation.triggerCheckboxWarning.content")}</span>
        </StatusAlert>
      )}
    </div>
  );
};
