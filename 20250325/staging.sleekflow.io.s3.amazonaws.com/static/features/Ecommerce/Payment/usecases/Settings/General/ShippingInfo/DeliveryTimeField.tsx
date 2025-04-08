import { useFormikContext } from "formik";
import { Dropdown, Form } from "semantic-ui-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { clamp } from "ramda";
import NumberFormat from "react-number-format";
import styles from "./DeliveryTimeField.module.css";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import { DeliveryEstimateUnit } from "core/models/Ecommerce/Payment/SleekPayStatusType";

export default function DeliveryTimeField({
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
      <label>
        {t("settings.paymentLink.general.shipping.deliveryTime.label")}
      </label>
      <div className={styles.inputContainer}>
        <NumberFormat
          value={currentOption.deliveryEstimateMin}
          onValueChange={(v) =>
            setFieldValue(
              `${currentOptionField}.deliveryEstimateMin`,
              clamp(1, 98, v.floatValue)
            )
          }
          displayType={"input"}
          thousandSeparator={","}
          decimalSeparator={"."}
          decimalScale={0}
          fixedDecimalScale
        />
        <span>{t("settings.paymentLink.general.shipping.to")}</span>
        <NumberFormat
          value={currentOption.deliveryEstimateMax}
          onValueChange={(v) =>
            setFieldValue(
              `${currentOptionField}.deliveryEstimateMax`,
              clamp(currentOption.deliveryEstimateMin + 1, 99, v.floatValue)
            )
          }
          displayType={"input"}
          thousandSeparator={","}
          decimalSeparator={"."}
          decimalScale={0}
          fixedDecimalScale
        />
        <Dropdown
          selection
          options={[
            {
              key: "businessDay",
              text: t(
                "settings.paymentLink.general.shipping.deliveryTime.businessDay"
              ),
              value: DeliveryEstimateUnit.BUSINESS_DAY,
            },
            {
              key: "day",
              text: t("settings.paymentLink.general.shipping.deliveryTime.day"),
              value: DeliveryEstimateUnit.DAY,
            },
            {
              key: "hour",
              text: t(
                "settings.paymentLink.general.shipping.deliveryTime.hour"
              ),
              value: DeliveryEstimateUnit.HOUR,
            },
          ]}
          value={currentOption.deliveryEstimateUnit}
          onChange={(_, data) =>
            setFieldValue(
              `${currentOptionField}.deliveryEstimateUnit`,
              data.value
            )
          }
        />
      </div>
    </Form.Field>
  );
}
