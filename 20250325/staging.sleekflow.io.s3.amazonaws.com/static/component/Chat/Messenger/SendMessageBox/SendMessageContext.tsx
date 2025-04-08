import React, {
  ReactNode,
  useState,
  useContext,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { throttle } from "lodash-es";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import insertTextAtCursor from "insert-text-at-cursor";
import { staffDisplayName } from "component/Chat/utils/staffDisplayName";
import { equals } from "ramda";
import { ChatMessageDraftType } from "types/state/InboxStateType";
import { matchesMessageDraft } from "component/Chat/mutators/chatSelectors";

interface SendMessageContextType {
  textInput: HTMLTextAreaElement | null;
  setTextInput: (input: HTMLTextAreaElement | null) => void;
  chatContentNode: HTMLElement | null;
  insertEmoji: (emoji: string, input?: HTMLInputElement) => void;
  messageDraft: ChatMessageDraftType;
  setMessageDraft: (draft: ChatMessageDraftType) => void;
  setReply: (value: string) => void;
  setNote: (markupText: string, plainText: string) => void;
  setQuickReply: (text: string) => void;
}

const SendMessageContextContext =
  React.createContext<SendMessageContextType | null>(null);

export function SendMessageContext(props: {
  children: ReactNode;
  parentNode: HTMLElement | null;
}) {
  const [textInputRef, setTextInputRef] = useState<HTMLTextAreaElement | null>(
    null
  );
  const loginDispatch = useAppDispatch();
  const messengerMode = useAppSelector((s) => s.inbox.messenger.mode);
  const state = useAppSelector((s) => s.inbox.messenger, equals);
  const conversationId = useAppSelector((s) => s.profile.conversationId);
  const messageDraft = useAppSelector(
    (s) => s.inbox.messageDrafts.find(matchesMessageDraft(conversationId)),
    equals
  );

  const insertEmojiRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!props.parentNode) {
      return;
    }

    const startTyping = throttle(
      (event: KeyboardEvent) => {
        const isNeedToCatch =
          event.target instanceof HTMLElement &&
          (event.target.dataset.valueOf() as any).catch_typing === "true";
        if (!isNeedToCatch) {
          return;
        }
        loginDispatch({ type: "INBOX.MESSENGER.TYPE_START" });
      },
      3000,
      { leading: true, trailing: false }
    );

    props.parentNode.addEventListener("keydown", startTyping);

    return () => {
      props.parentNode?.removeEventListener("keydown", startTyping);
    };
  }, [props.parentNode]);

  const insertEmoji = useCallback(
    (emoji: string, input?: HTMLInputElement) => {
      insertEmojiRef.current = true;
      const targetInput = input ?? textInputRef;
      if (!(targetInput && emoji)) {
        return;
      }
      insertTextAtCursor(targetInput, emoji);
      const value = targetInput.value;
      if (messengerMode === "note") {
        let markupText = messageDraft?.markupText ?? "";
        if (state.messageAssignee) {
          markupText = markupText.replace(
            /\) .+$/,
            ")" +
              value.substring(staffDisplayName(state.messageAssignee).length)
          );
        } else {
          markupText = value;
        }
        loginDispatch({
          type: "INBOX.MESSENGER.UPDATE_NOTE_TEXT",
          text: value,
          markupText,
        });
      } else {
        loginDispatch({
          type: "INBOX.MESSENGER.UPDATE_REPLY_TEXT",
          text: value,
        });
      }
      loginDispatch({ type: "INBOX.MESSENGER.TYPE_START" });
    },
    [textInputRef, JSON.stringify(messageDraft)]
  );

  const handleChangeNote = useCallback(
    (markupText: string, plainText: string) => {
      if (insertEmojiRef.current) {
        insertEmojiRef.current = false;
        return;
      }
      loginDispatch({
        type: "INBOX.MESSENGER.UPDATE_NOTE_TEXT",
        text: plainText,
        markupText: markupText,
      });
    },
    []
  );

  const handleChangeReply = useCallback((value: string) => {
    if (insertEmojiRef.current) {
      insertEmojiRef.current = false;
      return;
    }
    updateQuickReply(value);
  }, []);

  const updateQuickReply = useCallback((text: string) => {
    loginDispatch({
      type: "INBOX.MESSENGER.UPDATE_REPLY_TEXT",
      text: text,
    });
  }, []);

  return (
    <SendMessageContextContext.Provider
      value={{
        textInput: textInputRef,
        setTextInput: setTextInputRef,
        chatContentNode: props.parentNode,
        insertEmoji,
        messageDraft: messageDraft ?? {
          conversationId,
          text: "",
          markupText: "",
        },
        setMessageDraft: (draft) => {
          if (state.mode === "note") {
            loginDispatch({
              type: "INBOX.MESSENGER.UPDATE_NOTE_TEXT",
              text: draft.text,
              markupText: draft.markupText,
            });
          } else {
            loginDispatch({
              type: "INBOX.MESSENGER.UPDATE_REPLY_TEXT",
              text: draft.text,
            });
          }
        },
        setReply: handleChangeReply,
        setNote: handleChangeNote,
        setQuickReply: updateQuickReply,
      }}
    >
      {props.children}
    </SendMessageContextContext.Provider>
  );
}

export function useSendMessageContext() {
  const context = useContext(SendMessageContextContext);

  if (context === null) {
    throw "Initiate SendMessageContext first";
  }
  return context;
}
