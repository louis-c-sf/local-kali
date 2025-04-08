import { Machine, MachineConfig } from "xstate";

export type WhatsappOnboardingContextType = {
  haveTwilio: boolean;
  migrateFrom: undefined | "twilio" | string;
  newUser: boolean;
  whatsappOfficialChannelsExisted: boolean;
};

export type WhatsappOnboardingEvent =
  | { type: "START_TWILIO" }
  | { type: "START_OFFICIAL" }
  | { type: "WAKEUP" }
  | { type: "SETUP" }
  | { type: "MIGRATE" }
  | { type: "BACK" }
  | { type: "SUBMIT" }
  | { type: "REQUEST_SLEEKFLOW_MIGRATION" }
  | { type: "START_OFFIICAL_NEW_NUMBER" }
  | { type: "WHATSAPP_360DIALOG_SUBMIT" }
  | { type: "COMPLETE_WHATSAPP_CLOUD_API" }
  | { type: "SKIP_AUTO_TOP_UP" };

type MigrateSchema = {
  states: {
    preflight: {};
    switchNumber: {};
    sleekflowMigrationRequested: {};
  };
};

type WhatsappOnboardingSchema = {
  states: {
    idle: {};
    signup: {
      states: {
        form: {};
        success: {};
      };
    };
    haveTwilio: {
      states: {
        connectTwilio: {};
        migrate: MigrateSchema;
      };
    };
    official: {
      states: {
        intro: {};
        newNumber: {};
        chooseScenario: {};
        migrate: MigrateSchema;
        setChannelName: {};
        setAutoTopUp: {};
        allSet: {};
      };
    };

    completed: {};
  };
};

const getMigrateMachine = (
  startState: string
): MachineConfig<
  WhatsappOnboardingContextType,
  MigrateSchema,
  WhatsappOnboardingEvent
> => ({
  initial: "preflight",
  states: {
    preflight: {
      on: {
        BACK: startState,
        SUBMIT: "switchNumber",
        REQUEST_SLEEKFLOW_MIGRATION: "sleekflowMigrationRequested",
      },
    },
    switchNumber: {
      on: { BACK: "preflight", SUBMIT: "#onboarding.completed" },
    },
    sleekflowMigrationRequested: { type: "final" },
  },
});

export const whatsappOnboardingMachine = Machine<
  WhatsappOnboardingContextType,
  WhatsappOnboardingSchema,
  WhatsappOnboardingEvent
>({
  id: "onboarding",
  initial: "idle",
  context: {
    haveTwilio: false,
    migrateFrom: undefined,
    whatsappOfficialChannelsExisted: false,
    newUser: false,
  },
  states: {
    idle: {
      on: {
        START_TWILIO: "haveTwilio",
        START_OFFICIAL: "official",
        START_OFFIICAL_NEW_NUMBER: "official.newNumber",
        COMPLETE_WHATSAPP_CLOUD_API: "official.allSet",
      },
    },

    signup: {
      states: {
        form: {
          on: { SUBMIT: "success" },
        },
        success: {
          /* type: "final"*/
        },
      },
    },

    haveTwilio: {
      id: "haveTwilio",
      on: {
        SETUP: ".connectTwilio",
        MIGRATE: ".migrate",
        BACK: "#onboarding.idle",
      },
      states: {
        migrate: {
          ...getMigrateMachine("#haveTwilio"),
        },
        connectTwilio: {
          /*type: "final"*/
        },
      },
    },

    official: {
      id: "official",
      initial: "intro",
      on: {
        BACK: "#onboarding.idle",
      },
      states: {
        intro: {
          on: {
            WHATSAPP_360DIALOG_SUBMIT: "chooseScenario",
            SUBMIT: "newNumber",
            BACK: "#onboarding.idle",
          },
        },
        chooseScenario: {
          on: {
            BACK: "intro",
            SETUP: "newNumber",
            MIGRATE: "migrate",
          },
        },
        migrate: {
          ...getMigrateMachine("#official.chooseScenario"),
        },
        newNumber: {
          on: {
            BACK: "intro",
            SUBMIT: "setChannelName",
          },
        },
        setChannelName: {
          on: {
            BACK: "newNumber",
            SETUP: "setChannelName",
            SUBMIT: "setAutoTopUp",
            SKIP_AUTO_TOP_UP: "allSet",
          },
        },
        setAutoTopUp: {
          on: {
            BACK: "setChannelName",
            SETUP: "setAutoTopUp",
            SUBMIT: "allSet",
          },
        },
        allSet: {
          on: {
            BACK: "setAutoTopUp",
            SETUP: "allSet",
            SUBMIT: "#onboarding.completed",
          },
        },
      },
    },
    completed: {
      /*type: "final"*/
    },
  },
});
