import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Dimmer, DimmerDimmable, Loader } from "semantic-ui-react";
import { AutomationTypeEnum } from "../../../types/AssignmentRuleType";
import { AssignmentAction } from "./actions/AssignmentAction";
import { SendMessageActionMemo } from "./actions/SendMessageAction";
import { FieldError } from "../../shared/form/FieldError";
import { ListOperationAction } from "./actions/ListOperationAction";
import { SendMediaAction } from "./actions/SendMediaAction";
import UpdateCustomFieldsAction from "./actions/UpdateCustomFieldsAction";
import { AddAction } from "./ActionsForm/AddAction";
import {
  AutomationActionType,
  AutomationActionTypeEnum,
  WaitActionType,
} from "../../../types/AutomationActionType";
import ChangeConversationStatusAction from "./actions/ChangeConversationStatusAction";
import { HashTagOperationAction } from "./actions/HashTagOperationAction";
import { useTranslation } from "react-i18next";
import { AUTOMATION_MAIN_NODE_ID } from "../../../container/AutomationRuleEdit";
import { AddCollaboratorAction } from "./actions/AddCollaboratorAction";
import SendWebhookAction from "./actions/SendWebhookAction/SendWebhookAction";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";
import { useCompanyHashTags } from "../../Settings/hooks/useCompanyHashTags";
import ReplyCommentAction from "./actions/ReplyCommentAction";
import SendDirectMessage from "./actions/SendDirectMessages/SendDirectMessage";
import { WrapAction } from "./Action/WrapAction";
import styles from "./Action/ActionsForm.module.css";
import {
  ActionFormContext,
  ActionFormContextType,
} from "./ActionsForm/ActionFormContext";
import { append, F } from "ramda";
import { Button } from "../../shared/Button/Button";
import { useTeams } from "../../../container/Settings/useTeams";
import uuid from "uuid";

export interface WaitableActionProps {
  waitError: string | undefined;
  waitActionAdd: (action: WaitActionType) => void;
  waitActionChange: (action: WaitActionType) => void;
  waitActionRemove: () => void;
}

type ActionsWritableFormProps = {
  values: AutomationActionType[];
  readonly: false;
  ruleId?: string;
  error?: string;
  updateActions: (
    handler: (actions: AutomationActionType[]) => AutomationActionType[]
  ) => void;
  getWaitError: (index: number) => string | undefined;
  getActionError: (index: number) => string | undefined;
  isDefaultRule: boolean;
  canDeleteAssignments: boolean;
  canAddAction: (type: AutomationActionTypeEnum) => boolean;
  canAddWaitAction: (type: AutomationActionType) => boolean;
  canSendInteractiveMessage: (type: AutomationActionType) => boolean;
  canHavePostCommentCondition: boolean;
  automationType?: AutomationTypeEnum;
  showTitle: boolean;
  showAddAction: boolean;
};

type ActionsReadonlyFormProps = {
  values: AutomationActionType[];
  readonly: true;
  error?: never;
  ruleId?: never;
  updateActions?: never;
  isDefaultRule?: never;
  canDeleteAssignments?: never;
  canHavePostCommentCondition?: never;
  automationType?: never;
  showTitle?: never;
};

type ActionsFormProps = ActionsWritableFormProps | ActionsReadonlyFormProps;

function ActionsForm(props: ActionsFormProps) {
  const {
    ruleId,
    values,
    error,
    updateActions,
    isDefaultRule,
    canDeleteAssignments,
    canHavePostCommentCondition,
    automationType,
    readonly,
  } = props;
  const { t } = useTranslation();
  const { lists } = useImportedLists();
  const { companyTags: tags } = useCompanyHashTags();
  const { refreshTeams, booted: teamsBooted } = useTeams();

  useEffect(() => {
    if (!teamsBooted) {
      refreshTeams();
    }
  }, [teamsBooted]);

  const [componentSortedId, setComponentSortedId] = useState<string>();
  const [actionsPending, setActionsPending] = useState(false);
  const [listNode, setListNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!listNode) {
      return;
    }
    if (componentSortedId === undefined) {
      return;
    }
    const scrollParent = document.getElementById(AUTOMATION_MAIN_NODE_ID);
    const actionNode = listNode.querySelector(
      `.${styles.action}[data-action-id="${componentSortedId}"]`
    );
    if (scrollParent && actionNode) {
      const actionRect = actionNode.getBoundingClientRect();
      const parentRect = scrollParent.getBoundingClientRect();
      const scrollY = scrollParent.scrollTop;
      const actionTop = actionRect.top;
      const parentTop = parentRect.top;

      scrollParent.scrollTo({
        top: scrollY + (actionTop - parentTop) - 20,
        behavior: "smooth",
      });
    }
    setComponentSortedId(undefined);
  }, [listNode, componentSortedId]);

  const stubFunction = useCallback(() => undefined, []);
  const handleSort = (id: string) => {
    setComponentSortedId(id);
  };

  const addAction = (action: AutomationActionType) => {
    updateActions &&
      updateActions((actions) =>
        append(action, actions).map((action, idx) => ({
          ...action,
          order: idx + 1,
          componentId: action.componentId ?? uuid(),
        }))
      );
  };

  let contextValue: ActionFormContextType;
  if (props.readonly === true) {
    contextValue = {
      handleSort: stubFunction,
      updateActions: stubFunction,
      actions: values,
      getActionError: stubFunction,
      getWaitError: stubFunction,
      canAddWaitAction: F,
      canSendInteractiveMessage: F,
      readonly,
    };
  } else {
    contextValue = {
      handleSort,
      updateActions: props.updateActions,
      actions: values,
      getActionError: props.getActionError,
      getWaitError: props.getWaitError,
      canAddWaitAction: props.canAddWaitAction,
      canSendInteractiveMessage: props.canSendInteractiveMessage,
      readonly,
    };
  }

  return (
    <DimmerDimmable as={"div"} className={styles.section}>
      <Dimmer inverted active={actionsPending}>
        <Loader active={actionsPending} />
      </Dimmer>
      <ActionFormContext.Provider value={contextValue}>
        {props.showTitle &&
          (isDefaultRule ? (
            <>
              <div className={styles.title}>
                {t("automation.rule.form.default.hint.head")}
              </div>
              <div className="field-note">
                {t("automation.rule.form.default.hint.subhead")}
              </div>
            </>
          ) : (
            <>
              <label>{t("automation.rule.form.actions.header")}</label>
              <div className="field-note">
                {canHavePostCommentCondition
                  ? t("automation.rule.form.actions.subHead.postComment")
                  : t("automation.rule.form.actions.subHead.default")}
              </div>
            </>
          ))}
        {!readonly && error && (
          <FieldError text={error} className={"standalone-error"} />
        )}
        <div className={styles.list} ref={setListNode}>
          {values.map((action, index) => {
            const key = action.componentId;
            switch (action.automatedTriggerType) {
              case "Assignment":
                return (
                  <WrapAction
                    key={key}
                    index={index}
                    deletable={canDeleteAssignments}
                    action={action}
                  >
                    {(waitProps, actionProps) => (
                      <AssignmentAction
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );

              case "SendMessage":
                return (
                  <WrapAction key={key} index={index} action={action} raised>
                    {(waitProps, actionProps) => (
                      <SendMessageActionMemo
                        title={t("automation.action.sendMessage.header")}
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );

              case "SendMedia":
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <SendMediaAction
                        action={action}
                        index={index}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );

              case "AddConversationNote":
                return (
                  <WrapAction key={key} index={index} raised action={action}>
                    {(waitProps, actionProps) => (
                      <SendMessageActionMemo
                        title={t("automation.action.addNote.header")}
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );

              case "UpdateCustomFields":
                return (
                  <WrapAction key={key} index={index} raised action={action}>
                    {(waitProps, actionProps) => (
                      <UpdateCustomFieldsAction
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );

              case "AddAdditionalAssignee":
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <AddCollaboratorAction
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );

              case "AddToList":
              case "RemoveFromList":
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <ListOperationAction
                        lists={lists}
                        operationType={action.automatedTriggerType}
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );
              case "AddTags":
              case "RemoveTags":
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <HashTagOperationAction
                        operationType={"AddTags"}
                        action={action}
                        hashtags={tags}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );

              case "ChangeConversationStatus":
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <ChangeConversationStatusAction
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );
              case "SendWebhook":
                if (!automationType) {
                  //todo disable previewer instead?
                  return null;
                }
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <SendWebhookAction
                        type={automationType}
                        action={action}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );
              case "FacebookReplyComment":
              case "InstagramReplyComment":
                if (!automationType) {
                  return null;
                }
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <ReplyCommentAction
                        action={action}
                        type={automationType}
                        title={t("automation.action.replyComment.title")}
                        index={index}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );
              case "FacebookInitiateDm":
              case "InstagramInitiateDm":
                return (
                  <WrapAction key={key} index={index} action={action}>
                    {(waitProps, actionProps) => (
                      <SendDirectMessage
                        action={action}
                        title={t("automation.action.initiateDm.title")}
                        index={index}
                        assignmentId={ruleId}
                        {...waitProps}
                        {...actionProps}
                      />
                    )}
                  </WrapAction>
                );
              default:
                return null;
            }
          })}
        </div>
        {!isDefaultRule && !props.readonly && props.showAddAction && (
          <AddAction
            automationType={props.automationType}
            addAction={addAction}
            ruleId={ruleId}
            setActionsPending={setActionsPending}
            canAddAction={props.canAddAction}
            existingActions={props.values}
            hasFbIgType={canHavePostCommentCondition ?? false}
            renderTrigger={(togglePopup) => (
              <Button className={"button-small"} onClick={togglePopup}>
                <i className={"ui app icon chevron down"} />
                {t("automation.rule.form.actions.button.addAction")}
              </Button>
            )}
          />
        )}
      </ActionFormContext.Provider>
    </DimmerDimmable>
  );
}

export default ActionsForm;
