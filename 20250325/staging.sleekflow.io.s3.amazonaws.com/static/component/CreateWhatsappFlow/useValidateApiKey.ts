import { useFormik } from "formik";
import { object, string } from "yup";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Create360DialogChannelResponseType,
  submitCreate360DialogChannel,
} from "../../api/Channel/submitCreate360DialogChannel";

export function useValidateApiKey(props: {
  onSuccess: (channelCreated: Create360DialogChannelResponseType) => void;
}) {
  const { onSuccess } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [checkError, setCheckError] = useState("");

  const { setFieldValue, values, errors, isValid, submitForm } = useFormik({
    initialValues: {
      phoneCode: "",
      phoneNumber: "",
      apiKey: "",
      channelName: "",
    },
    isInitialValid: false,
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: object({
      apiKey: string()
        .ensure()
        .required(t("form.createWhatsapp.form.error.apiKey.invalid")),
      channelName: string().required(
        t("form.createWhatsapp.form.error.channelName.invalid")
      ),
    }),
    onSubmit: async (values) => {
      setCheckError("");
      try {
        setLoading(true);
        const response = await submitCreate360DialogChannel(
          values.channelName,
          values.apiKey
        );
        onSuccess(response);
      } catch (e) {
        console.error(e);
        const error = e as any;
        const apiError = /*error.message ? error.message:*/ t(
          "form.createWhatsapp.form.error.apiCheck.header"
        );
        setCheckError(apiError);
      } finally {
        setLoading(false);
      }
    },
  });

  function setApiKey(value: string) {
    setCheckError("");
    setFieldValue("apiKey", value);
  }

  function setChannelName(value: string) {
    setCheckError("");
    setFieldValue("channelName", value);
  }

  return {
    values,
    setApiKey,
    setChannelName,
    checkError,
    loading,
    errors,
    isValid,
    submitForm,
  };
}
