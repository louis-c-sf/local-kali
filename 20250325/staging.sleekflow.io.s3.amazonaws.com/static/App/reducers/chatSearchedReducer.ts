import { Action, LoginType } from "../../types/LoginType";
import produce from "immer";
import { initialUser } from "../../context/LoginContext";
import { ProfileType } from "types/LoginType";
import { UserInfoType } from "types/ConversationType";
import { ReactNode } from "react";

export interface SearchMessageType extends ProfileType {
  matchResult: ReactNode;
  assignee: UserInfoType | undefined;
}

export function defaultChatSearchedState() {
  return {
    conversations: [],
  };
}

export type ChatSearchedStateType = {
  conversations: SearchMessageType[];
};

export type ChatSearchedActionType = {
  type: "UPDATE_SEARCHED_CHATS";
  conversations: SearchMessageType[];
};

export const chatSearchedReducer = produce(
  (state: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "UPDATE_SEARCHED_CHATS":
        state.chatSearched.conversations = action.conversations;
    }
  }
);
