import { AutomationTypeEnum } from "../../../../types/AssignmentRuleType";
import { assignActionDefaults } from "../../../../types/AutomationActionType";
import moment from "moment";
import { RuleTemplateType, templatePrototype } from "../templates";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { IncomingMessageIcon } from "../CreateRule/assets/trigger/IncomingMessageIcon";
import { OutgoingMessageIcon } from "../CreateRule/assets/trigger/OutgoingMessageIcon";
import { UpdatedContactIcon } from "../CreateRule/assets/trigger/UpdatedContactIcon";
import { ScheduleIcon } from "../CreateRule/assets/trigger/ScheduleIcon";
import {
  facebookInitiateDmActionDefaults,
  facebookReplyCommentActionDefaults,
  instagramInitiateDmActionDefaults,
  instagramReplyCommentActionDefaults,
} from "../CreateRule/FbIg/PostCommentTypes";
import { RegexField } from "../fields/RegexField";
import { useFieldLocales } from "../../../Contact/locaizable/useFieldLocales";

export function useAutomationRulesLocalized() {
  const { t } = useTranslation();
  const { staticFieldDisplayNames } = useFieldLocales();

  const typeNameMap: Record<AutomationTypeEnum, string> = {
    Assignment: t("automation.rule.type.name.Assignment"),
    ContactAdded: t("automation.rule.type.name.ContactAdded"),
    FieldValueChanged: t("automation.rule.type.name.FieldValueChanged"),
    MessageReceived: t("automation.rule.type.name.MessageReceived"),
    RecurringJob: t("automation.rule.type.name.RecurringJob"),
    NewContactMessage: t("automation.rule.type.name.NewContactMessage"),
    ShopifyNewAbandonedCart: t(
      "automation.rule.type.name.ShopifyNewAbandonedCart"
    ),
    ShopifyNewCustomerTrigger: t(
      "automation.rule.type.name.ShopifyNewCustomerTrigger"
    ),
    ShopifyUpdatedCustomerTrigger: t(
      "automation.rule.type.name.ShopifyNewCustomerTrigger"
    ),
    ShopifyNewOrUpdatedOrderTrigger: t(
      "automation.rule.type.name.ShopifyNewOrUpdatedOrderTrigger"
    ),
    ShopifyFulfillmentStatusTrigger: t(
      "automation.rule.type.name.ShopifyFulfillmentStatusTrigger"
    ),
    FacebookPostComment: t("automation.rule.type.name.FacebookPostComment"),
    InstagramMediaComment: t("automation.rule.type.name.InstagramPostComment"),
    OutgoingMessageTrigger: t(
      "automation.rule.type.name.OutgoingMessageTrigger"
    ),
  } as const;

  const scheduleIntervalDict: Record<string, string> = {
    DAY: t("automation.rule.type.interval.day"),
    WEEK: t("automation.rule.type.interval.week"),
    MONTH: t("automation.rule.type.interval.month"),
    YEAR: t("automation.rule.type.interval.year"),
  } as const;

  const getBaseTemplates = (): RuleTemplateType[] => {
    return [
      {
        name: typeNameMap["MessageReceived"],
        id: "MessageReceived",
        tooltip: (
          <Trans i18nKey={"automation.tooltip.template.MessageReceived"} />
        ),
        triggerIcon: <IncomingMessageIcon />,
        prototype: templatePrototype(typeNameMap["MessageReceived"], {
          automationType: "MessageReceived",
          automationActions: [assignActionDefaults()],
        }),
      },
      {
        name: typeNameMap["OutgoingMessageTrigger"],
        id: "OutgoingMessageTrigger",
        tooltip: (
          <Trans
            i18nKey={"automation.tooltip.template.OutgoingMessageTrigger"}
          />
        ),
        triggerIcon: <OutgoingMessageIcon />,
        prototype: templatePrototype(typeNameMap["OutgoingMessageTrigger"], {
          automationType: "OutgoingMessageTrigger",
          automationActions: [assignActionDefaults()],
          conditionFields: [
            new RegexField(
              "MessageRegex",
              staticFieldDisplayNames.MessageRegex
            ),
          ],
        }),
      },

      {
        name: typeNameMap["FieldValueChanged"],
        id: "FieldValueChanged",
        tooltip: t("automation.tooltip.template.FieldValueChanged"),
        triggerIcon: <UpdatedContactIcon />,
        prototype: templatePrototype(typeNameMap["FieldValueChanged"], {
          automationType: "FieldValueChanged",
          automationActions: [],
        }),
      },

      {
        name: typeNameMap["RecurringJob"],
        id: "RecurringJob",
        tooltip: t("automation.tooltip.template.RecurringJob"),
        triggerIcon: <ScheduleIcon />,
        prototype: templatePrototype(typeNameMap["RecurringJob"], {
          automationType: "RecurringJob",
          automationActions: [],
          schedule: {
            type: "DAY",
            time: moment({ hour: 12, minute: 0 }),
            amount: [],
          },
        }),
      },
    ];
  };

  const getShopifyTemplates = (): RuleTemplateType[] => {
    return [
      {
        name: typeNameMap["ShopifyNewOrUpdatedOrderTrigger"],
        id: "ShopifyNewOrUpdatedOrderTrigger",
        tooltip: (
          <Trans
            i18nKey={
              "automation.tooltip.template.ShopifyNewOrUpdatedOrderTrigger"
            }
          />
        ),
        triggerIcon: "shopifyOrderUpdate",
        prototype: templatePrototype(
          typeNameMap["ShopifyNewOrUpdatedOrderTrigger"],
          {
            automationType: "ShopifyNewOrUpdatedOrderTrigger",
          }
        ),
      },
      {
        name: typeNameMap["ShopifyNewAbandonedCart"],
        id: "ShopifyNewAbandonedCart",
        tooltip: (
          <Trans
            i18nKey={"automation.tooltip.template.ShopifyNewAbandonedCart"}
          />
        ),
        triggerIcon: "shopifyAbandonedCart",
        prototype: templatePrototype(typeNameMap["ShopifyNewAbandonedCart"], {
          automationType: "ShopifyNewAbandonedCart",
        }),
      },
      {
        name: typeNameMap["ShopifyNewCustomerTrigger"],
        id: "ShopifyNewCustomerTrigger",
        tooltip: (
          <Trans
            i18nKey={"automation.tooltip.template.ShopifyNewCustomerTrigger"}
          />
        ),
        triggerIcon: "shopifyUpdatedCustomers",
        prototype: templatePrototype(typeNameMap["ShopifyNewCustomerTrigger"], {
          automationType: "ShopifyNewCustomerTrigger",
        }),
      },
      {
        name: typeNameMap["ShopifyFulfillmentStatusTrigger"],
        id: "ShopifyFulfillmentStatusTrigger",
        tooltip: (
          <Trans
            i18nKey={
              "automation.tooltip.template.ShopifyFulfillmentStatusTrigger"
            }
          />
        ),
        triggerIcon: "shopifyFulfillmentUpdate",
        prototype: templatePrototype(
          typeNameMap["ShopifyFulfillmentStatusTrigger"],
          {
            automationType: "ShopifyFulfillmentStatusTrigger",
          }
        ),
      },
    ];
  };

  const getFacebookTemplates = (): RuleTemplateType[] => {
    return [
      {
        name: typeNameMap["FacebookPostComment"].replace("Facebook", ""),
        id: "FacebookPostComment",
        tooltip: <Trans i18nKey={"automation.tooltip.template.PostComment"} />,
        triggerIcon: "facebookPostComment",
        prototype: templatePrototype(typeNameMap["FacebookPostComment"], {
          automationType: "FacebookPostComment",
          automationActions: [
            facebookReplyCommentActionDefaults(),
            facebookInitiateDmActionDefaults(),
          ],
          postCommentConditionFields: {
            pageId: "",
            postId: "",
            noPosts: true,
          },
        }),
      },
    ];
  };

  const getInstagramTemplates = (): RuleTemplateType[] => {
    return [
      {
        name: typeNameMap["InstagramMediaComment"].replace("Instagram", ""),
        id: "InstagramMediaComment",
        tooltip: <Trans i18nKey={"automation.tooltip.template.PostComment"} />,
        triggerIcon: "instagramPostComment",
        prototype: templatePrototype(typeNameMap["InstagramMediaComment"], {
          automationType: "InstagramMediaComment",
          automationActions: [
            instagramReplyCommentActionDefaults(),
            instagramInitiateDmActionDefaults(),
          ],
          postCommentConditionFields: {
            pageId: "",
            postId: "",
            noPosts: true,
          },
        }),
      },
    ];
  };

  return {
    automationTypeNameMap: typeNameMap,
    scheduleIntervalDict,
    getBaseTemplates,
    getShopifyTemplates,
    getFacebookTemplates,
    getInstagramTemplates,
  };
}
