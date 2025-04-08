import React from "react";
import { Form } from "semantic-ui-react";
import styles from "./ShippingRateField.module.css";
import { useFormikContext } from "formik";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import PriceAmountInput from "../ShippingInfo/PriceAmountInput";
import { useTranslation } from "react-i18next";

export default function ShippingRateField({
  optionIndex,
}: {
  optionIndex: number;
}) {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();

  const currentOption = values.shippingOptions[optionIndex];
  const currentOptionField = `shippingOptions.${optionIndex}`;

  return (
    <Form.Field>
      <label>{t("settings.paymentLink.general.shipping.shippingRate")}</label>
      <PriceAmountInput
        value={currentOption.shippingFee}
        onChange={(value) => {
          setFieldValue(`${currentOptionField}.shippingFee`, value);
        }}
      />
      <p className={styles.reminder}>
        {t("settings.paymentLink.general.shipping.blankMessage")}
      </p>
    </Form.Field>
  );
}
