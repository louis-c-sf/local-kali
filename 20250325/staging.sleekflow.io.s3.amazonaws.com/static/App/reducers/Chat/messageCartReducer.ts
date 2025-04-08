import produce from "immer";
import { initialUser } from "context/LoginContext";
import { LoginType, Action } from "types/LoginType";
import { CartMessageType } from "core/models/Ecommerce/Inbox/CartMessageType";

type VisibleState = {
  visible: true;
  message: CartMessageType;
};
type HiddenState = {
  visible: false;
  message: null;
};
export type MessageCartStateType = VisibleState | HiddenState;

export type MessageCartActionType =
  | {
      type: "INBOX.MESSAGE_CART.OPEN";
      message: CartMessageType;
    }
  | {
      type: "INBOX.MESSAGE_CART.CLOSE";
    }
  | {
      type: "INBOX.MESSAGE_CART.GENERATE_PAYMENT";
    };

export const messageCartReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const cart = draft.inbox.messageCart;

    switch (action.type) {
      case "INBOX.MESSAGE_CART.OPEN": {
        const cartVisible = cart as VisibleState;
        cartVisible.visible = true;
        cartVisible.message = action.message;
        break;
      }

      case "INBOX.MESSAGE_CART.CLOSE": {
        const cartVisible = cart as HiddenState;
        cartVisible.visible = false;
        cartVisible.message = null;
        break;
      }

      case "INBOX.PAYMENT_LINK.SHOW": {
        const cartVisible = cart as HiddenState;
        cartVisible.visible = false;
        cartVisible.message = null;
        break;
      }
    }
  }
);

export function defaultMessageCartState(): MessageCartStateType {
  return {
    visible: false,
    message: null,
  };
}
