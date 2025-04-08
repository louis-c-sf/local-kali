import React, { useContext } from "react";
import { Button, Image } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { HelpCenterContext } from "../hooks/helpCenterContext";
import { StepsEnum } from "../hooks/HelpCenterStateType";
import noteIcon from "../../../assets/images/icons/write-note.svg";
import styles from "./NewTicket.module.css";
import mainStyles from "./pages/MainPage.module.css";

const NewTicket = () => {
  const { t } = useTranslation();
  const { dispatch } = useContext(HelpCenterContext);
  return (
    <div
      className={`${styles.container} ${mainStyles.boxWrapper} ${mainStyles.boxShadow}`}
    >
      <span className={styles.title}>
        {t("nav.helpCenter.mainPage.newTicket.title")}
      </span>
      <span className={styles.content}>
        {t("nav.helpCenter.mainPage.newTicket.content")}
      </span>
      <Button
        primary
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          dispatch({ type: "UPDATE_STEP", step: StepsEnum.New });
        }}
      >
        <Image src={noteIcon} size={"mini"} />
        {t("nav.helpCenter.mainPage.newTicket.button.submit")}
      </Button>
    </div>
  );
};
export default NewTicket;
