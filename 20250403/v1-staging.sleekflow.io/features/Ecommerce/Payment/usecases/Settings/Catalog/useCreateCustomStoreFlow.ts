import { DropdownItemProps } from "semantic-ui-react";
import { CreateCatalogFormType } from "features/Ecommerce/usecases/Settings/Commerce/CommerceSettings/CreateStoreModal";
import { submitNewStore } from "api/CommerceHub/submitNewStore";
import { useLanguageChoices } from "features/Ecommerce/components/useLanguageChoices";
import { useTranslation } from "react-i18next";

export function useCreateCustomStoreFlow() {
  const lang = useLanguageChoices();
  const { i18n } = useTranslation();

  async function createCustomStore(values: CreateCatalogFormType) {
    let language = i18n.language;
    const currentLangCode = fromDashedToIso(language, lang.choices);
    const hasCurrentLang = Boolean(
      currentLangCode &&
        values.languages.some((code) => code === currentLangCode)
    );
    return await submitNewStore(
      hasCurrentLang && currentLangCode ? currentLangCode : values.languages[0],
      values.name,
      values.languages,
      values.currencies.map((c) => c.toUpperCase())
    );
  }

  return {
    createCustomStore,
  };
}

export function fromDashedToIso(input: string, choices: DropdownItemProps[]) {
  const [codePart] = input.split("-", 1);
  if (codePart) {
    const isoMatch = choices.find(
      (row) => codePart.toLowerCase() === (row.value as string).toLowerCase()
    );
    return isoMatch ? (isoMatch.value as string) : undefined;
  }
}
