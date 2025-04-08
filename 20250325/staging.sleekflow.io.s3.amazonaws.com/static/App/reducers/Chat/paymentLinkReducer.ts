import produce from "immer";
import { initialUser } from "context/LoginContext";
import { LoginType, Action } from "types/LoginType";
import { createMessageDraft } from "component/Chat/Messenger/createMessageDraft";
import { reject } from "ramda";
import { matchesMessageDraft } from "component/Chat/mutators/chatSelectors";
import {
  PaymentLinkResponseType,
  ShopifyPaymentLinkResponseType,
  isShopifyPaymentLinkResponseType,
} from "core/models/Ecommerce/Payment/PaymentLinkResponseType";
import { PaymentLinkType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { PaymentLinkProxyType } from "core/models/Ecommerce/Payment/PaymentLInkProxyType";
import { CartMessageType } from "core/models/Ecommerce/Inbox/CartMessageType";
import { reduceReducersWithDefaults } from "utility/reduce-reducers";

type SendDialogType =
  | {
      visible: boolean;
      mode: null | "custom";
      cartMessage: null;
      restoreWhatsappTemplateLock: boolean;
    }
  | {
      visible: boolean;
      mode: "userCart";
      cartMessage: CartMessageType;
      restoreWhatsappTemplateLock: boolean;
    };
export type PaymentLinkStateType = {
  transaction: {
    linkGenerated:
      | null
      | PaymentLinkResponseType
      | ShopifyPaymentLinkResponseType;
    paymentSent: PaymentLinkProxyType | null;
  };
  sendDialog: SendDialogType;
};

export type PaymentLinkActionType =
  | {
      type: "INBOX.PAYMENT_LINK.SHOW";
      cartMessage?: CartMessageType;
    }
  | {
      type: "INBOX.PAYMENT_LINK.COMPLETE";
      link: PaymentLinkResponseType | ShopifyPaymentLinkResponseType;
      lineItems: Array<PaymentLinkType>;
      messageTemplate: string;
    }
  | {
      type: "INBOX.PAYMENT_LINK.CANCEL";
    };

export const PAYMENT_LINK_TOKEN = "{{link}}";

function getPaymentUrl(
  template: string,
  link: PaymentLinkResponseType | ShopifyPaymentLinkResponseType
) {
  return template.replace(
    PAYMENT_LINK_TOKEN,
    isShopifyPaymentLinkResponseType(link)
      ? link.sleekflow_url
      : link.trackingUrl
  );
}

const mainReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const draftPayment = draft.inbox.messenger.paymentLink;

    switch (action.type) {
      case "INBOX.PAYMENT_LINK.SHOW":
        draftPayment.sendDialog.visible = true;
        if (action.cartMessage) {
          draftPayment.sendDialog.cartMessage = action.cartMessage;
          draftPayment.sendDialog.mode = "userCart";
        } else {
          draftPayment.sendDialog.mode = "custom";
        }
        break;

      case "INBOX.PAYMENT_LINK.CANCEL":
        draftPayment.sendDialog.visible = false;
        draftPayment.sendDialog.mode = null;
        draftPayment.sendDialog.cartMessage = null;
        break;

      case "INBOX.PAYMENT_LINK.COMPLETE":
        draftPayment.sendDialog.visible = false;
        draftPayment.sendDialog.mode = null;
        draftPayment.sendDialog.cartMessage = null;

        draftPayment.transaction.linkGenerated = action.link;
        draftPayment.transaction.paymentSent = {
          lineItems: action.lineItems,
          paymentTrackingUrl: isShopifyPaymentLinkResponseType(action.link)
            ? action.link.sleekflow_url
            : action.link.trackingUrl,
          status: "Pending",
        };
        draft.inbox.messageDrafts = reject(
          matchesMessageDraft(draft.profile.conversationId),
          draft.inbox.messageDrafts
        );
        const messageDraft = createMessageDraft(draft.profile.conversationId);
        messageDraft.text = getPaymentUrl(action.messageTemplate, action.link);
        messageDraft.markupText = getPaymentUrl(
          action.messageTemplate,
          action.link
        );
        draft.inbox.messageDrafts.push(messageDraft);
        break;
      case "CHAT_SELECTED":
      case "INBOX.MESSENGER.SUBMIT":
        draft.inbox.messenger.paymentLink = defaultPaymentLinkState();
        break;
    }
  }
);

export const paymentLinkTemplateModeReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const draftPayment = draft.inbox.messenger.paymentLink;
    switch (action.type) {
      case "INBOX.PAYMENT_LINK.SHOW":
        if (action.cartMessage) {
          if (draft.inbox.messenger.sendWhatsappTemplate.mode !== "type") {
            draft.inbox.messenger.sendWhatsappTemplate.mode = "type";
            draftPayment.sendDialog.restoreWhatsappTemplateLock = true;
          }
        } else {
          draftPayment.sendDialog.restoreWhatsappTemplateLock = false;
        }
        break;

      case "INBOX.PAYMENT_LINK.CANCEL":
        if (draftPayment.sendDialog.restoreWhatsappTemplateLock) {
          draft.inbox.messenger.sendWhatsappTemplate.mode = "off";
        }
        draftPayment.sendDialog.restoreWhatsappTemplateLock = false;
        break;

      case "INBOX.PAYMENT_LINK.COMPLETE":
        draftPayment.sendDialog.restoreWhatsappTemplateLock = false;
        break;

      case "CHAT_SELECTED":
        draftPayment.sendDialog.restoreWhatsappTemplateLock = false;
        break;
    }
  }
);

export const paymentLinkReducer = reduceReducersWithDefaults(
  mainReducer,
  paymentLinkTemplateModeReducer
);

export function defaultPaymentLinkState(): PaymentLinkStateType {
  return {
    transaction: {
      linkGenerated: null,
      paymentSent: null,
    },
    sendDialog: {
      visible: false,
      cartMessage: null,
      mode: null,
      restoreWhatsappTemplateLock: false,
    },
  };
}
