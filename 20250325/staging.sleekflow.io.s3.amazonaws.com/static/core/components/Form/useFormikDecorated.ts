import { useFormik, FormikErrors, FormikState, FormikHelpers } from "formik";
import { FormikValues, FormikConfig } from "formik/dist/types";
import { useState } from "react";

interface UseFormProps<Values extends FormikValues = FormikValues>
  extends FormikConfig<Values> {}

export type FormikDecoratedHookType<
  Values extends FormikValues = FormikValues
> = FormikState<Values> &
  FormikHelpers<Values> & {
    isSubmitDisabled: boolean;
    initialValues: Values;
  };

export function useFormikDecorated<Values extends FormikValues = FormikValues>(
  props: UseFormProps<Values>
): FormikDecoratedHookType<Values> {
  const [submitFailed, setSubmitFailed] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [amendedFields, setAmendedFields] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { setFieldValue, setValues, submitForm, errors, ...decoratedHook } =
    useFormik<Values>(props);

  const errorsWithoutAmended = Object.keys(errors).reduce<FormikErrors<Values>>(
    (acc, next) => {
      const ignorePath = amendedFields.includes(getTopErrorPath(next));
      if (ignorePath) {
        return acc;
      } else {
        return { ...acc, [next]: errors[next] };
      }
    },
    {}
  );
  const isErrorsVisible =
    submitFailed && Object.keys(errorsWithoutAmended).length > 0;

  const noErrors = {} as FormikErrors<Values>;

  return {
    ...decoratedHook,
    errors: isErrorsVisible ? errorsWithoutAmended : noErrors,
    isSubmitDisabled:
      decoratedHook.isSubmitting ||
      isErrorsVisible ||
      (submitAttempted && amendedFields.length === 0),
    setFieldValue(
      field: string,
      value: any,
      shouldValidate?: boolean | undefined
    ): void {
      setFieldValue(field, value, shouldValidate);
      setAmendedFields((paths) => {
        return [...paths, getTopErrorPath(field)];
      });
    },
    setValues(values: Values, shouldValidate?: boolean | undefined) {
      setValues(values, shouldValidate);
      setAmendedFields(Object.keys(values).map(getTopErrorPath));
    },
    async submitForm() {
      setSubmitFailed(false);
      setSubmitAttempted(true);
      const validationResult = await decoratedHook.validateForm();
      const valid = Object.keys(validationResult).length === 0;
      if (!valid || !decoratedHook.isValid) {
        setAmendedFields([]);
        setSubmitFailed(true);
        decoratedHook.setSubmitting(false);
        return;
      }
      const result = await submitForm();
      setAmendedFields([]);
      decoratedHook.setSubmitting(false);
      return result;
    },
  };
}

function getTopErrorPath(field: string) {
  const [firstFieldNamePart] = field.split(".");
  return firstFieldNamePart;
}
