import { Image, Input, Radio } from "semantic-ui-react";
import React from "react";
import ShopifyImg from "component/Channel/Onboarding/assets/shopify/shopify.svg";
import styles from "./ShopifyStoreField.module.css";
import { useFormikContext } from "formik";
import { ShopifyStoreConnectFormValues } from "./ShopifyStoreConnectForm";
import { useTranslation } from "react-i18next";

export default function ShopifyStoreField({ index }: { index: number }) {
  const { setFieldValue, values } =
    useFormikContext<ShopifyStoreConnectFormValues>();
  const { t } = useTranslation();

  const currentStore = values.stores[index];

  return (
    <div className={styles.fieldWrapper}>
      <Image src={ShopifyImg} alt="Shopify" />
      <div className={styles.inputSection}>
        <Input
          placeholder={t(
            "onboarding.stripe.importProducts.shopNamePlaceholder"
          )}
          disabled={!currentStore.enabled}
          onChange={(e) =>
            setFieldValue(`stores.${index}.shopName`, e.target.value)
          }
        />
        <p>{currentStore.usersMyShopifyUrl}</p>
      </div>
      <Radio
        toggle
        checked={currentStore.enabled}
        onChange={() =>
          setFieldValue(`stores.${index}.enabled`, !currentStore.enabled)
        }
      />
    </div>
  );
}
