import React, { useEffect } from "react";
import { Form } from "semantic-ui-react";
import { ModalForm } from "../shared/ModalForm";
import { useTranslation } from "react-i18next";
import { ChannelInfoConfiguredType } from "../../types/ChannelInfoType";
import { useFormik } from "formik";
import { object, string } from "yup";
import { FieldError } from "../shared/form/FieldError";
import { MAX_BOT_NAME_LENGTH } from "../../container/Onboarding/viber/ViberOnboardingScreen";

export default function RenameChannelModal(props: {
  open: boolean;
  channel: ChannelInfoConfiguredType<any>;
  onClose: () => void;
  onConfirm: (
    channel: ChannelInfoConfiguredType<any>,
    name: string,
    senderName?: string,
    messagingServiceSid?: string
  ) => void;
  loading: boolean;
}) {
  const { open, onClose, channel } = props;
  const { t } = useTranslation();
  const isViber = channel.name === "viber";
  const isTwilioWhatsApp = channel.name === "twilio_whatsapp";
  const maxMessage = t("form.error.default.max").replace(
    "${max}",
    MAX_BOT_NAME_LENGTH.toFixed(0)
  );

  const {
    values,
    setFieldValue,
    errors,
    isSubmitting,
    isValid,
    resetForm,
    setFieldError,
    submitForm,
  } = useFormik({
    onSubmit: async (values) => {
      try {
        await props.onConfirm(
          channel,
          values.name,
          values.senderName,
          values.messagingServiceSid
        );
      } catch (e) {
        console.error(e);
        setFieldError("name", t("form.field.any.error.common"));
      }
    },
    validationSchema: object({
      name: string().required(),
      senderName: string().test({
        message: maxMessage,
        test: function (this, value) {
          if (isViber) {
            return string()
              .required()
              .max(MAX_BOT_NAME_LENGTH)
              .isValidSync(value);
          }
          return true;
        },
      }),
    }),
    initialValues: {
      name: isTwilioWhatsApp ? channel.title : "",
      senderName: "",
      channel: "",
      messagingServiceSid: isTwilioWhatsApp
        ? channel.config?.messagingServiceSid ?? ""
        : "",
    },
  });

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  const contentMapping = {
    rename: {
      subTitle: t("channels.form.rename.subtitle"),
      confirmText: t("channels.form.rename.buttons.confirm"),
    },
    updateTwilio: {
      subTitle: t("channels.form.updateTwilio.subtitle"),
      confirmText: t("channels.form.updateTwilio.buttons.confirm"),
    },
  };
  return (
    <ModalForm
      opened={open}
      onCancel={onClose}
      isLoading={isSubmitting}
      disableSubmit={!isValid}
      onConfirm={submitForm}
      title={channel.title}
      subTitle={
        isTwilioWhatsApp
          ? contentMapping.updateTwilio.subTitle
          : contentMapping.rename.subTitle
      }
      confirmText={
        isTwilioWhatsApp
          ? contentMapping.updateTwilio.confirmText
          : contentMapping.rename.confirmText
      }
      cancelText={t("form.button.cancel")}
    >
      <div className="ui form">
        <Form.Input
          label={t("channels.form.rename.field.name.label")}
          error={Boolean(errors.name)}
          type={"text"}
          placeholder={t("channels.form.rename.field.name.placeholder")}
          value={values.name}
          disabled={isSubmitting && isValid}
          onChange={(event, data) => {
            setFieldValue("name", data.value as string);
          }}
        />
        {errors.name && <FieldError text={errors.name} />}
        {isTwilioWhatsApp && (
          <>
            <Form.Input
              label={t("channels.form.twilio.field.messagingServiceSid.label")}
              error={Boolean(errors.messagingServiceSid)}
              type={"text"}
              placeholder={t(
                "channels.form.twilio.field.messagingServiceSid.placeholder"
              )}
              value={values.messagingServiceSid}
              disabled={isSubmitting && isValid}
              onChange={(event, data) => {
                setFieldValue("messagingServiceSid", data.value as string);
              }}
            />
            {errors.messagingServiceSid && (
              <FieldError text={errors.messagingServiceSid} />
            )}
          </>
        )}
        {isViber && (
          <>
            <Form.Input
              label={t("onboarding.viber.connect.form.field.senderName.label")}
              error={Boolean(errors.senderName)}
              type={"text"}
              placeholder={t(
                "onboarding.viber.connect.form.field.senderName.placeholder"
              )}
              value={values.senderName}
              disabled={isSubmitting && isValid}
              onChange={(event, data) => {
                setFieldValue("senderName", data.value as string);
              }}
            />
            {errors.senderName && <FieldError text={errors.senderName} />}
          </>
        )}
      </div>
    </ModalForm>
  );
}
