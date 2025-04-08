import React, { useContext, useEffect } from "react";
import { Drawer } from "../shared/sidebar/Drawer";
import { HelpCenterContext } from "./hooks/helpCenterContext";
import { StepsEnum } from "./hooks/HelpCenterStateType";
import { MainPage } from "./components/pages/MainPage";
import { NewTicketPage } from "./components/pages/NewTicketPage";
import { SubmissionPage } from "./components/pages/SubmissionPage";
import styles from "./HelpCenter.module.css";
export const HelpCenterDrawer = (props: {
  addRootClassName: () => void;
  close: () => void;
}) => {
  const { addRootClassName, close } = props;
  const { state } = useContext(HelpCenterContext);

  return (
    <Drawer
      visible={state.helpCenterWidgetVisible}
      hide={close}
      onVisible={addRootClassName}
    >
      {state.step !== StepsEnum.Submission && (
        <div className={styles.animationContainer}>
          <MainPage />
          <NewTicketPage />
        </div>
      )}
      {state.step === StepsEnum.Submission && <SubmissionPage close={close} />}
    </Drawer>
  );
};
