import { useLayoutEffect } from "react";
import moment from "moment";
import "moment/locale/zh-cn";
import "moment/locale/zh-hk";
import { setDefaultLocale } from "react-datepicker";
import Cookie from "js-cookie";
import { useTranslation } from "react-i18next";
import { COOKIE_LANG_PARAM } from "i18n";
import { setLocale } from "yup";

export function useLocaleSetup() {
  const { t, i18n } = useTranslation();
  useLayoutEffect(() => {
    const localeMap = {
      "zh-CN": "zh-cn",
      "zh-HK": "zh-hk",
      "pt-br": "pt-br",
      "id-id": "id-id",
      "de-DE": "de-de",
      "it-IT": "it-it",
    };
    if (i18n.language in localeMap) {
      moment.locale(localeMap[i18n.language]);
      const baseLocale = i18n.language.match(/^[a-z]+/i);
      if (baseLocale && baseLocale[0]) {
        setDefaultLocale(baseLocale[0]);
      } else {
        setDefaultLocale("en");
      }
    } else {
      setDefaultLocale("en");
      moment.locale("en");
    }
    setLocale({
      mixed: {
        required: t("form.error.default.required"),
      },
      string: {
        max: t("form.error.default.max"),
      },
      number: {
        min: t("form.error.number.min"),
        max: t("form.error.number.max"),
      },
    });
    Cookie.set(COOKIE_LANG_PARAM, i18n.language);
  }, [i18n.language]);
}
