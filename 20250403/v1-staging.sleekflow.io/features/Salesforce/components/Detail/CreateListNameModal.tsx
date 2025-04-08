import React, { useState } from "react";
import { Button } from "component/shared/Button/Button";
import { submitContactListByCampaignId } from "features/Salesforce/API/Campaigns/submitContactListByCampaignId";
import { LeadNormalizedType } from "features/Salesforce/API/Leads/fetchLeads";
import { useTranslation } from "react-i18next";
import { Input, Modal } from "semantic-ui-react";
import styles from "./CreateListNameModal.module.css";
import { FieldError } from "component/shared/form/FieldError";

export const CreateListNameModal = (props: {
  mainModalClose: () => void;
  subModalClose: () => void;
  data: LeadNormalizedType;
}) => {
  const { data, mainModalClose, subModalClose } = props;
  const { t } = useTranslation();
  const [contactName, setContactName] = useState("");
  const [hasError, setError] = useState<Boolean>(false);
  const addToContactList = async () => {
    if (contactName.trim() === "") {
      setError(true);
      return;
    }
    try {
      await submitContactListByCampaignId({
        campaignId: data["salesforce-integrator:Id"],
        newContactListName: contactName,
      });
    } catch (e) {
      console.error("addToContactList e: ", e);
    } finally {
      mainModalClose();
      subModalClose();
    }
  };

  return (
    <Modal open className={styles.subModal} onClose={subModalClose}>
      <Modal.Content className={styles.content}>
        <div className={styles.title}>
          {t("salesforce.campaigns.subModal.title")}
        </div>
        <label className={styles.listNameLabel}>
          {t("salesforce.campaigns.subModal.label")}
        </label>
        <Input
          className={`${styles.listNameInput} ${hasError ? "error" : ""}`}
          onChange={(e) => setContactName(e.target.value as string)}
          value={contactName}
          placeholder={t("salesforce.campaigns.subModal.placeholder")}
        />
        {hasError && (
          <FieldError
            text={t("salesforce.campaigns.subModal.error.required")}
            className={styles.errorMsg}
          />
        )}
        <div className={styles.actions}>
          <Button blue onClick={subModalClose}>
            {t("salesforce.campaigns.subModal.actions.cancel")}
          </Button>
          <Button primary onClick={addToContactList}>
            {t("salesforce.campaigns.subModal.actions.confirm")}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  );
};
