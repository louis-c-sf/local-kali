import produce from "immer";
import { Action, LoginType } from "../../types/LoginType";
import { whereEq } from "ramda";
import { initialUser } from "../../context/LoginContext";

export const contactsReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "LISTS_LOADED":
        draft.contacts.lists = action.lists;
        draft.contacts.listsBooted = true;
        break;

      case "LIST_ADDED":
        const updateIndex = draft.contacts.lists.findIndex(
          whereEq({ id: action.list.id })
        );
        if (updateIndex === -1) {
          draft.contacts.lists.push(action.list);
        } else {
          draft.contacts.lists[updateIndex] = action.list;
        }
        break;
    }
  }
);
