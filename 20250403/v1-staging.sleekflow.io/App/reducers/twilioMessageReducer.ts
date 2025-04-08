import { LoginType, Action } from "../../types/LoginType";
import { initialUser } from "../../context/LoginContext";
import produce from "immer";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";

export function twilioMessageReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SHOW_TWILIO_TEMPLATE_MESSAGE":
        draft.isDisplayTwilioDefaultoMessage = true;
        draft.inbox.messenger.sendWhatsappTemplate.mode = "off";
        draft.isScrollToEnd = true;
        break;
      case "HIDE_TWILIO_TEMPLATE_MESSAGE":
        draft.isDisplayTwilioDefaultoMessage = false;
        draft.inbox.messenger.sendWhatsappTemplate.mode = isAnyWhatsappChannel(
          draft.selectedChannelFromConversation ?? ""
        )
          ? "type"
          : "off";
        draft.isScrollToEnd = true;
        break;
    }
  });
}
