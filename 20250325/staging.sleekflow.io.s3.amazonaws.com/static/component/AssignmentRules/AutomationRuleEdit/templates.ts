import {
  AssignmentRuleFormType,
  AssignmentRuleType,
} from "../../../types/AssignmentRuleType";
import moment from "moment";
import {
  assignActionDefaults,
  AssignmentAutomationActionType,
  orderableActionDefaults,
} from "../../../types/AutomationActionType";
import { TFunction } from "i18next";
import { ReactNode } from "react";
import { StaffType } from "../../../types/StaffType";
import { HASHTAG_FIELD_NAME } from "../../../config/ProfileFieldMapping";
import { IconNameType } from "./CreateRule/FlowIcon";
import { TriggerIconNameType } from "./CreateRule/TriggerIcon";
import { NewFieldFactoryType } from "./contracts/FieldFactoryType";

const WELCOME_CHATBOT_LIST = "WELCOME_CHATBOT_LIST";

export const CAMPAIGN_ID_MAP = {
  [WELCOME_CHATBOT_LIST]: -1,
};

export function templatePrototype(
  name: string,
  extraFields?: Partial<AssignmentRuleType>
): AssignmentRuleType {
  return {
    ruleName: name,
    updatedAt: "",
    conditionFields: [],
    postCommentConditionFields: {},
    automationActions: [],
    automationType: "Assignment",
    channelsWithIds: [],
    conditions: [],
    schedule: undefined,
    status: "Draft",
    ...(extraFields ?? {}),
    order: 0,
    id: undefined,
    isDefault: false,
  } as AssignmentRuleType;
}

export type RuleTemplateType = {
  prototype: AssignmentRuleFormType;
  name: string;
  id: string;
  pictograms?: { from: IconNameType[]; to: IconNameType[] };
  triggerIcon?: TriggerIconNameType | ReactNode;
  tooltip?: ReactNode;
  pictogram?: ReactNode;
  image?: string;
  color?: string;
  preCreateLists?: Array<{ id: number; name: string }>;
};

export function* presetTemplates(
  fieldFactory: NewFieldFactoryType,
  staffList: StaffType[],
  utcOffset: number,
  translate: TFunction
): Generator<RuleTemplateType> {
  const t = (key: string) => {
    return translate(key, { interpolation: { prefix: "{=", suffix: "=}" } });
  };

  const assignStaffActionPrototype: AssignmentAutomationActionType = {
    ...assignActionDefaults(),
    assignmentType: "SpecificPerson",
    assignedStaff: undefined,
  };

  // Assign New Contacts to Agents during Business Hours
  try {
    yield {
      name: t("automation.templates.assignOnBusinessHours.name"),
      id: "assignOnBusinessHours",
      tooltip: t("automation.templates.assignOnBusinessHours.tooltip"),
      pictograms: { from: ["message"], to: ["assign", "message"] },
      prototype: templatePrototype(
        t("automation.templates.assignOnBusinessHours.name"),
        {
          automationType: "NewContactMessage",
          isContinue: false,
          conditionFields: [
            fieldFactory("LastContactFromCustomers")
              .withConditionOperator("IsBetween")
              .withValue({
                from: moment({ hour: 9, minute: 0 }).utcOffset(utcOffset, true),
                to: moment({ hour: 18, minute: 0 }).utcOffset(utcOffset, true),
              }),
          ],
          automationActions: [
            {
              automatedTriggerType: "SendMessage",
              messageContent: "",
              messageParams: [],
              ...orderableActionDefaults(),
            },
            { ...assignStaffActionPrototype },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("assignOnBusinessHours", e);
  }
  // Greetings
  try {
    yield {
      name: t("automation.templates.greetings.name"),
      id: "greetings",
      tooltip: t("automation.templates.greetings.tooltip"),
      pictograms: { from: ["message"], to: ["message"] },
      prototype: templatePrototype(t("automation.templates.greetings.name"), {
        automationType: "MessageReceived",
        isContinue: false,
        conditionFields: [
          fieldFactory("LastContactFromCustomers")
            .withConditionOperator("IsBetween")
            .withValue({
              from: moment({ hour: 9, minute: 0 }).utcOffset(utcOffset, true),
              to: moment({ hour: 18, minute: 0 }).utcOffset(utcOffset, true),
            }),
          fieldFactory("LastContactFromCustomers")
            .withConditionOperator("DayOfWeek")
            .withValue(["1", "2", "3", "4", "5"]),
          fieldFactory("LastContact")
            .withConditionOperator("DateBeforeDayAgo")
            .withValue({ type: "HOUR", number: 1 }),
        ],
        automationActions: [
          {
            automatedTriggerType: "SendMessage",
            messageContent: "",
            messageParams: [],
            ...orderableActionDefaults(),
          },
        ],
      }),
    };
  } catch (e) {
    console.error("greetings", e);
  }
  // Auto-Reply During Off Business Hours (Weekdays)
  try {
    yield {
      name: t("automation.templates.autoreplyOffBusinessHoursWeekdays.name"),
      id: "autoreplyOffBusinessHoursWeekdays",
      tooltip: t(
        "automation.templates.autoreplyOffBusinessHoursWeekdays.tooltip"
      ),
      pictograms: { from: ["message"], to: ["message"] },
      prototype: templatePrototype(
        t("automation.templates.autoreplyOffBusinessHoursWeekdays.name"),
        {
          automationType: "MessageReceived",
          isContinue: false,
          conditionFields: [
            fieldFactory("LastContactFromCustomers")
              .withConditionOperator("IsBetween")
              .withValue({
                from: moment({ hour: 18, minute: 0 }).utcOffset(
                  utcOffset,
                  true
                ),
                to: moment({ hour: 9, minute: 0 }).utcOffset(utcOffset, true),
              }),
            fieldFactory("LastContactFromCustomers")
              .withConditionOperator("DayOfWeek")
              .withValue(["1", "2", "3", "4", "5"]),
            fieldFactory("LastContact")
              .withConditionOperator("DateBeforeDayAgo")
              .withValue({ type: "HOUR", number: 1 }),
          ],
          automationActions: [
            {
              automatedTriggerType: "SendMessage",
              messageContent: "",
              messageParams: [],
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("autoreplyOffBusinessHoursWeekdays", e);
  }

  // Auto-Reply During Off Business Hours (Weekend)
  try {
    yield {
      name: t("automation.templates.autoreplyOffBusinessHoursWeekend.name"),
      id: "autoreplyOffBusinessHoursWeekend",
      tooltip: t(
        "automation.templates.autoreplyOffBusinessHoursWeekend.tooltip"
      ),
      pictograms: { from: ["message"], to: ["assign", "message"] },
      prototype: templatePrototype(
        t("automation.templates.autoreplyOffBusinessHoursWeekend.name"),
        {
          automationType: "MessageReceived",
          isContinue: false,
          conditionFields: [
            fieldFactory("LastContactFromCustomers")
              .withConditionOperator("DayOfWeek")
              .withValue(["6", "7"]),
            fieldFactory("LastContact")
              .withConditionOperator("DateBeforeDayAgo")
              .withValue({ type: "HOUR", number: 1 }),
          ],
          automationActions: [
            {
              automatedTriggerType: "SendMessage",
              messageContent: "",
              messageParams: [],
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("autoreplyOffBusinessHoursWeekend", e);
  }

  // Auto-Reply Based on Keywords
  try {
    yield {
      name: t("automation.templates.autoreplyKeywords.name"),
      id: "autoreplyKeywords",
      tooltip: t("automation.templates.autoreplyKeywords.tooltip"),
      pictograms: { from: ["message"], to: ["assign", "message"] },
      prototype: templatePrototype(
        t("automation.templates.autoreplyKeywords.name"),
        {
          automationType: "MessageReceived",
          isContinue: false,
          conditionFields: [
            fieldFactory("Message")
              .withConditionOperator("Contains")
              .withValue([]),
          ],
          automationActions: [
            {
              automatedTriggerType: "SendMessage",
              messageContent: "",
              messageParams: [],
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("autoreplyKeywords", e);
  }

  // Auto-Reply when Customers Reply a Campaign
  try {
    yield {
      name: t("automation.templates.autoreplyCampaign.name"),
      id: "autoreplyCampaign",
      tooltip: t("automation.templates.autoreplyCampaign.tooltip"),
      pictograms: { from: ["message"], to: ["message", "contactUpdate"] },
      prototype: templatePrototype(
        t("automation.templates.autoreplyCampaign.name"),
        {
          automationType: "MessageReceived",
          isContinue: false,
          conditionFields: [
            fieldFactory("importfrom")
              .withConditionOperator("Contains")
              .withValue([]),
            fieldFactory("Message")
              .withConditionOperator("Contains")
              .withValue(["xxxx"]),
          ],
          automationActions: [
            {
              automatedTriggerType: "SendMessage",
              messageContent: "",
              messageParams: [],
              ...orderableActionDefaults(),
            },
            {
              automatedTriggerType: "AddToList",
              actionAddedToGroupIds: [],
              ...orderableActionDefaults(),
            },
            {
              automatedTriggerType: "RemoveFromList",
              actionRemoveFromGroupIds: [],
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("autoreplyCampaign", e);
  }

  // Chatbot template - Welcome with multiple options
  try {
    yield {
      name: t("automation.templates.chatbotWelcome.name"),
      id: "chatbotWelcome",
      tooltip: t("automation.templates.chatbotWelcome.tooltip"),
      pictograms: { from: ["message"], to: ["message", "contactUpdate"] },
      prototype: templatePrototype(
        t("automation.templates.chatbotWelcome.name"),
        {
          automationType: "MessageReceived",
          isContinue: false,
          conditionFields: [
            fieldFactory("LastChannel")
              .withConditionOperator("Contains")
              .withValue([]),
            fieldFactory("importfrom")
              .withConditionOperator("IsNotContainsAny")
              .withValue([]),
          ],
          automationActions: [
            {
              automatedTriggerType: "SendMessage",
              messageContent:
                "Please enter number to select option. For example, input 1.",
              messageParams: [],
              ...orderableActionDefaults(),
            },
            {
              automatedTriggerType: "AddToList",
              actionAddedToGroupIds: [CAMPAIGN_ID_MAP[WELCOME_CHATBOT_LIST]], //todo
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("chatbotWelcome", e);
  }

  // Chatbot template - Selected any of the options
  // try {
  //   yield {
  //     name: t("automation.templates.chatbotSelect.name"),
  //     tooltip: t("automation.templates.chatbotSelect.tooltip"),
  //     pictograms: { from: ["message"], to: ["message"] },
  //     prototype: templatePrototype(
  //       t("automation.templates.chatbotSelect.name"),
  //       {
  //         automationType: "MessageReceived",
  //         isContinue: false,
  //         conditionFields: [
  //           fieldFactory("Keywords")
  //             .withConditionOperator("Contains")
  //             .withValue(["1"]),
  //           fieldFactory("importfrom")
  //             .withConditionOperator("ContainsAny")
  //             .withValue([]),
  //         ],
  //         automationActions: [
  //           {
  //             automatedTriggerType: "SendMessage",
  //             messageContent: "",
  //             messageParams: [],
  //             ...orderableActionDefaults(),
  //           },
  //           {
  //             automatedTriggerType: "RemoveFromList",
  //             actionRemoveFromGroupIds: [],
  //             ...orderableActionDefaults(),
  //           }
  //         ],
  //       }
  //     ),
  //   };
  // } catch (e) {
  //   console.error("chatbotSelect", e);
  // }

  // Unsubscribe confirmation
  // try {
  //   yield {
  //     name: t("automation.templates.unsubscribe.name"),
  //     tooltip: t("automation.templates.unsubscribe.tooltip"),
  //     pictograms: { from: ["message"], to: ["message","contactUpdate"] },
  //     prototype: templatePrototype(
  //       t("automation.templates.unsubscribe.name"),
  //       {
  //         automationType: "MessageReceived",
  //         isContinue: false,
  //         conditionFields: [
  //           fieldFactory("Keywords")
  //             .withConditionOperator("Contains")
  //             .withValue(["Unsubscribe"]),
  //         ],
  //         automationActions: [
  //           {
  //             automatedTriggerType: "SendMessage",
  //             messageContent: "",
  //             messageParams: [],
  //             ...orderableActionDefaults(),
  //           },
  //           {
  //             automatedTriggerType: "UpdateCustomFields",
  //             actionUpdateCustomFields: [{
  //               customFieldName: "Subscriber", customValue: "False",
  //             }],
  //             ...orderableActionDefaults(),
  //           }
  //         ],
  //       }
  //     ),
  //   };
  // } catch (e) {
  //   console.error("unsubscribe", e);
  // }

  try {
    yield {
      name: t("automation.templates.backup.name"),
      id: "backup",
      tooltip: t("automation.templates.backup.tooltip"),
      pictograms: { from: ["message"], to: ["store"] },
      prototype: templatePrototype(t("automation.templates.backup.name"), {
        automationType: "MessageReceived",
        isContinue: true,
        conditionFields: [
          fieldFactory("LastChannel").withConditionOperator("Contains"),
        ],
        automationActions: [
          {
            automatedTriggerType: "SendWebhook",
            webhookURL: "",
            ...orderableActionDefaults(),
          },
        ],
      }),
    };
  } catch (e) {
    console.error("backup", e);
  }

  // try {
  //   fieldFactory("LeadSource");
  //   yield {
  //     name: t("automation.templates.signupMessage.name"), //todo
  //     tooltip: t("automation.templates.signupMessage.tooltip"),
  //     icons: { from: ["contacts"], to: ["message"] },
  //     prototype: templatePrototype(
  //       t("automation.templates.signupMessage.name"),
  //       {
  //         automationType: "ContactAdded",
  //         conditionFields: [
  //           fieldFactory("LeadSource")
  //             .withConditionOperator("Contains")
  //         ],
  //         automationActions: [
  //           {
  //             automatedTriggerType: "SendMessage",
  //             messageContent: "",
  //             messageParams: [],
  //             ...orderableActionDefaults(),
  //           },
  //         ],
  //       }
  //     ),
  //   };
  // } catch (e) {
  //   console.error("signup", e);
  // }

  try {
    yield {
      name: t("automation.templates.segmentation.name"),
      id: "segmentation",
      tooltip: t("automation.templates.segmentation.tooltip"),
      pictograms: { from: ["contactUpdate"], to: ["contactUpdate"] },
      prototype: templatePrototype(
        t("automation.templates.segmentation.name"),
        {
          automationType: "FieldValueChanged",
          conditionFields: [
            fieldFactory("Priority")
              .withConditionOperator("Contains")
              .withValue("High"),
          ],
          automationActions: [
            {
              automatedTriggerType: "AddToList",
              actionAddedToGroupIds: [],
              ...orderableActionDefaults(),
            },
            {
              automatedTriggerType: "AddTags",
              actionAddConversationHashtags: [],
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("segmentation", e);
  }

  // try {
  //   yield {
  //     name: t("automation.templates.updateCRM.name"),
  //     tooltip: t("automation.templates.updateCRM.tooltip"),
  //     pictograms: { from: ["contactUpdate"], to: ["assign"] },
  //     prototype: templatePrototype(
  //       t("automation.templates.updateCRM.name"),
  //       {
  //         automationType: "FieldValueChanged",
  //         isContinue: true,
  //         conditionFields: [
  //           fieldFactory("LeadStage")
  //             .withConditionOperator("Contains")
  //         ],
  //         automationActions: [
  //           {
  //             automatedTriggerType: "SendWebhook",
  //             webhookURL: "",
  //             ...orderableActionDefaults(),
  //           },
  //         ],
  //       }
  //     ),
  //   };
  // } catch (e) {
  //   console.error("updateCRM", e);
  // }

  try {
    fieldFactory(HASHTAG_FIELD_NAME);
    yield {
      name: t("automation.templates.internalReminder.name"),
      id: "internalReminder",
      tooltip: t("automation.templates.internalReminder.tooltip"),
      pictograms: { from: ["assign"], to: ["message"] },
      prototype: templatePrototype(
        t("automation.templates.internalReminder.name"),
        {
          automationType: "RecurringJob",
          schedule: {
            type: "DAY",
            amount: [1],
            time: moment().hour(12).minute(0).utcOffset(utcOffset, true),
          },
          conditionFields: [
            fieldFactory(HASHTAG_FIELD_NAME).withConditionOperator("Contains"),
          ],
          automationActions: [
            {
              automatedTriggerType: "AddConversationNote",
              messageContent: "",
              messageParams: [],
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("internalReminder", e);
  }

  try {
    yield {
      name: t("automation.templates.autoClose.name"),
      id: "autoClose",
      tooltip: t("automation.templates.autoClose.tooltip"),
      pictograms: { from: ["assign"], to: ["contactUpdate"] },
      prototype: templatePrototype(t("automation.templates.autoClose.name"), {
        automationType: "RecurringJob",
        schedule: {
          type: "DAY",
          amount: [1],
          time: moment().hour(20).minute(0).utcOffset(utcOffset, true),
        },
        conditionFields: [
          fieldFactory("ConversationStatus")
            .withConditionOperator("Equals")
            .withValue("open"),
          fieldFactory("LastContactFromCustomers")
            .withConditionOperator("DateBeforeDayAgo")
            .withValue({
              type: "MONTH",
              number: 1,
            }),
        ],
        automationActions: [
          {
            automatedTriggerType: "ChangeConversationStatus",
            changeConversationStatus: { status: "closed" },
            ...orderableActionDefaults(),
          },
        ],
      }),
    };
  } catch (e) {
    console.error("autoClose", e);
  }

  try {
    yield {
      name: t("automation.templates.congratsBirthday.name"),
      id: "congratsBirthday",
      tooltip: t("automation.templates.congratsBirthday.tooltip"),
      pictograms: { from: ["contactUpdate"], to: ["message"] },
      prototype: templatePrototype(
        t("automation.templates.congratsBirthday.name"),
        {
          automationType: "RecurringJob",
          schedule: {
            type: "YEAR",
            amount: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            time: moment().hour(12).minute(0).utcOffset(utcOffset, true),
          },
          conditionFields: [
            fieldFactory(HASHTAG_FIELD_NAME).withConditionOperator(
              "ContainsAll"
            ),
          ],
          automationActions: [
            {
              automatedTriggerType: "SendMessage",
              messageContent: "",
              messageParams: [],
              ...orderableActionDefaults(),
            },
          ],
        }
      ),
    };
  } catch (e) {
    console.error("congratsBirthday", e);
  }

  // try {
  //   fieldFactory("FullfillmentStatus");
  //   yield {
  //     name: t("automation.templates.deliveryStatus.name"),
  //     tooltip: t("automation.templates.deliveryStatus.tooltip"),
  //     pictograms: { from: ["orderUpdated"], to: ["message"] },
  //     prototype: templatePrototype(
  //       t("automation.templates.deliveryStatus.name"),
  //       {
  //         automationType: "ShopifyNewOrUpdatedOrderTrigger",
  //         conditionFields: [
  //           fieldFactory("FullfillmentStatus")
  //             .withConditionOperator("Contains")
  //             .withValue("Shipping")
  //         ],
  //         automationActions: [
  //           {
  //             automatedTriggerType: "SendMessage",
  //             messageContent: "",
  //             messageParams: [],
  //             ...orderableActionDefaults(),
  //           },
  //         ],
  //       }
  //     ),
  //   };
  // } catch (e) {
  //   console.error("deliveryStatus", e);
  // }

  // yield {
  //   name: t("automation.templates.shopify.newOrder.name"),
  //   tooltip: t("automation.templates.shopify.newOrder.tooltip"),
  //   pictograms: { from: ["orderConfirmed"], to: ["message"] },
  //   prototype: templatePrototype(
  //     t("automation.templates.shopify.newOrder.name"),
  //     {
  //       automationType: "ShopifyNewOrUpdatedOrderTrigger",
  //       conditionFields: [],
  //       automationActions: [
  //         {
  //           automatedTriggerType: "SendMessage",
  //           messageContent: "todo",
  //           messageParams: ["@firstname"],
  //           ...orderableActionDefaults(),
  //         },
  //       ],
  //     }
  //   ),
  // };

  // yield {
  //   name: t("automation.templates.shopify.updatedOrderStatus.name"),
  //   tooltip: t("automation.templates.shopify.updatedOrderStatus.tooltip"),
  //   pictograms: { from: ["orderUpdated"], to: ["message"] },
  //   prototype: templatePrototype(
  //     t("automation.templates.shopify.updatedOrderStatus.name"),
  //     {
  //       automationType: "ShopifyNewOrUpdatedOrderTrigger",
  //       conditionFields: [],
  //       automationActions: [
  //         {
  //           automatedTriggerType: "SendMessage",
  //           messageContent: "todo",
  //           messageParams: ["@firstname"],
  //           ...orderableActionDefaults(),
  //         },
  //       ],
  //     }
  //   ),
  // };

  // yield {
  //   name: t("automation.templates.shopify.abandonedCart.name"),
  //   tooltip: t("automation.templates.shopify.abandonedCart.tooltip"),
  //   pictograms: { from: ["cart"], to: ["message"] },
  //   prototype: templatePrototype(
  //     t("automation.templates.shopify.abandonedCart.name"),
  //     {
  //       automationType: "ShopifyNewAbandonedCart",
  //       conditionFields: [],
  //       automationActions: [
  //         {
  //           automatedTriggerType: "SendMessage",
  //           messageContent: "todo",
  //           messageParams: ["@firstname"],
  //           ...orderableActionDefaults(),
  //         },
  //       ],
  //     }
  //   ),
  // };

  // yield {
  //   name: t("automation.templates.shopify.updatedCustomer.name"),
  //   tooltip: t("automation.templates.shopify.updatedCustomer.tooltip"),
  //   pictograms: { from: ["contactUpdate"], to: ["message"] },
  //   prototype: templatePrototype(
  //     t("automation.templates.shopify.updatedCustomer.name"),
  //     {
  //       automationType: "ShopifyNewCustomerTrigger",
  //       conditionFields: [],
  //       automationActions: [
  //         {
  //           automatedTriggerType: "SendMessage",
  //           messageContent: "todo",
  //           messageParams: ["@firstname"],
  //           ...orderableActionDefaults(),
  //         },
  //       ],
  //     }
  //   ),
  // };

  // yield {
  //   name: t("automation.templates.shopify.fullfillmentUpdated.name"),
  //   tooltip: t("automation.templates.shopify.fullfillmentUpdated.tooltip"),
  //   pictograms: { from: ["orderUpdated"], to: ["message"] },
  //   prototype: templatePrototype(
  //     t("automation.templates.shopify.fullfillmentUpdated.name"),
  //     {
  //       automationType: "ShopifyFulfillmentStatusTrigger",
  //       conditionFields: [],
  //       automationActions: [
  //         {
  //           automatedTriggerType: "SendMessage",
  //           messageContent: "todo",
  //           messageParams: ["@firstname"],
  //           ...orderableActionDefaults(),
  //         },
  //       ],
  //     }
  //   ),
  // };
}
