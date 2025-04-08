import React from "react";
import { Button, Modal } from "semantic-ui-react";
import { useHistory } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import useRouteConfig from "../../../config/useRouteConfig";
import styles from "./ErrorMessageModal.module.css";

const ErrorMessageModal = (props: {
  show: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const maximumContacts = useAppSelector((s) => s.usage.maximumContacts);
  const { show, closeModal } = props;

  return (
    <Modal
      open={show}
      onClose={closeModal}
      className={styles.modal}
      size={"tiny"}
    >
      <Modal.Header className={styles.header}>
        {t("profile.contacts.errorModal.title")}
      </Modal.Header>
      <Modal.Content className={styles.content}>
        <Modal.Description>
          <Trans
            i18nKey={"profile.contacts.errorModal.content"}
            values={{ maximum: maximumContacts }}
          >
            <p>
              You have exceeded the limit of {{ maximum: maximumContacts }}
              contacts.
              <br />
              Upgrade your plan to create more contacts.
            </p>
          </Trans>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions className={styles.actions}>
        <Button
          className={`${styles.upgradeButton} button-small`}
          onClick={() => {
            history.push(routeTo("/settings/plansubscription"));
          }}
        >
          {t("form.button.upgrade")}
        </Button>
        <Button className={"button-small"} onClick={closeModal}>
          {t("form.button.cancel")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
export default ErrorMessageModal;
