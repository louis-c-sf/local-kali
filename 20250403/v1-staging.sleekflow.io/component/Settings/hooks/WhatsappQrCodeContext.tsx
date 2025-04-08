import * as React from "react";
import {
  defaultState,
  WhatsappQrCodeState,
  WhatsappQrCodeAction,
} from "./whatsappQrCodeReducer";

type WhatsappQrCodeContextType = {
  state: WhatsappQrCodeState;
  dispatch: (action: WhatsappQrCodeAction) => any;
};

export const WhatsappQrCodeContext = React.createContext<
  WhatsappQrCodeContextType
>({
  state: defaultState(),
  dispatch: (action: WhatsappQrCodeAction) => {},
});
