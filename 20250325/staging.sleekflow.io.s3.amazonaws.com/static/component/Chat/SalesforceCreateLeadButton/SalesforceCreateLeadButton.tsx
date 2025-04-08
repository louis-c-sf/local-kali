import React from "react";
import { Button } from "component/shared/Button/Button";
import { Image } from "semantic-ui-react";
import SalesforceImg from "./assets/Salesforce.svg";
import styles from "./SalesforceCreateLeadButton.module.css";
import { useTranslation } from "react-i18next";
export function SalesforceCreateLeadButton({
  setIsCreateListOpened,
}: {
  setIsCreateListOpened: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      className={styles.button}
      onClick={() => setIsCreateListOpened(true)}
    >
      <Image src={SalesforceImg} />{" "}
      <span className={styles.text}>
        {t("chat.salesforces.button.createList")}
      </span>
    </Button>
  );
}
