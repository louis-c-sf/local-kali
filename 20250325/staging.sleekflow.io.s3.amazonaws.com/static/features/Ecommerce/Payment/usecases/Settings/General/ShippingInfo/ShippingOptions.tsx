import { FieldArrayRenderProps, useFormikContext } from "formik";
import React from "react";
import {
  getDefaultFormValues,
  SleekPaySettingsFormValues,
} from "../models/SleekPaySettingsFormSchema";
import styles from "../ShippingInfo/ShippingOptions.module.css";
import { Button, Form, Image, Input } from "semantic-ui-react";
import DeliveryTimeField from "../ShippingInfo/DeliveryTimeField";
import ShippingRateField from "../ShippingInfo/ShippingRateField";
import ConditionField from "../ShippingInfo/ConditionField";
import { useTranslation } from "react-i18next";
import DeleteBin from "assets/images/delete-bin.svg";

export default function ShippingOptions({
  push,
  remove,
}: FieldArrayRenderProps) {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();

  function addOption() {
    push({ ...getDefaultFormValues().shippingOptions[0] });
  }

  return (
    <>
      <div className={styles.container}>
        {values.shippingOptions.map((option, index, allOptions) => {
          return (
            <div
              key={`shippingOption_${index}`}
              className={styles.shippingOption}
            >
              <div>
                <Form.Field>
                  <label>
                    {t("settings.paymentLink.general.shipping.shippingMethod")}
                  </label>
                  <Input
                    value={option.displayName}
                    onChange={(e) =>
                      setFieldValue(
                        `shippingOptions.${index}.displayName`,
                        e.target.value
                      )
                    }
                  />
                </Form.Field>
                <DeliveryTimeField optionIndex={index} />
              </div>
              <div>
                <ShippingRateField optionIndex={index} />
                <ConditionField optionIndex={index} />
              </div>
              {allOptions.length > 1 && (
                <Button
                  className={styles.removeButton}
                  onClick={() => remove(index)}
                >
                  <Image src={DeleteBin} />
                  {t("settings.paymentLink.general.shipping.remove")}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <Button onClick={addOption} className={styles.addOptionButton}>
        + {t("settings.paymentLink.general.shipping.addShippingOption")}
      </Button>
    </>
  );
}
