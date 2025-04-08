import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../../../component/shared/Button/Button";
import styles from "./SendOverlay.module.css";
import { useAppDispatch } from "AppRootContext";

const SendOverlay = (props: {
  pageId: string | undefined;
  fbReceiverId: string | undefined;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Button
          customSize={"mid"}
          primary
          onClick={() => {
            dispatch({ type: "INBOX.FACEBOOK.MESSAGE_TYPE.SHOW_MODAL" });
          }}
        >
          {t("chat.facebookOTN.overlay.actions.choose")}
        </Button>
      </div>
    </div>
  );
};
export default SendOverlay;
