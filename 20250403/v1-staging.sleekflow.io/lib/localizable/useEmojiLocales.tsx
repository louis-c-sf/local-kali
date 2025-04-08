import { useTranslation } from "react-i18next";

export function useEmojiLocales() {
  const { t } = useTranslation();

  return {
    categoryNames: {
      "Frequently used": t("emoji.category.frequent"),
      People: t("emoji.category.people"),
      Nature: t("emoji.category.nature"),
      Objects: t("emoji.category.objects"),
      Places: t("emoji.category.places"),
      Symbols: t("emoji.category.symbols"),
    },
  };
}
