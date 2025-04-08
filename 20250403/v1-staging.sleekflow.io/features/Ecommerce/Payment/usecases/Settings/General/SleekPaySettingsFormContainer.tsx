import React from "react";
import { Formik, FormikHelpers } from "formik";
import { useTranslation } from "react-i18next";
import { Form, Loader } from "semantic-ui-react";
import { Button } from "component/shared/Button/Button";
import BrandingSection from "./Branding/BrandingSection";
import styles from "./GeneralTab.module.css";
import {
  generateSchema,
  getDefaultFormValues,
  SleekPaySettingsFormValues,
} from "./models/SleekPaySettingsFormSchema";
import { useFetchSleekPaySettings } from "features/Ecommerce/Payment/usecases/Settings/hooks/useFetchSleekPaySettings";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import AccountOverview from "./AccountOverview/AccountOverview";
import PaymentLinkExpirationSection from "./PaymentLinkExpiration/PaymentLinkExpirationSection";
import ShippingSection from "./ShippingInfo/ShippingSection";
import postStripePaymentLink from "api/StripePayment/postStripePaymentLink";
import { usePaymentSettingsContext } from "features/Ecommerce/Payment/usecases/Settings/contracts/PaymentSettingsContext";
import postShopifySetting from "api/StripePayment/postShopifySetting";
import ShopifySetting from "./ShopifySetting";
import GeneralStripeEmailSetting from "./GeneralStripeEmailSetting/GeneralStripeEmailSetting";
import { useAppSelector } from "AppRootContext";

export default function SleekPaySettingsFormContainer() {
  const { t } = useTranslation();
  const settings = usePaymentSettingsContext();
  const { data, loading, error } = useFetchSleekPaySettings({
    countryCode: settings.country.countryCode,
  });
  const companyId = useAppSelector((s) => s.company?.id);
  const isShopifyStoreExist = useAppSelector((s) =>
    Boolean(s.company?.shopifyConfigs?.length)
  );
  const flash = useFlashMessageChannel();

  if (loading) {
    return (
      <div className={styles.loadingSection}>
        <Loader active inline />
      </div>
    );
  }

  if (!data || error) {
    return <div className={styles.errorSection}>{t("somethingWentWrong")}</div>;
  }

  const schema = generateSchema(t);

  async function onSubmit(
    values: SleekPaySettingsFormValues,
    { setSubmitting }: FormikHelpers<SleekPaySettingsFormValues>
  ) {
    try {
      setSubmitting(true);
      const formData = new FormData();

      formData.append("AccountId", data?.accountId ?? "");
      formData.append("IsShippingEnabled", values.isShippingEnabled.toString());
      formData.append("BrandColor", values.brandColor.replace("#", ""));
      formData.append("ButtonsColor", values.buttonsColor.replace("#", ""));
      formData.append(
        "PaymentLinkExpirationOption",
        JSON.stringify(values.paymentLinkExpirationOption)
      );

      if (values.companyLogo) {
        formData.append("CompanyLogo", values.companyLogo ?? "");
      }
      if (values.contactDetail.email) {
        formData.append("supportEmail", values.contactDetail.email);
      }
      if (values.contactDetail.phoneNumber) {
        formData.append("supportPhoneNumber", values.contactDetail.phoneNumber);
      }
      if (values.isShippingEnabled) {
        formData.append(
          "ShippingOptions",
          JSON.stringify(values.shippingOptions)
        );
      } else {
        formData.append("ShippingOptions", "[]");
      }

      values.shippingAllowedCountries.forEach((country) => {
        formData.append("ShippingAllowedCountries", country);
      });

      await postShopifySetting(values.isShopifyDiscountEnable);
      await postStripePaymentLink(formData);
      flash(t("flash.settings.payment.general.success"));
    } catch (e) {
      flash(t("flash.settings.payment.general.error"));
    } finally {
      setSubmitting(false);
    }
  }

  const {
    shippingAllowedCountries,
    shippingOptions,
    brandColor,
    buttonsColor,
    isShippingEnabled,
    companyLogoUrl,
    currency,
    volume,
    paymentLinkExpirationOption,
    loginUrl,
    isEnabledDiscounts,
    contactDetail,
  } = data || {};

  const defaultValues = getDefaultFormValues();
  const initialValues: SleekPaySettingsFormValues = {
    brandColor: brandColor ?? defaultValues.brandColor,
    buttonsColor: buttonsColor ?? defaultValues.buttonsColor,
    shippingOptions: shippingOptions?.length
      ? shippingOptions
      : defaultValues.shippingOptions,
    shippingAllowedCountries: shippingAllowedCountries?.length
      ? shippingAllowedCountries
      : defaultValues.shippingAllowedCountries,
    isShippingEnabled: isShippingEnabled || defaultValues.isShippingEnabled,
    companyLogoUrl: companyLogoUrl ?? defaultValues.companyLogoUrl,
    companyLogo: defaultValues.companyLogo,
    paymentLinkExpirationOption:
      paymentLinkExpirationOption ?? defaultValues.paymentLinkExpirationOption,
    isShopifyDiscountEnable:
      isEnabledDiscounts ?? defaultValues.isShopifyDiscountEnable,
    contactDetail: contactDetail ?? defaultValues.contactDetail,
  };

  return (
    <>
      <Formik
        onSubmit={onSubmit}
        initialValues={initialValues}
        validationSchema={schema}
        validateOnMount
      >
        {({ errors, isSubmitting, submitForm }) => {
          const hasErrors = Object.keys(errors).length > 0;

          return (
            <>
              <AccountOverview
                volume={volume}
                currency={currency}
                loginUrl={loginUrl}
              />
              <BrandingSection />
              <Form>
                <ShippingSection />
                <PaymentLinkExpirationSection />
                {process.env.REACT_APP_HIDE_DISCOUNT_SETTING_COMPANY_ID !==
                  companyId &&
                  isShopifyStoreExist && <ShopifySetting />}
                <GeneralStripeEmailSetting />
              </Form>
              <Button
                className={styles.saveButton}
                primary
                onClick={submitForm}
                disabled={hasErrors || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader inline active size="mini" />
                ) : (
                  t("settings.paymentLink.general.save")
                )}
              </Button>
            </>
          );
        }}
      </Formik>
    </>
  );
}
