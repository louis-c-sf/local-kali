import React, { useState } from "react";
import styles from "./ActionsEditor.module.css";
import { Icon, Modal, Ref } from "semantic-ui-react";
import ActionsForm from "../../AssignmentRules/AutomationRuleEdit/ActionsForm";
import {
  AutomationActionType,
  AutomationActionTypeEnum,
  WaitableDenormalized,
} from "../../../types/AutomationActionType";
import { actionsSchema } from "../../AssignmentRules/AutomationRuleEdit/validation/actionsValidation";
import { useTranslation } from "react-i18next";
import { isActionPresent } from "../../AssignmentRules/filters";
import { SINGLETON_ACTIONS } from "../../AssignmentRules/AutomationRuleEdit/AutomationRuleGuard";
import { Button } from "../../shared/Button/Button";
import { useFormik } from "formik";
import { AddAction } from "../../AssignmentRules/AutomationRuleEdit/ActionsForm/AddAction";
import { object } from "yup";
import { F } from "ramda";
import { useLookThroughScrollableModal } from "../../../lib/effects/geometry/useLookThroughScrollableModal";

export function ActionsEditor(props: {
  actions: AutomationActionType[];
  save: (actions: AutomationActionType[]) => void;
  close: () => void;
}) {
  const { actions, save, close } = props;
  const { t } = useTranslation();

  const form = useFormik({
    initialValues: { actions },
    validationSchema: object({ actions: actionsSchema(t) }),
    validateOnChange: false,
    validateOnBlur: true, // without this, immediate click on Save/Draft button saves the previous form state
    onSubmit: async (values) => {
      save(values.actions);
      close();
    },
  });

  const [modalContentElement, setModalContentElement] =
    useState<HTMLElement | null>(null);

  const { wrapContent } = useLookThroughScrollableModal({
    modalContentElement: modalContentElement,
  });

  const validationErrors =
    (form.errors?.actions as Array<{ wait: string; action: string }>) ?? [];

  function getWaitError(index: number) {
    return validationErrors[index]?.wait;
  }

  function getActionError(index: number) {
    return validationErrors[index]?.action;
  }

  function updateActions(
    handler: (actions: AutomationActionType[]) => AutomationActionType[]
  ) {
    form.setFieldValue("actions", handler(form.values.actions));
  }

  function canAddAction(type: AutomationActionTypeEnum) {
    if (type === "SendWebhook") {
      return false;
    }
    if (SINGLETON_ACTIONS.includes(type) || "Assignment" === type) {
      return !isActionPresent(type, form.values.actions);
    }
    return true;
  }

  function canAddWaitAction(
    action: AutomationActionType & WaitableDenormalized
  ) {
    return !action.actionWaitDenormalized;
  }

  function addAction(action: AutomationActionType) {
    form.setFieldValue("actions", [...form.values.actions, action]);
  }

  return (
    <Modal
      open
      className={styles.modal}
      onClose={close}
      closeOnDocumentClick={false}
      closeOnDimmerClick={false}
    >
      <Icon name={"close"} onClick={close} />
      <Modal.Header className={styles.modalHeader}>
        <div className={styles.header}>
          {t("broadcast.edit.actionsModal.header")}
        </div>
        <div className={styles.subheader}>
          {t("broadcast.edit.actionsModal.subheader")}
        </div>
      </Modal.Header>
      <Ref innerRef={setModalContentElement}>
        <Modal.Content
          scrolling
          className={`
        ${styles.content}
        ${actions.length > 1 ? styles.sortable : ""}
      `}
        >
          {wrapContent(
            <div className={styles.form}>
              <ActionsForm
                showTitle={false}
                readonly={false}
                showAddAction={false}
                values={form.values.actions}
                updateActions={updateActions}
                getWaitError={getWaitError}
                getActionError={getActionError}
                isDefaultRule={false}
                canDeleteAssignments={true}
                canAddAction={canAddAction}
                canAddWaitAction={canAddWaitAction}
                canHavePostCommentCondition={false}
                canSendInteractiveMessage={F}
                automationType={undefined}
              />
            </div>
          )}
        </Modal.Content>
      </Ref>
      <Modal.Actions className={styles.buttons}>
        <AddAction
          addAction={addAction}
          existingActions={form.values.actions}
          hasFbIgType={false}
          setActionsPending={() => null}
          canAddAction={canAddAction}
          excludeActions={[
            "SendMedia",
            "SendWebhook",
            "SendMessage",
            "FacebookInitiateDm",
            "FacebookReplyComment",
            "InstagramInitiateDm",
            "InstagramReplyComment",
          ]}
          renderTrigger={(togglePopup) => (
            <Button onClick={togglePopup}>
              {t("automation.rule.form.actions.button.addAction")}
            </Button>
          )}
        />
        <Button
          content={t("form.button.save")}
          onClick={form.submitForm}
          primary
        />
      </Modal.Actions>
    </Modal>
  );
}
