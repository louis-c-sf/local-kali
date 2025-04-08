import { array, mixed, number, object, Schema, string, TestContext } from "yup";
import { isValidationError } from "../../../ChannelConfirmModal";
import {
  AutomationActionType,
  isWaitableDenormalized,
} from "../../../../types/AutomationActionType";
import { TFunction } from "i18next";
import { MessageFormatEnum } from "../CreateRule/FbIg/PostCommentTypes";
import { EmptiableString } from "../../../../utility/yup/EmptiableString";

export function actionsSchema(t: TFunction, removeActionField?: boolean) {
  function validateOrError(schema: Schema<any>, value: any) {
    try {
      schema.validateSync(value, { abortEarly: true });
    } catch (e) {
      if (isValidationError(e)) {
        return e.message;
      }
    }
  }

  return array(
    mixed()
      .required()
      .test(
        "actionsItem",
        "Action fields have errors",
        function (
          this: TestContext,
          value?: EmptiableString<AutomationActionType>
        ) {
          if (value === undefined) {
            throw this.createError({
              path: this.path,
              message: t("automation.rule.error.action"),
            });
          }
          const actionPath = removeActionField
            ? this.path
            : `${this.path}.action`;

          if (isWaitableDenormalized(value)) {
            const waitPath = `${this.path}.wait`;

            if (value.actionWaitDenormalized) {
              const waitSchema = object({
                amount: string()
                  .required()
                  .matches(/^\d+$/)
                  .notOneOf(["0", ""]),
                units: string().required(),
              });

              if (!waitSchema.isValidSync(value.actionWaitDenormalized)) {
                throw this.createError({
                  path: waitPath,
                  message: t("automation.rule.error.waitTime"),
                });
              }

              let unitSchema: Schema<any> = mixed();
              let msg = "";

              switch (value.actionWaitDenormalized.units) {
                case "DAY":
                  msg = t("automation.rule.error.unit.day");
                  unitSchema = number().required(msg).min(1, msg);
                  break;
                case "HOUR":
                  msg = t("automation.rule.error.unit.hour");
                  unitSchema = number().required(msg).min(1, msg).max(23, msg);
                  break;
                case "MINUTE":
                case "SECOND":
                  msg = t("automation.rule.error.unit.other");
                  unitSchema = number().required(msg).min(1, msg).max(59, msg);
                  break;
              }
              const unitsError = validateOrError(
                unitSchema,
                Number(value.actionWaitDenormalized.amount)
              );
              if (unitsError) {
                throw this.createError({ path: waitPath, message: unitsError });
              }
            }
          }
          if (value.automatedTriggerType === "Assignment") {
            if (!string().trim().required().isValidSync(value.assignmentType)) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.assignmentType"),
              });
            }
            if (value.assignmentType.toLowerCase() === "specificperson") {
              if (!value.staffId) {
                throw this.createError({
                  path: actionPath,
                  message: t("automation.rule.error.specifyUser"),
                });
              }
            }
          } else if (value.automatedTriggerType === "SendMessage") {
            if (
              value.sendInteractiveMessageState?.buttonType === "quickReplies"
            ) {
              if (
                !array(string().trim().required()).isValidSync(
                  value.sendInteractiveMessageState?.quickReplies
                )
              ) {
                throw this.createError({
                  path: actionPath,
                  message: t("automation.rule.error.quickReply"),
                });
              }
            }

            if (
              value.sendInteractiveMessageState?.buttonType === "listMessage"
            ) {
              const { listMessage } = value.sendInteractiveMessageState;
              // List message title required
              if (listMessage?.title?.trim() === "") {
                throw this.createError({
                  path: actionPath,
                  message: t("automation.rule.error.listMessage.title"),
                });
              }

              // Section titles are required when there are more than 2 sections
              if (
                listMessage?.sections &&
                listMessage?.sections.length > 1 &&
                listMessage?.sections.some(
                  (section) => section.title?.trim() === ""
                )
              ) {
                throw this.createError({
                  path: actionPath,
                  message: t("automation.rule.error.listMessage.sectionTitle"),
                });
              }

              const allOptions = listMessage?.sections.flatMap((section) =>
                section.options.map((option) => option.name)
              );
              // Option titles are required
              if (allOptions?.some((option) => option?.trim() === "")) {
                throw this.createError({
                  path: actionPath,
                  message: t("automation.rule.error.listMessage.optionTitle"),
                });
              }
            }

            if (
              (value.messageContent === undefined ||
                value.messageContent.trim() === "") &&
              value.sendWhatsappTemplate === undefined
            ) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.sendMessage"),
              });
            }
          } else if (value.automatedTriggerType === "AddAdditionalAssignee") {
            if (value.addAdditionalAssigneeIds.length === 0) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.addCollaborator"),
              });
            }
          } else if (value.automatedTriggerType === "AddToList") {
            if (value.actionAddedToGroupIds.length === 0) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.addToList"),
              });
            }
          } else if (value.automatedTriggerType === "RemoveFromList") {
            if (value.actionRemoveFromGroupIds.length === 0) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.removeFromList"),
              });
            }
          } else if (value.automatedTriggerType === "SendMedia") {
            if (value.uploadedFiles.length === 0) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.sendMedia"),
              });
            }
          } else if (value.automatedTriggerType === "UpdateCustomFields") {
            if (value.actionUpdateCustomFields.length === 0) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.noUpdateSpecified"),
              });
            }
            if (!value.actionUpdateCustomFields[0].customValue) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.specifyValue"),
              });
            }
          } else if (
            value.automatedTriggerType === "FacebookReplyComment" ||
            value.automatedTriggerType === "InstagramReplyComment"
          ) {
            if (value.fbIgAutoReply.messageContent?.trim() === "") {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.sendMessage"),
              });
            }
          } else if (
            value.automatedTriggerType === "FacebookInitiateDm" ||
            value.automatedTriggerType === "InstagramInitiateDm"
          ) {
            if (
              value.fbIgAutoReply.messageFormat === MessageFormatEnum.Text &&
              value.fbIgAutoReply.messageContent?.trim() === ""
            ) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.sendMessage"),
              });
            } else if (
              value.fbIgAutoReply.messageFormat ===
                MessageFormatEnum.Attachment &&
              (!value.fbIgAutoReply.fbIgAutoReplyFiles ||
                value.fbIgAutoReply.fbIgAutoReplyFiles!.length === 0)
            ) {
              throw this.createError({
                path: actionPath,
                message: t("automation.rule.error.sendMedia"),
              });
            }
          }
          return true;
        }
      )
  );
}
