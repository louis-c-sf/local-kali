import { CustomStoreFormType } from "../../EditStore";
import { useCallback } from "react";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import { submitUpdateCustomStore } from "api/CommerceHub/submitUpdateCustomStore";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";

export function useEditStoreApi(id: string, storePrototype: CustomStoreType) {
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const persist = useCallback(
    async (values: CustomStoreFormType) => {
      const firstLanguage = values.languages[0];
      if (firstLanguage === undefined) {
        throw "No language to use with name";
      }
      const languageDefaultName = storePrototype.languages.find(
        (lang) => lang.is_default === true
      )?.language_iso_code;

      const hasDefaultLangRemaining =
        languageDefaultName && values.languages.includes(languageDefaultName);

      const languagesUpdated = values.languages.map((lang, idx) => ({
        language_iso_code: lang,
        language_name: "",
        native_language_name: "",
        is_default: hasDefaultLangRemaining
          ? lang === languageDefaultName
          : idx === 0,
      }));

      const request: CustomStoreType = {
        id,
        is_payment_enabled: values.enablePayment,
        is_view_enabled: values.active,
        descriptions: [],
        names: [
          {
            language_iso_code: languageDefaultName ?? firstLanguage,
            value: values.name,
          },
        ],
        languages: languagesUpdated,
        platform_identity: { ...storePrototype.platform_identity },
        template_dict: {
          message_preview_templates: values.sharingMessageTemplates.map(
            (tpl) => ({
              language_iso_code: tpl.language,
              value: tpl.message,
            })
          ),
        },
        currencies: [...storePrototype.currencies],
        metadata: { ...storePrototype.metadata },
      };

      try {
        await submitUpdateCustomStore(request);
        flash(t("settings.commerce.flash.settingsSaved"));
      } catch (e) {
        console.error(e, request);
        flash(t("flash.settings.payment.error"));
      }
    },
    [id, storePrototype]
  );

  return {
    persist,
  };
}
