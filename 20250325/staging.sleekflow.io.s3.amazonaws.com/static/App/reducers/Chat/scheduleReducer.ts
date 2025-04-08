import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import { Moment } from "moment";
import { reject } from "ramda";

export type ScheduleMessageActionType =
  | {
      type: "INBOX.SCHEDULE.SCHEDULE_START";
    }
  | {
      type: "INBOX.SCHEDULE.VALUE_CHANGED";
      value: Moment | null;
    }
  | {
      type: "INBOX.SCHEDULE.SCHEDULE_CANCEL";
    }
  | {
      type: "INBOX.SCHEDULE.MESSAGE_DELETE_CLICK";
      messageId: number;
    }
  | {
      type: "INBOX.SCHEDULE.MESSAGE_DELETE_CONFIRM";
      messageId: number;
    }
  | {
      type: "INBOX.SCHEDULE.MESSAGE_DELETE_CANCEL";
    }
  | {
      type: "INBOX.SCHEDULE.MESSAGE_DELETED";
      messageId: number;
    };

export type ScheduleMessageStateType = {
  state: "ready" | "edit" | "schedule";
  value: Moment | null;
  deleteMessage: {
    isPrompted: boolean;
    messageId?: number;
  };
};

export function defaultScheduleMessageState(): ScheduleMessageStateType {
  return {
    state: "ready",
    value: null,
    deleteMessage: {
      isPrompted: false,
      messageId: undefined,
    },
  };
}

export const scheduleReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const scheduleDraft = draft.inbox.messenger.schedule;

    switch (action.type) {
      case "CHAT_SELECTED":
        scheduleDraft.state = "ready";
        if (
          action.profile.lastChannel !== "twilio_whatsapp" && //todo check the current channel
          draft.inbox.messenger.mode === "schedule"
        ) {
          draft.inbox.messenger.mode = "reply";
          draft.inbox.messenger.schedule = defaultScheduleMessageState();
        }
        break;

      case "INBOX.MESSENGER.SELECT_MODE":
        if (action.mode === "note") {
          scheduleDraft.state = "edit";
        }
        scheduleDraft.state = "edit";
        break;

      case "INBOX.MESSENGER.SUBMIT":
        if (draft.inbox.messenger.mode !== "schedule") {
          return;
        }
        draft.inbox.messenger.schedule = defaultScheduleMessageState();
        break;

      case "INBOX.EDIT_MESSAGE.PICKED":
        if (!action.id) {
          return;
        }
        const message = draft.messagesMemoized.find((m) => m.id === action.id);
        if (!message) {
          return;
        }
        //todo edit if the message was scheduled already
        scheduleDraft.state = "edit";
        break;

      case "INBOX.EDIT_MESSAGE.CANCEL":
        scheduleDraft.state = "ready";
        break;

      case "INBOX.SCHEDULE.SCHEDULE_START":
        scheduleDraft.state = "schedule";
        break;

      case "INBOX.SCHEDULE.SCHEDULE_CANCEL":
        scheduleDraft.state = "ready";
        scheduleDraft.value = null;
        break;

      case "INBOX.SCHEDULE.VALUE_CHANGED":
        scheduleDraft.state = "schedule";
        scheduleDraft.value = action.value;
        break;

      case "INBOX.SCHEDULE.MESSAGE_DELETE_CLICK":
        scheduleDraft.deleteMessage.isPrompted = true;
        scheduleDraft.deleteMessage.messageId = action.messageId;
        break;

      case "INBOX.SCHEDULE.MESSAGE_DELETE_CONFIRM":
        // draft.messagesMemoized = reject(
        //   (m) => m.id === action.messageId,
        //   draft.messagesMemoized
        // );
        scheduleDraft.deleteMessage.isPrompted = false;
        break;
      case "INBOX.SCHEDULE.MESSAGE_DELETE_CANCEL":
        scheduleDraft.deleteMessage.isPrompted = false;
        break;
    }
  }
);
