import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { en } from "./i18n/en-US";
import { zh } from "./i18n/zh-CN";
import { hk } from "./i18n/zh-HK";
import { id } from "./i18n/id-ID";
import { br } from "./i18n/pt-BR";
import { de } from "./i18n/de-DE";
import { it } from "./i18n/it-IT";
import { registerLocale } from "react-datepicker";
import {
  enUS,
  id as idID,
  ptBR,
  zhCN,
  zhTW,
  de as deDE,
  it as itIT,
} from "date-fns/locale";
import relativeTime from "./i18n/relativeTime";
import moment from "moment";
import PhraseInContextEditorPostProcessor from "i18next-phrase-in-context-editor-post-processor";
import ICU from "i18next-icu";

const resources = {
  "en-US": en,
  "zh-CN": zh,
  "zh-HK": hk,
  "pt-BR": br,
  "id-ID": id,
  "de-DE": de,
  "it-IT": it,
};
registerLocale("en", enUS);
registerLocale("zh-CN", zhCN);
registerLocale("zh-HK", zhTW);
registerLocale("pt-BR", ptBR);
registerLocale("id-ID", idID);
registerLocale("de-DE", deDE);
registerLocale("it-IT", itIT);

moment.updateLocale("en", { relativeTime: relativeTime["en-US"] });
moment.updateLocale("zh-hk", { relativeTime: relativeTime["zh-HK"] });
moment.updateLocale("zh-cn", { relativeTime: relativeTime["zh-CN"] });
moment.updateLocale("pt-BR", { relativeTime: relativeTime["pt-BR"] });
moment.updateLocale("id-ID", { relativeTime: relativeTime["id-ID"] });
moment.updateLocale("de-DE", { relativeTime: relativeTime["de-DE"] });
moment.updateLocale("it-IT", { relativeTime: relativeTime["it-IT"] });

// unfortunately, hk locale is not supported separately by datepicker registerLocale()

export const COOKIE_LANG_PARAM = "appLanguage";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(ICU)
  .use(
    new PhraseInContextEditorPostProcessor({
      phraseEnabled: process.env.REACT_APP_PHRASE_ENABLED === "TRUE",
      projectId: "40367915372e4fb62d16049b1fcb4cea",
      autoLowercase: false,
    })
  )
  .init({
    resources,
    fallbackLng: "en-US",
    defaultNS: "common",
    fallbackNS: "common",
    supportedLngs: [
      "zh-CN",
      "zh-HK",
      "en-US",
      "id-ID",
      "pt-BR",
      "de-DE",
      "it-IT",
    ],
    interpolation: {
      escapeValue: false, // react already safes from xss
      skipOnVariables: true,
    },
    debug: false,
    react: {
      useSuspense: false,
    },
    keySeparator: ".",
    detection: {
      order: ["path", "cookie", "navigator"],
      lookupCookie: COOKIE_LANG_PARAM,
    },
    postProcess: ["phraseInContextEditor"],
  });
export default i18n;
