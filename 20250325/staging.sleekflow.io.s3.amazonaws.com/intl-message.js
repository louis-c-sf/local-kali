import i18next from 'i18next';
import 'i18next-wc';
import { h } from "@stencil/core";
export const IntlMessage = (props) => (h("intl-message", Object.assign({}, Object.assign({ i18next }, props))));
export function GetIntlMessage(i18next) {
  return (props) => (h("intl-message", Object.assign({}, Object.assign({ i18next }, props))));
}
