import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import produce from "immer";
import { propEq } from "ramda";
import { matchesConversationId } from "../../../component/Chat/mutators/chatSelectors";
import MessageType, { isAudioMessage } from "../../../types/MessageType";

export function chatUIReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  return produce(state, (draft) => {
    switch (action.type) {
      case "CHAT_SWITCH_LOCKED":
        draft.inbox.allowSwitchConversation = false;
        break;
      case "CHAT_SWITCH_UNLOCKED":
        draft.inbox.allowSwitchConversation = true;
        break;
      case "CHAT_AUDIO_STARTED":
        draft.inbox.audioPlayingId = action.id;
        draft.inbox.startAudioId = null;
        break;
      case "CHAT_AUDIO_STOPPED":
        draft.inbox.audioPlayingId = null;
        break;
      case "CHAT_AUDIO_FINISHED":
        draft.inbox.audioPlayingId = null;
        const messageFinished = draft.messagesMemoized.find(
          propEq("messageUniqueID", action.id)
        );
        if (!messageFinished) {
          return;
        }
        const chatMessages = draft.messagesMemoized
          .filter(matchesConversationId(draft.profile.conversationId))
          .filter(propEq("channel", messageFinished.channel))
          .filter((m: MessageType) => m.senderId === messageFinished.senderId);
        const nextAudioIndex =
          chatMessages.findIndex(propEq("messageUniqueID", action.id)) + 1;
        const nextMessage = chatMessages[nextAudioIndex];
        if (nextMessage && isAudioMessage(nextMessage)) {
          draft.inbox.startAudioId = nextMessage.messageUniqueID;
        } else {
          draft.inbox.startAudioId = null;
        }

        //todo start next if there is any
        break;
      case "INBOX.CONTACT_FORM.SHOW":
        draft.inbox.editContactForm.visible = true;
        draft.inbox.editContactForm.focusField = action.field;
        break;

      case "INBOX.CONTACT_FORM.HIDE":
        draft.inbox.editContactForm.visible = false;
        draft.inbox.editContactForm.focusField = undefined;
        break;
    }
  });
}
