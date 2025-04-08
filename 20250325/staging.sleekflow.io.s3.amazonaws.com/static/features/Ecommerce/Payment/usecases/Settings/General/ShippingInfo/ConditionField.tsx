import React from "react";
import { Dropdown, Form } from "semantic-ui-react";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import { useFormikContext } from "formik";
import PriceAmountInput from "../ShippingInfo/PriceAmountInput";
import { useTranslation } from "react-i18next";
import styles from "../ShippingInfo/ConditionField.module.css";
import { ShippingConditionType } from "core/models/Ecommerce/Payment/SleekPayStatusType";

export default function ConditionField({
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
        {t("settings.paymentLink.general.shipping.condition.label")}
      </label>
      <div className={styles.inputContainer}>
        <Dropdown
          selection
          options={[
            {
              key: "alwaysShow",
              text: t(
                "settings.paymentLink.general.shipping.condition.alwaysShow"
              ),
              value: ShippingConditionType.ALWAYS_SHOW,
            },
            {
              key: "orderPriceRange",
              text: t(
                "settings.paymentLink.general.shipping.condition.orderPriceRange"
              ),
              value: ShippingConditionType.ORDER_PRICING_RANGE,
            },
          ]}
          value={currentOption.condition.shippingOptionConditionType}
          onChange={(_, data) =>
            setFieldValue(
              `${currentOptionField}.condition.shippingOptionConditionType`,
              data.value
            )
          }
        />
        {currentOption.condition.shippingOptionConditionType ===
          ShippingConditionType.ORDER_PRICING_RANGE && (
          <>
            <PriceAmountInput
              value={currentOption.condition.orderPriceRangeLower}
              onChange={(value) =>
                setFieldValue(
                  `${currentOptionField}.condition.orderPriceRangeLower`,
                  value
                )
              }
            />
            <span>{t("settings.paymentLink.general.shipping.to")}</span>
            <PriceAmountInput
              value={currentOption.condition.orderPriceRangeUpper}
              onChange={(value) =>
                setFieldValue(
                  `${currentOptionField}.condition.orderPriceRangeUpper`,
                  value
                )
              }
            />
          </>
        )}
      </div>
    </Form.Field>
  );
}
