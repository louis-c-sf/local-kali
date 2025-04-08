import { assign, Machine } from "xstate";
import { AssignmentRuleType } from "../../types/AssignmentRuleType";
import { RuleTemplateType } from "./AutomationRuleEdit/templates";

export type AutomationEditContext = {
  templates: RuleTemplateType[];
  initialValues: AssignmentRuleType | undefined;
  error: string | undefined;
};

export type AutomationEditStateScheme = {
  states: {
    waiting: {};
    booting: {};
    bootFailed: {};
    booted: {};
    new: {
      states: {
        form: {
          states: {
            edit: {};
            submitting: {};
          };
        };
      };
    };
    stored: {
      states: {
        form: {
          states: {
            edit: {};
            submitting: {};
          };
        };
      };
    };
  };
};

export type AutomationEventSubmit = {
  type: "SUBMIT";
  values: AssignmentRuleType;
};
export type AutomationEditEvent =
  | { type: "BOOT" }
  | { type: "RETRY" }
  | { type: "CHOOSE_TEMPLATE"; template: RuleTemplateType }
  | { type: "BACK_TO_TEMPLATE" }
  | AutomationEventSubmit
  | {
      type: "done.invoke.formPreload";
      data: { initialValues: AssignmentRuleType; isDefaultRule: boolean };
    }
  | { type: "done.invoke.formSubmit"; data: { values: AssignmentRuleType } };

export const automationEditStateMachine = Machine<
  AutomationEditContext,
  AutomationEditStateScheme,
  AutomationEditEvent
>({
  id: "AutomationEdit",
  initial: "waiting",
  context: {
    error: undefined,
    templates: [],
    initialValues: undefined,
  },
  states: {
    waiting: {
      on: {
        BOOT: "booting",
      },
    },
    booting: {
      entry: assign({
        error: (c, e) => undefined,
      }),
      invoke: {
        src: "formPreload",
        onDone: {
          target: "booted",
        },
        onError: {
          target: "bootFailed",
          actions: [
            "showError",
            assign({
              error: (_, e) => e.data,
            }),
          ],
        },
      },
    },
    bootFailed: {
      on: {
        RETRY: "booting",
      },
    },
    booted: {
      on: {
        "": [{ target: "stored", cond: "isExistingEntity" }, { target: "new" }],
      },
    },
    new: {
      initial: "form",
      states: {
        form: {
          initial: "edit",
          states: {
            edit: {
              on: {
                SUBMIT: "submitting",
              },
            },
            submitting: {
              entry: assign({
                error: (c, e) => undefined,
              }),
              invoke: {
                src: "formSubmit",
                onDone: {
                  target: "edit",
                },
                onError: {
                  target: "edit",
                  actions: [
                    "showError",
                    assign({
                      error: (_, e) => e.data,
                    }),
                  ],
                },
              },
            },
          },
        },
      },
    },
    stored: {
      initial: "form",
      states: {
        form: {
          initial: "edit",
          states: {
            edit: {
              on: {
                SUBMIT: "submitting",
              },
            },
            submitting: {
              entry: assign({
                error: (c, e) => undefined,
              }),
              invoke: {
                src: "formSubmit",
                onDone: {
                  target: "edit",
                },
                onError: {
                  target: "edit",
                  actions: [
                    "showError",
                    assign({
                      error: (_, e) => e.data,
                    }),
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
});
