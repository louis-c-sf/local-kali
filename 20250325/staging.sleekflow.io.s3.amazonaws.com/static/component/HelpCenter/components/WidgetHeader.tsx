import React, { ReactNode, useContext } from "react";
import { HelpCenterContext } from "../hooks/helpCenterContext";
import { HelpCenterFormType, StepsEnum } from "../hooks/HelpCenterStateType";
import ArrowBackIcon from "../../../assets/tsx/icons/ArrowBackIcon";
import CloseIcon from "../../../assets/tsx/icons/CloseIcon";
import MinusIcon from "../../../assets/tsx/icons/MinusIcon";
import styles from "./WidgetHeader.module.css";
import { useTranslation } from "react-i18next";

const WidgetHeader = (props: {
  children: ReactNode;
  values?: HelpCenterFormType;
}) => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(HelpCenterContext);
  const updateContextForm = () => {
    if (state.step === StepsEnum.New && props.values !== undefined) {
      dispatch({ type: "UPDATE_FORM", form: { ...props.values } });
    }
  };

  return (
    <div className={styles.header}>
      {state.step === StepsEnum.New && (
        <span
          className={styles.back}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            updateContextForm();
            dispatch({ type: "UPDATE_STEP", step: StepsEnum.Main });
          }}
        >
          <ArrowBackIcon />
          <span>{t("nav.helpCenter.header.newTicket.button.back")}</span>
        </span>
      )}

      {props.children}
      {<WidgetActions updateForm={updateContextForm} className={styles.icon} />}
    </div>
  );
};
export default WidgetHeader;

export const WidgetActions = (props: {
  updateForm?: () => void;
  className: string;
}) => {
  const { updateForm = () => {}, className } = props;
  const { dispatch } = useContext(HelpCenterContext);

  return (
    <div className={styles.actionArea}>
      <div
        className={styles.iconContainer}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          updateForm();
          dispatch({ type: "HIDE_HELP_CENTER_WIDGET" });
        }}
      >
        <MinusIcon className={className} style={"thin"} />
      </div>
      <div className={`${className} ${styles.iconContainer}`}>
        <CloseIcon
          className={className}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            dispatch({ type: "RESET_STATE" });
          }}
        />
      </div>
    </div>
  );
};
