import PhoneNumber from "component/PhoneNumber";
import { FieldError } from "component/shared/form/FieldError";
import { useFormikContext } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "semantic-ui-react";
import mainStyles from "../GeneralTab.module.css";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import styles from "./GeneralStripeEmailSetting.module.css";

export default function GeneralStripeEmailSetting() {
  const { values, errors, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();
  const { t } = useTranslation();
  return (
    <div className={mainStyles.sectionContainer}>
      <p className={mainStyles.sectionTitle}>
        {t("settings.paymentLink.general.contactDetail.title")}
      </p>
      <p className={mainStyles.description}>
        {t("settings.paymentLink.general.contactDetail.description")}
      </p>
      <div className={styles.form}>
        <Form.Field>
          <label>
            {t("settings.paymentLink.general.contactDetail.email.label")}
          </label>
          <Input
            value={values.contactDetail?.email}
            placeholder={t(
              "settings.paymentLink.general.contactDetail.email.placeholder"
            )}
            onChange={(e) =>
              setFieldValue("contactDetail.email", e.target.value)
            }
          />
          <FieldError text={errors.contactDetail?.email ?? ""} />
        </Form.Field>
        <Form.Field>
          <label>
            {t("settings.paymentLink.general.contactDetail.phoneNumber.label")}
          </label>
          <PhoneNumber
            placeholder={t(
              "settings.paymentLink.general.contactDetail.phoneNumber.placeholder"
            )}
            existValue={values.contactDetail?.phoneNumber}
            onChange={(fieldName, phone, code) =>
              setFieldValue("contactDetail.phoneNumber", phone)
            }
            fieldName={"phoneNumber"}
          />
          <FieldError text={errors.contactDetail?.phoneNumber ?? ""} />
        </Form.Field>
      </div>
    </div>
  );
}
