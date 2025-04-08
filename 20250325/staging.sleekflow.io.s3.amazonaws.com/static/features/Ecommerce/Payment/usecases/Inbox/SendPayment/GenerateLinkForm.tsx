import React from "react";
import styles from "./GenerateLinkForm.module.css";
import { FormikErrors } from "formik";
import { useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";
import { GenerateLinkFormItem } from "./GenerateLinkFormItem";
import PlusIcon from "assets/tsx/icons/PlusIcon";
import { assoc, path, remove, update, uniq } from "ramda";
import { createEmptyItem } from "./PaymentLinkDialog";
import { FieldError } from "component/shared/form/FieldError";
import { formatCurrency } from "utility/string";
import DatePickerUtcAware from "component/shared/DatePickerUTCAware";
import { useCurrentUtcOffset } from "component/Chat/hooks/useCurrentUtcOffset";
import moment, { Moment } from "moment";
import { FormikProps } from "formik/dist/types";
import { PaymentLinkType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import {
  PaymentFormType,
  PaymentLinkFormItemType,
} from "./contracts/PaymentFormType";
import produce from "immer";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { CurrencySelector } from "features/Ecommerce/components/CurrencySelector/CurrencySelector";
import { DiscountPopup } from "./DiscountPopup";
import { getTotal, getSubTotal } from "./models/getTotal";
import { setHours, setMinutes } from "date-fns";

export function GenerateLinkForm(props: {
  form: FormikProps<PaymentFormType>;
  canSubmit: boolean;
  onSubmit: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const { form, canSubmit, onSubmit, loading } = props;
  const isStatusVisible = form.values.payments.length > 0;
  const canAddMoreItems = form.values.payments.length < 10;
  const utcOffset = useCurrentUtcOffset();
  const regions = useSupportedRegions();

  function addItem() {
    form.setFieldValue("payments", [
      ...form.values.payments,
      createEmptyItem(form.values.overall.currency),
    ]);
  }

  function removeItem(idx: number) {
    return () =>
      form.setFieldValue("payments", remove(idx, 1, form.values.payments));
  }

  const getValueSetter = (idx: number) => (data: PaymentLinkFormItemType) =>
    form.setValues(
      assoc(
        "payments",
        update(
          idx,
          {
            ...data,
          },
          [...form.values.payments]
        ),
        form.values
      ),
      true
    );

  const amountError = path(["overall", "amount"], form.errors);

  function getErrorsVisible(
    fieldPath: Array<string | number>
  ): FormikErrors<PaymentLinkType> | undefined {
    const isVisible = form.dirty;
    return isVisible ? path(fieldPath, form.errors) : undefined;
  }

  const setCurrency = (value: string) => {
    form.setValues(
      produce(form.values, (draft) => {
        draft.overall.currency = value.toUpperCase();
        for (let item of draft.payments) {
          if (item.currency.toUpperCase() !== value.toUpperCase()) {
            item.currency = value.toUpperCase();
            item.amount = 0;
          }
        }
      }),
      false
    );
  };
  const totalAmount = getTotal(props.form.values);
  const subTotalAmount = getSubTotal(props.form.values);
  const currenciesApplied = uniq(form.values.payments.map((p) => p.currency));
  const isCurrencyAligned =
    currenciesApplied.length === 1 &&
    currenciesApplied[0] === form.values.overall.currency;
  const minDate = moment().add(1, "minute").toDate();
  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.title}>
          <span>{t("chat.paymentLink.generate.form.header")}</span>
        </div>
        <div className={styles.settings}>
          <div className={styles.currency}>
            <div className={styles.label}>
              {t("chat.paymentLink.generate.form.currency.label")}
            </div>
            <div className="ui input">
              <CurrencySelector
                value={
                  isCurrencyAligned
                    ? form.values.overall.currency.toUpperCase()
                    : undefined
                }
                onChange={setCurrency}
                currencies={regions.currenciesSupported.map((c) => ({
                  ...c,
                  currencyCode: c.currencyCode.toUpperCase(),
                }))}
              />
            </div>
          </div>
          <div className={styles.expiredAt}>
            <div className={styles.label}>
              {t("chat.shopifyProductsModal.cart.expiredAt")}
            </div>
            <div className="ui input">
              <DatePickerUtcAware
                dateFormat={"yyyy/MM/dd h:mm aa"}
                utcOffset={utcOffset}
                selected={form.values.expiredAt}
                showTimeSelect
                onChange={(date) =>
                  date && form.setFieldValue("expiredAt", date as Moment)
                }
                minDate={minDate}
                minTime={
                  form.values.expiredAt.isSame(minDate, "day")
                    ? minDate
                    : setHours(setMinutes(minDate, 0), 0)
                }
                maxTime={setHours(setMinutes(minDate, 59), 23)}
                shouldCloseOnSelect={true}
                popperClassName={styles.popup}
                popperPlacement="bottom-end"
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.items}>
        {form.values.payments.map((value, idx) => (
          <div className={`${styles.item}`} key={value.key}>
            <GenerateLinkFormItem
              values={value}
              errors={getErrorsVisible(["payments", idx])}
              canRemove={form.values.payments.length > 1}
              setValues={getValueSetter(idx)}
              currency={value.currency}
              setCurrency={setCurrency}
              remove={removeItem(idx)}
              loading={loading}
            />
          </div>
        ))}
        <div className={styles.add}>
          <Button
            content={
              <>
                <PlusIcon />
                {t("chat.paymentLink.generate.form.add")}
              </>
            }
            disabled={loading || !canAddMoreItems}
            onClick={addItem}
          />
        </div>
      </div>
      <div className={styles.footer}>
        <div
          className={`
            ${styles.status}
            ${isStatusVisible ? styles.visible : ""}
           `}
        >
          <div
            className={`${styles.subtotal} ${
              !totalAmount.eq(subTotalAmount) ? styles.visible : ""
            }`}
          >
            {t("chat.paymentLink.generate.form.subtotal", {
              amount: formatCurrency(subTotalAmount.toNumber()),
              currency: form.values.overall.currency.toUpperCase(),
            })}
          </div>
          <div className={styles.totals}>
            <div className={styles.text}>
              {t("chat.paymentLink.generate.form.status", {
                amount: formatCurrency(totalAmount.toNumber()),
                currency: form.values.overall.currency.toUpperCase(),
              })}
            </div>
            <div className={styles.discount}>
              <DiscountPopup form={props.form} loading={loading} />
            </div>
          </div>
          <div className={styles.errors}>
            {amountError && (
              <FieldError text={amountError} className={styles.error} />
            )}
          </div>
        </div>
        <div className="actions">
          <Button
            primary
            disabled={!canSubmit}
            loading={loading}
            onClick={canSubmit ? onSubmit : undefined}
            content={t("chat.paymentLink.generate.form.generate")}
          />
        </div>
      </div>
    </div>
  );
}
