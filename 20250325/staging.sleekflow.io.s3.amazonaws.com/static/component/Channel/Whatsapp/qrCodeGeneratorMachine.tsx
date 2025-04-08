import { assign, DoneInvokeEvent, Machine, MachineConfig } from "xstate";

export interface QrAuthGeneratorContext {
  qrCode: string | undefined;
  instanceId: string | undefined;
  input: object;
  error: string | undefined;
}

export interface QrAuthGeneratorStateSchema {
  states: {
    idle: {};
    qrLoading: {};
    qrSuccess: {};
    qrFail: {};
    // authSuccess: {},
    registering: {};
    registered: {
      states: {
        check: {};
        valid: {};
        invalid: {};
      };
    };
    submitted: {};
    confirmed: {};
  };
}

export interface QrCodeLoadedData {
  qrCode?: string;
  instanceId?: string;
  result?: string;
}

export type QrCodeLoadEvent = {
  type: "done.invoke.loadQrCode";
  data: QrCodeLoadedData;
};
export type QrCodeErrorEvent = { type: "error.invoke.loadQrCode"; data: any };

export type QrAuthEvent =
  | { type: "FORM.CHANGE"; input: object }
  | { type: "FORM.SUBMIT" }
  | { type: "OPEN" }
  | { type: "RETRY_QR" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "REGISTER" }
  | { type: "HTTP_FAIL" }
  | QrCodeLoadEvent
  | QrCodeErrorEvent
  | { type: "error.execution"; data: string };

export const qrCodeMachineConfig: MachineConfig<
  QrAuthGeneratorContext,
  QrAuthGeneratorStateSchema,
  QrAuthEvent
> = {
  id: "qrAuthGenerator",
  initial: "idle",
  context: {
    qrCode: undefined,
    instanceId: undefined,
    input: {},
    error: undefined,
  },

  states: {
    idle: {
      on: {
        OPEN: "qrLoading",
      },
    },

    qrLoading: {
      entry: assign({
        error: (c, e) => undefined,
        // qrCode: (c, e) => undefined,
        // instanceId: (c, e) => undefined,
      }),

      after: {
        "DELAY.FETCH_QR_TIMEOUT": {
          target: "qrFail",
          actions: [() => console.debug("#qra timeout fail")],
        },
      },

      invoke: {
        src: "loadQrCode",
        onDone: [
          {
            target: "registering",
            cond: "isAuthOkResponse",
            actions: [
              assign({
                qrCode: (_, e: DoneInvokeEvent<QrCodeLoadedData>) =>
                  e.data.qrCode,
                instanceId: (_, e: DoneInvokeEvent<QrCodeLoadedData>) =>
                  e.data.instanceId,
              }),
            ],
          },
          {
            target: "qrSuccess",
            actions: [
              assign({
                qrCode: (_, e: DoneInvokeEvent<QrCodeLoadedData>) =>
                  e.data.qrCode,
                instanceId: (_, e: DoneInvokeEvent<QrCodeLoadedData>) =>
                  e.data.instanceId,
              }),
            ],
          },
        ],
        onError: {
          target: "qrFail",
          actions: [
            (_, e) => console.error("#qra qrLoading", e),
            assign({
              error: (_, e) => e.data,
            }),
          ],
        },
      },
      on: {
        RETRY_QR: {
          target: "qrLoading",
        },
        REGISTER: {
          target: "registering",
          actions: [
            assign({
              error: (_, e) => undefined,
            }),
          ],
        },
      },
    },

    qrFail: {
      after: {
        "DELAY.FETCH_QR_TIMEOUT": {
          target: "qrLoading",
        },
      },
      on: {
        RETRY_QR: {
          target: "qrLoading",
        },
        REGISTER: {
          target: "registering",
          actions: [
            assign({
              error: (_, e) => undefined,
            }),
          ],
        },
      },
    },

    qrSuccess: {
      after: {
        "DELAY.RESTART_QR_FETCHED": {
          target: "qrLoading",
        },
      },
      on: {
        RETRY_QR: {
          target: "#qrAuthGenerator.qrLoading",
        },

        REGISTER: {
          target: "registering",
          actions: [
            assign({
              error: (_, e) => undefined,
            }),
          ],
        },
      },
    },

    registering: {
      invoke: {
        src: "registerWhatsappInstance",
        onDone: "#qrAuthGenerator.registered.check",
        onError: {
          target: "qrSuccess",
          actions: [
            assign({
              error: (_, e) => e.data,
            }),
          ],
        },
      },
    },

    registered: {
      states: {
        check: {
          on: {
            "": [
              { target: "valid", cond: "isFormValid" },
              { target: "invalid" },
            ],
          },
        },
        valid: {
          on: {
            "FORM.SUBMIT": "#qrAuthGenerator.submitted",
            "FORM.CHANGE": {
              target: "check",
              actions: assign({
                input: (_, e) => e.input,
              }),
            },
          },
        },
        invalid: {
          on: {
            "FORM.CHANGE": {
              target: "check",
              actions: assign({
                input: (_, e) => e.input,
              }),
            },
          },
        },
      },
    },

    submitted: {
      on: {
        SUBMIT_SUCCESS: {
          target: "confirmed",
        },
        HTTP_FAIL: {
          target: "registered.check",
        },
      },
    },

    confirmed: {
      type: "final",
    },
  },
};

export const qrCodeGeneratorMachine = Machine(qrCodeMachineConfig);
