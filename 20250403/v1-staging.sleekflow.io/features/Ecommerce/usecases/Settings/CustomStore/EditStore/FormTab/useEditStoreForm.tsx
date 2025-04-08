import { CustomStoreFormType } from "../../EditStore";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import {
  useFormikDecorated,
  FormikDecoratedHookType,
} from "core/components/Form/useFormikDecorated";

export type CustomStoreFormikType =
  FormikDecoratedHookType<CustomStoreFormType>;

export const MAX_LANGUAGES = 4;

export function useEditStoreForm(props: {
  initValues: CustomStoreFormType;
  onSubmit: (values: CustomStoreFormType) => void;
}) {
  const { t } = useTranslation();

  return useFormikDecorated<CustomStoreFormType>({
    initialValues: props.initValues,
    enableReinitialize: true,
    onSubmit: props.onSubmit,
    validationSchema: yup.object({
      languages: yup
        .array(yup.string())
        .required()
        .max(MAX_LANGUAGES, t("settings.commerce.error.language.max")),
      name: yup
        .string()
        .required(t("settings.commerce.createStore.field.any.error.required"))
        .trim()
        .max(128),
      sharingMessageTemplates: yup.array(
        yup.object({
          message: yup.string().trim(),
        })
      ),
    }),
  });
}
