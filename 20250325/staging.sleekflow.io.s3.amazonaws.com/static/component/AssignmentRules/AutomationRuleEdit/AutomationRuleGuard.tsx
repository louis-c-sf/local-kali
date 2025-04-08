import {
  AssignmentRuleType,
  AutomationTypeEnum,
} from "../../../types/AssignmentRuleType";
import { isDefaultAssignmentRule, isActionPresent } from "../filters";
import { AbstractConditionField } from "./fields/AbstractConditionField";
import {
  AutomationActionType,
  AutomationActionTypeEnum,
  isSendMessageAction,
  WaitableDenormalized,
} from "../../../types/AutomationActionType";
import { propEq } from "ramda";
import { AWAY_STATUS_FIELD_NAME_DENORMALIZED } from "../../../config/ProfileFieldMapping";
import { PostCommentAutomationType } from "./CreateRule/FbIg/PostCommentTypes";
import { KeywordsField } from "./fields/KeywordsField";
import { RegexField } from "./fields/RegexField";

const SINGLETON_FIELDS = [AWAY_STATUS_FIELD_NAME_DENORMALIZED];

export const SINGLETON_ACTIONS = [
  "RemoveFromList",
  "AddToList",
  "ChangeConversationStatus",
] as AutomationActionTypeEnum[];

export class AutomationRuleGuard {
  private readonly rule: AssignmentRuleType;

  constructor(rule: AssignmentRuleType) {
    this.rule = rule;
  }

  isNew() {
    return this.rule.id === undefined;
  }

  isDraft() {
    return this.rule.status === "Draft" || !this.rule.status;
  }

  canPreview() {
    return this.rule.automationActions.some(
      (row) =>
        row.automatedTriggerType === "FacebookInitiateDm" ||
        row.automatedTriggerType === "InstagramInitiateDm"
    );
  }

  isDefaultRule() {
    return isDefaultAssignmentRule(this.rule);
  }

  canUpdateName() {
    return !this.isDefaultRule();
  }

  canHaveSchedule() {
    return this.rule.automationType === "RecurringJob";
  }

  canAddConditionField(field: AbstractConditionField) {
    if (!this.canHaveConditions()) {
      return false;
    }
    if (field instanceof RegexField) {
      return this.rule.automationType === "OutgoingMessageTrigger";
    }
    if (SINGLETON_FIELDS.includes(field.fieldName)) {
      return !this.rule.conditionFields.some(
        propEq("fieldName", field.fieldName)
      );
    }
    if (field instanceof KeywordsField) {
      return this.rule.automationType === "MessageReceived";
    }
    if (field.fieldName === "Language") {
      return ["MessageReceived", "NewContactMessage"].includes(
        this.rule.automationType
      );
    }
    return true;
  }

  canSendInteractiveMessage() {
    return [
      "MessageReceived",
      "NewContactMessage",
      "OutgoingMessageTrigger",
      "RecurringJob",
      "FieldValueChanged",
    ].includes(this.rule.automationType);
  }

  isTemplateMessageExist() {
    return this.rule.automationActions.some(
      (s) =>
        isSendMessageAction(s) &&
        s.whatsApp360DialogExtendedAutomationMessages?.some(
          (m) => m.messageType === "template"
        )
    );
  }

  canHaveConditions() {
    return !this.isDefaultRule();
  }

  canHavePostCommentCondition(
    type: AutomationTypeEnum
  ): type is PostCommentAutomationType {
    return ["FacebookPostComment", "InstagramMediaComment"].includes(type);
  }

  canDeleteAssignments() {
    return !this.isDefaultRule();
  }

  canAddAction(type: AutomationActionTypeEnum) {
    if (SINGLETON_ACTIONS.includes(type)) {
      return !isActionPresent(type, this.rule.automationActions);
    }
    switch (type) {
      case "Assignment":
        return !this.isDefaultRule();

      case "SendWebhook":
        return (
          [
            "NewContactMessage",
            "MessageReceived",
            "ContactAdded",
            "FieldValueChanged",
            "OutgoingMessageTrigger",
          ].includes(this.rule.automationType) &&
          !isActionPresent(type, this.rule.automationActions)
        );

      default:
        return true;
    }
  }

  canSaveAsDraft() {
    return !this.isDefaultRule();
  }

  canAddWaitAction(action: AutomationActionType) {
    return (
      !this.isDefaultRule() &&
      !(action as WaitableDenormalized)?.actionWaitDenormalized
    );
  }

  //TODO: maybe add FB/IG type
  canSetAutomationType(type: AutomationTypeEnum) {
    switch (this.rule.automationType) {
      case "ContactAdded":
      case "FieldValueChanged":
        return ["FieldValueChanged", "ContactAdded"].includes(type);
      default:
        return type === this.rule.automationType;
    }
  }

  canTriggerOnlyNewContacts() {
    return [
      "MessageReceived",
      "NewContactMessage",
      "ShopifyNewCustomerTrigger",
      "ShopifyUpdatedCustomerTrigger",
    ].includes(this.rule.automationType);
  }

  canTriggerOnlyNewShopifyContacts() {
    return ["ShopifyNewCustomerTrigger"].includes(this.rule.automationType);
  }
}
