import produce from "immer";
import { CustomStoreFormType } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore";

export function normalizeLanguageDependentFields(
  values: CustomStoreFormType,
  newLanguages: string[]
) {
  return produce(values, (draft) => {
    draft.languages = newLanguages;

    for (let lang of newLanguages) {
      const templateIdx = draft.sharingMessageTemplates.findIndex(
        (t) => t.language === lang
      );
      if (templateIdx === -1) {
        draft.sharingMessageTemplates.push({
          language: lang,
          message: "",
        });
      }
    }

    const languagesMissing = draft.sharingMessageTemplates.reduce<string[]>(
      (acc, next) => {
        if (
          newLanguages.includes(next.language) ||
          acc.includes(next.language)
        ) {
          return acc;
        }
        return [...acc, next.language];
      },
      []
    );

    for (let lang of languagesMissing) {
      const templateIdx = draft.sharingMessageTemplates.findIndex(
        (t) => t.language === lang
      );
      if (templateIdx > -1) {
        draft.sharingMessageTemplates.splice(templateIdx, 1);
      }
    }
  });
}
