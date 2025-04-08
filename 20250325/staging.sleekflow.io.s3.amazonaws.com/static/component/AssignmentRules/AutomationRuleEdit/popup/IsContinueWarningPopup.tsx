import React from "react";
import { Button, Header, Image, Modal } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import WarningIcon from "../../../../assets/images/icons/warning.svg";
import styles from "./IsContinueWarningPopup.module.css";

export const IsContinueWarningPopup = (props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  publish: () => void;
}) => {
  const { open, setOpen, publish } = props;
  const { t } = useTranslation();

  return (
    <Modal open={open} className={styles.modal}>
      <div className={styles.header}>
        <Image src={WarningIcon} />
        {t("automation.rule.popup.isContinue.header")}
      </div>
      <div>
        <Header>{t("automation.rule.popup.isContinue.title")}</Header>
        <p>{t("automation.rule.popup.isContinue.content")}</p>
      </div>
      <div className={styles.actions}>
        <Button
          primary
          onClick={() => {
            publish();
            setOpen(false);
          }}
        >
          {t("automation.rule.popup.isContinue.button.publish")}
        </Button>
        <Button onClick={() => setOpen(false)}>
          {t("automation.rule.popup.isContinue.button.cancel")}
        </Button>
      </div>
    </Modal>
  );
};
