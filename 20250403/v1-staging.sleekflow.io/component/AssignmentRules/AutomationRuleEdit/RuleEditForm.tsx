import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dimmer,
  Dropdown,
  Header,
  Input,
  Loader,
} from "semantic-ui-react";
import { AnyEventObject } from "xstate";
import { useFormik, yupToFormErrors } from "formik";
import AssignmentResponseType, {
  AssignmentRuleFormType,
  AssignmentRuleType,
  AutomationTypeEnum,
  flattenCondition,
} from "../../../types/AssignmentRuleType";
import { ValidationError } from "yup";
import { FieldError } from "../../shared/form/FieldError";
import { ConditionsForm } from "./ConditionsForm";
import ScheduleForm from "./ScheduleForm";
import ActionsForm from "./ActionsForm";
import {
  AutomationEditContext,
  AutomationEditEvent,
  automationEditStateMachine,
  AutomationEventSubmit,
} from "../automationEditStateMachine";
import { AutomationRuleGuard } from "./AutomationRuleGuard";
import { useMachine } from "@xstate/react/lib";
import {
  isApiError,
  parseHttpError,
  postWithExceptions,
  putWithExceptions,
} from "../../../api/apiRequest";
import {
  POST_ASSIGNMENT_RULE,
  POST_ASSIGNMENT_RULE_BLANK,
  PUT_PREVIEW_CODE,
  UPDATE_ASSIGNMENT_RULE,
} from "../../../api/apiPath";
import {
  buildAutomationRequest,
  buildNewAutomationRequest,
} from "./buildAutomationRequest";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { withActionsDenormalized } from "./denormalizeAutomationRule";
import { useHistory } from "react-router";
import {
  CAMPAIGN_ID_MAP,
  RuleTemplateType,
  templatePrototype,
} from "./templates";
import { LockedField } from "../../shared/input/LockedField";
import { Trans, useTranslation } from "react-i18next";
import { flatErrors } from "../../../utility/yup/flatErrors";
import { useAutomationRulesLocalized } from "./localizable/useAutomationRulesLocalized";
import { ruleEditSchema } from "./validation/ruleValidation";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import useRouteConfig from "../../../config/useRouteConfig";
import { useFeaturesGuard } from "../../Settings/hooks/useFeaturesGuard";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import InfoTip from "../../shared/infoTip/InfoTip";
import { IsContinueWarningPopup } from "./popup/IsContinueWarningPopup";
import Helmet from "react-helmet";
import useFetchAutomationRules from "../../../api/Company/useFetchAutomationRules";
import { BackLink } from "../../shared/nav/BackLink";
import PostCommentCondition from "./CreateRule/FbIg/PostCommentCondition";
import PreviewCodePortal from "./popup/PreviewCodePortal";
import Statistics from "./CreateRule/FbIg/Statistics";
import styles from "./Action/ActionsForm.module.css";
import { equals, path } from "ramda";
import { AutomationActionType } from "../../../types/AutomationActionType";
import { isSendMessageAction } from "types/AutomationActionType";
import {
  FieldFactoryType,
  NewFieldFactoryType,
} from "./contracts/FieldFactoryType";
import mixpanel from "mixpanel-browser";

function RuleEditForm(props: {
  goBack: () => void;
  isNewRecord: boolean;
  templateChosen?: RuleTemplateType;
  fieldFactory: FieldFactoryType;
  newFieldFactory: NewFieldFactoryType;
  liveRulesCount: number;
  ruleModel?: AssignmentRuleType;
}) {
  const {
    goBack,
    templateChosen,
    isNewRecord,
    newFieldFactory,
    ruleModel,
    liveRulesCount,
  } = props;
  const history = useHistory();
  const { t } = useTranslation();
  const { automationTypeNameMap } = useAutomationRulesLocalized();
  const { denormalizeRule, refreshAutomationRules } = useFetchAutomationRules();
  const loginDispatch = useAppDispatch();

  const featureGuard = useFeaturesGuard();
  const { routeTo } = useRouteConfig();

  const flash = useFlashMessageChannel();
  const company = useAppSelector((s) => s.company, equals);
  const [openWarningPopup, setOpenWarningPopup] = useState(false);
  const [previewCode, setPreviewCode] = useState("");
  const [openPreviewCodePopup, setOpenPreviewCodePopup] = useState(false);
  const templates = useAppSelector(
    (s) => s.inbox.whatsAppTemplates.whatsapp360Templates,
    equals
  );

  function denormalizeResponse(
    response: AssignmentResponseType
  ): AssignmentRuleType {
    return withActionsDenormalized(denormalizeRule(response));
  }

  function denormalizedPostCommentConditions(
    response: AssignmentRuleType
  ): AssignmentRuleType {
    let pageId = "";
    let postId = "";
    let keywords: string[] = [];
    const newConditions = response.conditions.filter((cond) => {
      const filteredItems = flattenCondition(cond).filter((f) => {
        if (f.fieldName === "pageid") {
          pageId = f.values ? f.values[0] : "";
          return false;
        } else if (f.fieldName === "postid") {
          postId = f.values ? f.values[0] : "";
          return false;
        } else if (f.fieldName === "keywords") {
          keywords = f.values ? f.values : [];
          return false;
        } else {
          return true;
        }
      });
      return filteredItems.length > 0;
    });
    response.conditions = newConditions;
    response.postCommentConditionFields = {
      pageId,
      postId,
      keywords,
      noPosts: false,
    };
    return response;
  }

  async function preloadFromTemplate() {
    const listsToPreCreate = templateChosen?.prototype.automationActions.reduce<
      number[]
    >((acc, next) => {
      if (next.automatedTriggerType === "AddToList") {
        return [...acc, ...next.actionAddedToGroupIds];
      }
      if (next.automatedTriggerType === "RemoveFromList") {
        return [...acc, ...next.actionRemoveFromGroupIds];
      }
      return acc;
    }, []);

    const blankParam: any = {
      assignmentRuleName: templateChosen?.prototype.ruleName ?? "",
      automationType:
        templateChosen?.prototype.automationType ?? "MessageReceived",
    };
    let preCreateAlias: string | undefined = undefined;

    if (listsToPreCreate) {
      const [preCreateId] = listsToPreCreate;
      const aliasPair = Object.entries(CAMPAIGN_ID_MAP).find(
        ([k, v]) => v === preCreateId
      );
      if (aliasPair) {
        preCreateAlias = aliasPair[0];
      }
      if (preCreateAlias) {
        blankParam.createAutomationList = {
          Alias: preCreateAlias,
          ContactListType: "Chatbot",
        };
      }
    }

    const ruleBlank: AssignmentResponseType = await postWithExceptions(
      POST_ASSIGNMENT_RULE_BLANK,
      { param: blankParam }
    );

    const prototypeDenormalized: AssignmentRuleFormType = {
      ...denormalizeResponse(ruleBlank),
      ...(templateChosen?.prototype ?? {}),
      isDefault: false,
      status: "Draft",
      id: ruleBlank.assignmentId,
    };

    if (listsToPreCreate && preCreateAlias) {
      const { associatedList } = ruleBlank;
      let prototypeValues = prototypeDenormalized;
      if (associatedList) {
        prototypeValues.automationActions =
          prototypeValues.automationActions.map((a) => {
            if (a.automatedTriggerType === "AddToList") {
              return { ...a, actionAddedToGroupIds: [associatedList.id] };
            }
            if (a.automatedTriggerType === "RemoveFromList") {
              return { ...a, actionRemoveFromGroupIds: [associatedList.id] };
            }
            return a;
          });
        form.setValues(prototypeValues);
        loginDispatch({ type: "LIST_ADDED", list: associatedList });
        return;
      }
    }

    form.setValues(prototypeDenormalized);
    return;
  }

  const [machine, machineSend] = useMachine<
    AutomationEditContext,
    AutomationEditEvent
  >(automationEditStateMachine, {
    guards: {
      isExistingEntity: (c, e) => isNewRecord,
    },
    actions: {
      showError: (c, e) => {
        const error = (e as any).data;
        const errorParsed = parseHttpError(error);
        if (isApiError(errorParsed)) {
          if (errorParsed.errorId === "ERR_RULES_LIMIT_BY_PLAN") {
            flash(t("flash.automation.maxRules"));
          } else if (errorParsed.errorId === "ERR_RULES_LIMIT_RECURRING") {
            flash(t("flash.automation.notAllowedScheduling"));
          }
        }
      },
    },
    services: {
      formPreload: async (c, e) => {
        if (!isNewRecord && ruleModel) {
          try {
            let ruleForEdit = { ...ruleModel };
            if (
              formGuard.canHavePostCommentCondition(ruleModel.automationType)
            ) {
              ruleForEdit = denormalizedPostCommentConditions(ruleForEdit);
            }
            form.setValues(ruleForEdit);
          } catch (e) {
            flash(t("flash.automation.notFound"));
            return goBack();
          }
        } else {
          preloadFromTemplate();
        }
      },

      formSubmit: async (c, event: AutomationEventSubmit | AnyEventObject) => {
        try {
          await saveAssignmentRule(event.values);
          refreshAutomationRules();

          if (event.values.isPreview && formGuard.isDraft()) {
            const { previewCode } = await putWithExceptions(
              PUT_PREVIEW_CODE.replace("{assignmentId}", event.values.id),
              {
                param: {
                  isPreview: true,
                },
              }
            );
            setPreviewCode(previewCode);
            setOpenPreviewCodePopup(true);
          }

          if (isNewRecord && !event.values.isPreview) {
            return history.push(routeTo("/automations"), {
              selectTriggerType: event.values.automationType,
            });
          }
        } catch (e) {
          console.error("saveAssignmentRule", e);
          throw e;
        }
      },
    },
  });

  const form = useFormik<AssignmentRuleType>({
    initialValues: templateChosen?.prototype ?? templatePrototype(""),
    validateOnChange: false,
    validateOnBlur: true, // without this, immediate click on Save/Draft button saves the previous form state
    validate: (values: AssignmentRuleType) => {
      const validator = ruleEditSchema(values, t);
      try {
        validator.validateSync(values, {
          abortEarly: false,
          strict: true,
          recursive: true,
        });
      } catch (e) {
        if (ValidationError.isError(e)) {
          return yupToFormErrors(e);
        }
        console.error("#ruled.validate", e);
        return { ruleName: t("form.field.any.error.common") };
      }
    },
    onSubmit: (values) => {
      machineSend({ type: "SUBMIT", values });
    },
  });

  useEffect(() => {
    if (machine.nextEvents.includes("BOOT")) {
      machineSend("BOOT");
    }
  }, [machine.value]);

  const saveAssignmentRule = async (
    values: AssignmentRuleFormType
  ): Promise<AssignmentResponseType[]> => {
    const saveGuard = new AutomationRuleGuard(values);
    if (!isNewRecord) {
      const assignmentRequest = buildAutomationRequest(
        values,
        saveGuard,
        company
      );
      const updated: AssignmentResponseType[] = await postWithExceptions(
        UPDATE_ASSIGNMENT_RULE,
        { param: [{ ...assignmentRequest, assignmentId: values.id }] }
      );
      if (assignmentRequest.status === "Live") {
        mixpanel.track("Automation Published");
      }
      flash(
        saveGuard.isDefaultRule()
          ? t("flash.automation.updated.default")
          : t("flash.automation.updated.regular")
      );

      return updated;
    } else {
      const assignmentRequest = buildNewAutomationRequest(
        values,
        saveGuard,
        company
      );
      const result: AssignmentResponseType[] = await postWithExceptions(
        POST_ASSIGNMENT_RULE,
        { param: [{ ...assignmentRequest, assignmentId: values.id }] }
      );
      if (assignmentRequest.status === "Live") {
        mixpanel.track("Automation Published");
      }
      mixpanel.track("Automation Created");
      flash(t("flash.automation.created"));

      return result;
    }
  };

  async function executeSubmit(toPublic: boolean) {
    try {
      if (Boolean(machine.matches("bootFailed"))) {
        machineSend("RETRY");
      } else {
        form.setFieldValue("status", toPublic ? "Live" : "Draft");
        if (formGuard.canHavePostCommentCondition(form.values.automationType)) {
          form.setFieldValue("isPreview", formGuard.canPreview());
        }
        await form.submitForm();
      }
    } catch (e) {
      console.error("#aut err", e);
      form.setSubmitting(false);
      form.setErrors(e);
    }
  }

  let isFormPending =
    Boolean(machine.matches({ new: { form: "submitting" } })) ||
    Boolean(machine.matches({ stored: { form: "loading" } })) ||
    Boolean(machine.matches({ stored: { form: "submitting" } }));

  const formGuard = new AutomationRuleGuard(form.values);
  useEffect(() => {
    if (
      templates.booted &&
      ruleModel &&
      form.values.automationActions.some(
        (s) =>
          isSendMessageAction(s) &&
          s.sendWhatsappTemplate === undefined &&
          s.whatsApp360DialogExtendedAutomationMessages &&
          s.whatsApp360DialogExtendedAutomationMessages.length > 0 &&
          s.whatsApp360DialogExtendedAutomationMessages[0].messageType ===
            "template"
      )
    ) {
      form.setValues(ruleModel);
    }
  }, [templates.booted, ruleModel, formGuard.isTemplateMessageExist()]);
  const scenarioChoices = Object.entries(automationTypeNameMap)
    .filter(([type]) =>
      formGuard.canSetAutomationType(type as AutomationTypeEnum)
    )
    .map(([type, name], key) => ({
      text: name,
      value: type,
      key,
    }));

  const scenarioEditable = scenarioChoices.length > 1;
  const allowViewRuleHistory =
    ruleModel?.automationActions.find((action) =>
      ["FacebookInitiateDm", "InstagramInitiateDm"].includes(
        action.automatedTriggerType
      )
    ) !== undefined && ruleModel.triggeredCounter > 0;

  const actionsGeneralError =
    typeof form.errors?.automationActions === "string"
      ? form.errors?.automationActions
      : undefined;
  const getActionError = (index: number): string | undefined =>
    path([index], form.errors.automationActions) ?? undefined;
  const getWaitError = (index: number): string | undefined =>
    path([index, "wait"], form.errors.automationActions) ?? undefined;

  const updateActions = (
    handler: (actions: AutomationActionType[]) => AutomationActionType[]
  ) => {
    form.setFieldValue(
      "automationActions",
      handler(form.values.automationActions)
    );
  };

  return (
    <div
      className={`assignment-edit__form ${
        formGuard.isDefaultRule() ? "default-rule" : ""
      }`}
    >
      <Dimmer active={isFormPending} inverted={true}>
        <Loader active={isFormPending} inverted={true} />
      </Dimmer>
      <Helmet title={t("nav.common.title", { page: form.values.ruleName })} />
      <div className="actions assignment-edit__actions">
        <BackLink onClick={goBack} transparent>
          {t("nav.backShort")}
        </BackLink>
        <div className="status">
          <div
            className={`rule-status rule-status-${
              formGuard.isDraft() ? "draft" : "live"
            }`}
          >
            {formGuard.isDefaultRule()
              ? t("automation.rule.default.short")
              : formGuard.isDraft()
              ? t("automation.rule.status.draft")
              : t("automation.rule.status.live")}
          </div>
        </div>

        <div className="buttons">
          {formGuard.canSaveAsDraft() && (
            <PreviewCodePortal
              visible={openPreviewCodePopup}
              previewCode={previewCode}
              handleClose={() => setOpenPreviewCodePopup(false)}
            >
              <Button
                loading={isFormPending}
                onClick={() => executeSubmit(false)}
              >
                {formGuard.isNew() || formGuard.isDraft()
                  ? formGuard.canPreview()
                    ? t("automation.rule.action.saveAndPreview")
                    : t("automation.rule.action.saveDraft")
                  : t("automation.rule.action.switchDraft")}
              </Button>
            </PreviewCodePortal>
          )}
          {featureGuard.canCreateAutomation(liveRulesCount) &&
          !form.values.postCommentConditionFields?.noPosts ? (
            <Button
              className="publish-btn"
              loading={isFormPending}
              onClick={() => {
                if (form.values.isContinue) {
                  setOpenWarningPopup(true);
                } else executeSubmit(true);
              }}
            >
              {formGuard.isDraft()
                ? t("automation.rule.action.publish")
                : t("automation.rule.action.update")}
            </Button>
          ) : (
            <InfoTooltip
              placement={"bottom"}
              children={
                form.values.postCommentConditionFields?.noPosts
                  ? t("automation.tooltip.noSelectedPost")
                  : t("automation.tooltip.maxRules")
              }
              trigger={
                <div className="publish-btn ui button primary disabled">
                  {formGuard.isDraft()
                    ? t("automation.rule.action.publish")
                    : t("automation.rule.action.update")}
                </div>
              }
            />
          )}
        </div>
      </div>
      {!formGuard.isDefaultRule() && (
        <div className="ui form section-panel">
          <div className={`${isFormPending ? "section-content_pending" : ""} `}>
            <div className={` field field-disablable ${styles.section}`}>
              <div className={styles.title}>
                {t("automation.rule.field.title.label")}
              </div>
              {formGuard.canUpdateName() ? (
                <InfoTooltip
                  placement={"left"}
                  children={t("automation.tooltip.edit.title")}
                  trigger={
                    <Input
                      placeholder={
                        [
                          "FacebookPostComment",
                          "InstagramMediaComment",
                        ].includes(form.values.automationType)
                          ? t(
                              "automation.rule.field.title.placeholder.replyPost"
                            )
                          : t("automation.rule.field.title.placeholder.default")
                      }
                      onChange={(event, data) =>
                        form.setFieldValue("ruleName", data.value)
                      }
                      value={form.values.ruleName ?? ""}
                      disabled={isFormPending}
                    />
                  }
                />
              ) : (
                <LockedField text={t("automation.rule.default.long")} />
              )}
              <FieldError text={form.errors.ruleName} />
            </div>
            <div className={`field field-disablable ${styles.section}`}>
              <div className={styles.title}>
                {t("automation.rule.field.scenario.label")}
              </div>
              {scenarioEditable ? (
                <Dropdown
                  fluid
                  selection
                  options={scenarioChoices}
                  value={form.values.automationType}
                  onChange={(_, { value }) => {
                    form.setFieldValue(
                      "automationType",
                      value as AutomationTypeEnum
                    );
                  }}
                />
              ) : (
                <LockedField
                  text={automationTypeNameMap[form.values.automationType]}
                />
              )}
            </div>
            {formGuard.canTriggerOnlyNewContacts() && (
              <div className={`field ${styles.section} section-isContinue`}>
                <Checkbox
                  className="isContinue-field"
                  label={
                    form.values.automationType.includes("Shopify")
                      ? t("automation.rule.field.onlyNewShopifyContacts.label")
                      : t("automation.rule.field.onlyNewContacts.label")
                  }
                  checked={[
                    "NewContactMessage",
                    "ShopifyNewCustomerTrigger",
                  ].includes(form.values.automationType)}
                  onChange={(event, data) =>
                    form.setFieldValue(
                      "automationType",
                      data.checked
                        ? form.values.automationType.includes("Shopify")
                          ? "ShopifyNewCustomerTrigger"
                          : "NewContactMessage"
                        : form.values.automationType.includes("Shopify")
                        ? "ShopifyUpdatedCustomerTrigger"
                        : "MessageReceived"
                    )
                  }
                />
                <span>{t("automation.rule.field.onlyNewContacts.hint")}</span>
              </div>
            )}
            {!formGuard.isDefaultRule() &&
              !["FacebookPostComment", "InstagramMediaComment"].includes(
                form.values.automationType
              ) && (
                <div className={`field ${styles.section} section-isContinue`}>
                  <Checkbox
                    className="isContinue-field"
                    label={t("automation.rule.field.isContinue.label")}
                    checked={form.values.isContinue}
                    onChange={(event, data) =>
                      form.setFieldValue("isContinue", data.checked)
                    }
                  />
                  <span>{t("automation.rule.field.isContinue.hint")}</span>
                </div>
              )}
          </div>
        </div>
      )}
      {!isNewRecord &&
        form.values.status === "Live" &&
        formGuard.canHavePostCommentCondition(form.values.automationType) && (
          <Statistics form={form} allowViewRuleHistory={allowViewRuleHistory} />
        )}
      {formGuard.canHaveConditions() &&
        (formGuard.canHavePostCommentCondition(form.values.automationType) ? (
          <PostCommentCondition
            form={form}
            automationType={form.values.automationType}
          />
        ) : (
          <div className="ui form section-panel">
            <div className={styles.section}>
              <div className={styles.title}>
                {t("automation.rule.field.conditions.default.label")}
              </div>
              <div className="field-note">
                {t("automation.rule.field.conditions.default.hint")}
              </div>
              <label>
                {t("automation.rule.field.conditions.default.subLabel")}
              </label>
              {typeof form.errors.conditionFields === "string" && (
                <FieldError
                  text={form.errors.conditionFields}
                  className={"standalone-error"}
                />
              )}

              <ConditionsForm form={form} newFieldFactory={newFieldFactory} />
            </div>
          </div>
        ))}
      {formGuard.canHaveSchedule() && (
        <div className="section-panel">
          <div
            className={`ui form ${
              isFormPending ? "section-content_pending" : ""
            } `}
          >
            <ScheduleForm
              interval={form.values.schedule}
              setInterval={(interval) => {
                form.setFieldValue("schedule", interval);
              }}
              removeInterval={() => {
                form.setFieldValue("schedule", undefined);
              }}
              errors={form.errors}
            />
            {flatErrors(form.errors.schedule).length ? (
              <FieldError text={flatErrors(form.errors.schedule)[0]} />
            ) : null}
          </div>
        </div>
      )}
      {formGuard.isDefaultRule() && (
        <div className={"rule-title"}>
          <div className={"rule-title-header"}>
            {t("automation.rule.form.default.head")}
          </div>
          <div className={"rule-title-subheader"}>
            {t("automation.rule.form.default.subhead")}
          </div>
        </div>
      )}
      <div className="section-panel">
        <div className={`${isFormPending ? "section-content_pending" : ""}`}>
          {formGuard.isDefaultRule() && (
            <div className={"default-rule-description"}>
              <Trans i18nKey={"automation.rule.form.default.description"}>
                <Header as={"h3"}>What is Default Assignment Rule?</Header>
                <ul className="checklist">
                  <li>
                    Triggered when no other rules are triggered within the same
                    trigger type
                  </li>
                  <li>
                    Triggered when a new incoming message is not yet assigned
                  </li>
                </ul>
              </Trans>
            </div>
          )}
          <ActionsForm
            showTitle={true}
            showAddAction={true}
            readonly={false}
            ruleId={form.values.id}
            error={actionsGeneralError}
            automationType={form.values.automationType}
            values={form.values.automationActions}
            getActionError={getActionError}
            getWaitError={getWaitError}
            updateActions={updateActions}
            isDefaultRule={formGuard.isDefaultRule()}
            canAddAction={formGuard.canAddAction.bind(formGuard)}
            canDeleteAssignments={formGuard.canDeleteAssignments()}
            canAddWaitAction={formGuard.canAddWaitAction.bind(formGuard)}
            canHavePostCommentCondition={formGuard.canHavePostCommentCondition(
              form.values.automationType
            )}
            canSendInteractiveMessage={formGuard.canSendInteractiveMessage.bind(
              formGuard
            )}
          />
          {formGuard.isDefaultRule() && (
            <InfoTip>{t("automation.rule.form.tips.personalized")}</InfoTip>
          )}
        </div>
      </div>
      <IsContinueWarningPopup
        open={openWarningPopup}
        setOpen={setOpenWarningPopup}
        publish={() => executeSubmit(true)}
      />
    </div>
  );
}

export default RuleEditForm;
