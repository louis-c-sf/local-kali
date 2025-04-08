import { array, mixed, object, string, TestContext } from "yup";
import { AssignmentRuleType } from "../../../../types/AssignmentRuleType";
import { recurringJobSchema, scheduleSchema } from "../ScheduleForm";
import { AbstractConditionField } from "../fields/AbstractConditionField";
import { TFunction } from "i18next";
import { whereEq } from "ramda";
import { ConditionNameType } from "../../../../config/ProfileFieldMapping";
import { isDefaultAssignmentRule } from "../../filters";
import {
  AutomationActionType,
  SendMessageAutomationActionType,
} from "types/AutomationActionType";
import { ButtonType } from "component/Chat/InteractiveMessage/InteractiveMessageSchema";
import { actionsSchema } from "./actionsValidation";

function defaultValidateSchema(t: TFunction, values: AssignmentRuleType) {
  const baseSchema = object({
    channelsWithIds: array().ensure(),
  })
    .default(undefined)
    .strict(true);
  if (isDefaultAssignmentRule(values)) {
    return baseSchema;
  } else {
    return baseSchema.concat(
      object({
        ruleName: string().when("isDefault", {
          is: "true",
          then: string(),
          otherwise: string().required(
            t("automation.rule.field.title.error.required")
          ),
        }),
      })
    );
  }
}

export function ruleEditSchema(values: AssignmentRuleType, t: TFunction) {
  const validateSchema = defaultValidateSchema(t, values)
    .concat(
      object({
        schedule: scheduleSchema(t),
      })
    )
    .concat(sendMessageSchema(t))
    .concat(
      object({
        automationActions: actionsSchema(t, true),
      })
    )
    .concat(recurringJobSchema(t))
    .concat(
      object({
        ruleName: string().when("automationType", {
          is: "Assignment",
          then: string().test(
            "assignment present",
            t("automation.action.assignment.error.required"),
            function (this: TestContext) {
              if (
                !values.automationActions.some(
                  whereEq({ automatedTriggerType: "Assignment" })
                )
              ) {
                throw this.createError({ path: "automationActions" });
              }
              return true;
            }
          ),
        }),
      })
    );
  if (
    values.automationType === "Assignment" ||
    values.automationType === "FacebookPostComment" ||
    values.automationType === "InstagramMediaComment"
  ) {
    return validateSchema;
  } else {
    return validateSchema.concat(
      object({
        conditionFields: conditionsSchema(t),
      })
    );
  }
}
function sendMessageSchema(t: TFunction) {
  return object({
    automationActions: array().of(
      mixed().test(
        "SendMessageAction",
        t("automation.action.sendMessage.error.required"),
        function (this: TestContext, value?: SendMessageAutomationActionType) {
          if (
            !value?.messageContent &&
            !value?.sendWhatsappTemplate &&
            value?.automatedTriggerType === "SendMessage"
          ) {
            throw this.createError({
              message: t("automation.action.sendMessage.error.required"),
              path: this.path,
            });
          }
          const interactiveMessageAction = value?.sendInteractiveMessageState;
          if (
            ButtonType.LIST_MESSAGE.valueOf() ===
              interactiveMessageAction?.buttonType &&
            interactiveMessageAction.listMessage
          ) {
            if (!interactiveMessageAction.listMessage?.title) {
              throw this.createError({
                message: t(
                  "automation.action.sendMessage.error.listMessage.required.title"
                ),
                path: this.path,
              });
            } else if (
              interactiveMessageAction.listMessage?.sections.length > 0
            ) {
              interactiveMessageAction.listMessage?.sections.forEach(
                (section) => {
                  section.options.forEach((message, index) => {
                    if (!message.name) {
                      throw this.createError({
                        message: t(
                          "automation.action.sendMessage.error.listMessage.required.name"
                        ),
                        path: this.path,
                      });
                    }
                  });
                }
              );
            }
          }
          return true;
        }
      )
    ),
  });
}
export function conditionsSchema(t: TFunction) {
  return array()
    .min(1, t("automation.rule.form.condition.error.minimumConditions"))
    .of(
      mixed().test(
        "Condition",
        t("automation.rule.form.condition.error.invalid"),
        function (this: TestContext, value?: AbstractConditionField) {
          const possibleOperators = value?.getFieldConditionsAvailable() ?? [];
          if (
            value === undefined ||
            !possibleOperators.includes(
              value.getFormConditionOperator() as ConditionNameType
            )
          ) {
            //todo skip silently?
            throw this.createError({
              message: t("automation.rule.form.condition.error.missing"),
              path: this.path,
            });
          }
          const error = value.validate(t);

          if (error) {
            throw this.createError({ message: error, path: this.path });
          }
          return true;
        }
      )
    );
}
