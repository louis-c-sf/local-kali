import { useCurrentUtcOffset } from "component/Chat/hooks/useCurrentUtcOffset";
import DatePickerUtcAware from "component/shared/DatePickerUTCAware";
import { Moment } from "moment";
import React from "react";
import { useTranslation } from "react-i18next";
import { Input, Radio, Loader } from "semantic-ui-react";
import { SelectedDiscountType } from "types/ShopifyProductType";
import { formatCurrency, toFloat } from "utility/string";
import { PaymentCartFormType } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal";
import styles from "./PaymentProduct.module.css";
import { clamp } from "ramda";
import { useProductCartContext } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";

function PaymentProduct(props: {
  totalAmount: number;
  currency: string;
  selectedDiscount: SelectedDiscountType;
  percentage: number;
  values: PaymentCartFormType;
  afterDiscount: number;
  setValueChange: (
    key: keyof PaymentCartFormType | "selectedDiscount" | "percentage",
    value: number | SelectedDiscountType | Moment
  ) => void;
  totalsLoading: boolean;
}) {
  const { currency, values, setValueChange } = props;
  const { selectedDiscount, percentage } = props;

  const { t } = useTranslation();
  const utcOffset = useCurrentUtcOffset();
  const productCart = useProductCartContext();

  const isEnabledDiscounts = productCart.shoppingCartService.canUseDiscounts();

  return (
    <div className={styles.payment}>
      <div className={styles.row}>
        <label>{t("chat.shopifyProductsModal.cart.subTotal")}</label>
        <span className={styles.amount}>
          {props.totalsLoading ? (
            <Loader active size={"tiny"} inline />
          ) : (
            formatCurrency(props.totalAmount, currency)
          )}
        </span>
      </div>
      {!productCart.isShopifyStatusLoading && isEnabledDiscounts ? (
        <>
          <div className={`${styles.row} ${styles.discount}`}>
            <label>{t("chat.shopifyProductsModal.cart.discount")}</label>
          </div>
          <div className={styles.row}>
            <Radio
              className={styles.radio}
              label={t(
                "chat.shopifyProductsModal.cart.paymentDiscount.options.none"
              )}
              name="discount"
              value="none"
              onChange={(_, { value }) =>
                setValueChange(
                  "selectedDiscount",
                  value as SelectedDiscountType
                )
              }
              checked={selectedDiscount === "none"}
            />
          </div>
          <div className={`${styles.row} ${styles.withNumber}`}>
            <Radio
              className={styles.radio}
              label={t(
                "chat.shopifyProductsModal.cart.paymentDiscount.options.discountRate"
              )}
              name="discount"
              value="percentage"
              onChange={(_, { value }) =>
                setValueChange(
                  "selectedDiscount",
                  value as SelectedDiscountType
                )
              }
              checked={selectedDiscount === "percentage"}
            />
            <Input
              className={styles.percentage}
              placeholder={"0"}
              onFocus={() => {
                if (selectedDiscount !== "percentage") {
                  setValueChange(
                    "selectedDiscount",
                    "percentage" as SelectedDiscountType
                  );
                }
              }}
              onChange={(_, { value }) => {
                if (value === "") {
                  setValueChange("percentage", 0);
                } else if (toFloat(value) !== null) {
                  const newValue = clamp(0, 100, Number(toFloat(value)));
                  setValueChange("percentage", newValue);
                }
              }}
              value={percentage}
            />
          </div>
          <div className={`${styles.row} ${styles.withNumber}`}>
            <Radio
              className={styles.radio}
              label={t(
                "chat.shopifyProductsModal.cart.paymentDiscount.options.fixedAmount"
              )}
              name="discount"
              value="fixed"
              onChange={(_, { value }) =>
                setValueChange(
                  "selectedDiscount",
                  value as SelectedDiscountType
                )
              }
              checked={selectedDiscount === "fixed"}
            />
          </div>
        </>
      ) : null}
      <div className={`${styles.row} ${styles.totalAmount}`}>
        <label>
          {t("chat.shopifyProductsModal.cart.paymentDiscount.afterDiscount")}
        </label>
        <span className={styles.amount}>
          {props.totalsLoading ? (
            <Loader active size={"tiny"} inline />
          ) : (
            formatCurrency(props.afterDiscount, currency)
          )}
        </span>
      </div>
      <div className={styles.row}>
        <label>{t("chat.shopifyProductsModal.cart.expiredAt")}</label>
        <div className="ui input">
          <DatePickerUtcAware
            dateFormat={"yyyy/MM/dd h:mm aa"}
            utcOffset={utcOffset}
            selected={values.expiredAt}
            showTimeSelect
            onChange={(date) =>
              date && setValueChange("expiredAt", date as Moment)
            }
            minDate={new Date()}
            shouldCloseOnSelect={true}
            popperClassName={styles.popup}
            popperPlacement="top"
          />
        </div>
      </div>
    </div>
  );
}

export default PaymentProduct;
