import React, { useContext, useEffect, useState } from "react";
import { Checkbox, Dropdown, Form } from "semantic-ui-react";
import SignupContext from "../SignupContext";
import * as yup from "yup";
import PhoneNumber from "../../../component/PhoneNumber";
import { useValidateContact } from "../../../component/Contact/validation/useValidateContact";
import { useTranslation } from "react-i18next";
import signupStyles from "./Signup.module.css";
import styles from "./SignupRegisterInfo.module.css";
import { FieldError } from "../../../component/shared/form/FieldError";
import Footer from "./Footer";
import { Button } from "../../../component/shared/Button/Button";
import { TFunction } from "i18next";
import { useFormik } from "formik";
import { useAuth0 } from "@auth0/auth0-react";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import TimeZoneComponent from "component/TimeZoneComponent";
import { useGetDefaultTimezone } from "../useGetDefaultTimezone";
import useFetchGeoLocation from "api/User/useFetchGeoLocation";
import { parsePhoneNumber } from "libphonenumber-js";
import mixpanel from "mixpanel-browser";

const getCompanySizeOpts = (t: TFunction) => [
  {
    value: "1-19",
    text: t("form.signup.field.companySize.options.small"),
  },
  {
    value: "20-49",
    text: t("form.signup.field.companySize.options.medium"),
  },
  {
    value: "50-100",
    text: t("form.signup.field.companySize.options.big"),
  },
  {
    value: "101-500",
    text: t("form.signup.field.companySize.options.bigger"),
  },
  {
    value: "500+",
    text: t("form.signup.field.companySize.options.veryBig"),
  },
];

const getCompanyIndustryOpts = (t: TFunction) => [
  {
    value: "Agencies, Professional Services & Consulting",
    text: t("form.signup.field.industry.options.professionalServices"),
  },
  {
    value: "Classes (e.g. Education, Gym)",
    text: t("form.signup.field.industry.options.classes"),
  },
  { value: "Fashion", text: t("form.signup.field.industry.options.cashion") },
  {
    value: "Financial Services",
    text: t("form.signup.field.industry.options.financialServices"),
  },
  {
    value: "Jewellery",
    text: t("form.signup.field.industry.options.jewellery"),
  },
  {
    value: "Medical, Beauty & Wellness",
    text: t("form.signup.field.industry.options.medicalBeautyWellness"),
  },
  {
    value: "Platform Business",
    text: t("form.signup.field.industry.options.platformBusiness"),
  },
  {
    value: "Properties, F&B & Hospitality",
    text: t("form.signup.field.industry.options.propertiesFbHospitality"),
  },
  {
    value: "Skincare & Cosmetics",
    text: t("form.signup.field.industry.options.skincareCosmetics"),
  },
  { value: "Others", text: t("form.signup.field.industry.options.others") },
];

const getOnlineShopOpts = (t: TFunction) => [
  {
    value: "Shopify",
    text: t("form.signup.field.onlineShopSystem.options.shopify"),
  },
  {
    value: "Shopline",
    text: t("form.signup.field.onlineShopSystem.options.shopline"),
  },
  {
    value: "WooCommerce",
    text: t("form.signup.field.onlineShopSystem.options.wooCommerce"),
  },
  { value: "Wix", text: t("form.signup.field.onlineShopSystem.options.wix") },
  {
    value: "Prestashop",
    text: t("form.signup.field.onlineShopSystem.options.prestashop"),
  },
  {
    value: "Wordpress",
    text: t("form.signup.field.onlineShopSystem.options.wordPress"),
  },
  {
    value: "BigCommerce",
    text: t("form.signup.field.onlineShopSystem.options.bigCommerce"),
  },
  {
    value: "Magento 2",
    text: t("form.signup.field.onlineShopSystem.options.magento"),
  },
  {
    value: "Salesforce Commerce Cloud",
    text: t("form.signup.field.onlineShopSystem.options.salesforce"),
  },
  {
    value: "Others",
    text: t("form.signup.field.onlineShopSystem.options.others"),
  },
];
const isNewSignup = process.env.REACT_APP_ENABLE_NEW_SIGNUP === "true";
const getFormSchema = ({
  isGoogleLogin,
  t,
  validatePhone,
}: {
  isGoogleLogin: boolean;
  t: TFunction;
  validatePhone: (
    message?: string | undefined,
    allowEmpty?: boolean
  ) => yup.StringSchema<string>;
}) =>
  yup.object().shape({
    firstName: isGoogleLogin
      ? yup.string()
      : yup
          .string()
          .ensure()
          .trim()
          .required(t("form.signup.field.firstName.error.required")),
    lastName: isGoogleLogin
      ? yup.string()
      : yup
          .string()
          .ensure()
          .trim()
          .required(t("form.signup.field.lastName.error.required")),
    companyName: yup
      .string()
      .ensure()
      .trim()
      .required(t("form.signup.field.companyName.error.required")),
    companySize: yup
      .string()
      .ensure()
      .trim()
      .required(t("form.signup.field.companySize.error.required")),
    phoneNumber: yup
      .string()
      .ensure()
      .trim()
      .required(t("form.signup.field.phone.error.required"))
      .concat(validatePhone()),
    industry: yup
      .string()
      .ensure()
      .trim()
      .required(t("form.signup.field.industry.error.required")),
    location: !isNewSignup
      ? yup.string()
      : yup
          .string()
          .ensure()
          .trim()
          .required(t("form.signup.field.geoLocation.error.required")),
    marketingConsentCheckbox: yup.boolean(),
  });
const euCountryCodeList = [
  "VA",
  "GB",
  "UA",
  "TR",
  "CH",
  "RS",
  "SM",
  "RU",
  "NO",
  "ME",
  "MC",
  "MD",
  "MK",
  "LI",
  "XK",
  "IM",
  "IS",
  "GI",
  "GE",
  "FO",
  "BA",
  "BY",
  "AM",
  "AD",
  "AL",
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];
const americaCountryCodeList = [
  "AI",
  "AG",
  "AR",
  "AW",
  "BS",
  "BB",
  "BZ",
  "BM",
  "BO",
  "BQ",
  "BR",
  "CA",
  "KY",
  "CL",
  "CO",
  "CR",
  "CU",
  "CW",
  "DM",
  "DO",
  "EC",
  "SV",
  "FK",
  "GF",
  "GD",
  "GP",
  "GT",
  "GY",
  "HT",
  "HN",
  "JM",
  "MQ",
  "MX",
  "MS",
  "NI",
  "PA",
  "PY",
  "PE",
  "PR",
  "BL",
  "KN",
  "LC",
  "MF",
  "PM",
  "VC",
  "SX",
  "SR",
  "TT",
  "TC",
  "US",
  "UY",
  "VE",
  "VG",
  "VI",
];
export default function SignupRegisterInfo() {
  const { signupDispatch, registerInfo } = useContext(SignupContext);
  const { t } = useTranslation();
  const { validatePhone } = useValidateContact();
  const companySizeOpts = getCompanySizeOpts(t);
  const companyIndustryOpts = getCompanyIndustryOpts(t);
  const onlineShopOpts = getOnlineShopOpts(t);
  const { user } = useAuth0();
  const accessRuleGuard = useAccessRulesGuard();
  const isSocialLogin = accessRuleGuard.isSocialLoginUser();
  const [timezoneId, setTimezoneId] = useState<string>();
  const [timezoneLoading, setTimezoneLoading] = useState<boolean>(false);
  useGetDefaultTimezone({ setTimezoneId, setTimezoneLoading });
  const { data: closetLocation } = useFetchGeoLocation();
  const formik = useFormik({
    initialValues: {
      countryCode: "",
      firstName: registerInfo.firstName || "",
      lastName: registerInfo.lastName || "",
      companyName: registerInfo.companyName || "",
      companySize: registerInfo.companySize || "",
      phoneNumber: registerInfo.phoneNumber || "",
      industry: registerInfo.industry || "",
      onlineShopSystem: registerInfo.onlineShopSystem || "",
      companyWebsite: registerInfo.companyWebsite || "",
      isAgreeMarketingConsent: registerInfo.isAgreeMarketingConsent || false,
      location: registerInfo.location || "eastasia",
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: getFormSchema({
      t,
      validatePhone,
      isGoogleLogin: isSocialLogin,
    }),
    onSubmit: async (values) => {
      // update info
      signupDispatch({
        type: "NEXT_STEP",
        updatedRegisterInfo: {
          ...values,
          connectionStrategy:
            user?.["https://app.sleekflow.io/connection_strategy"],
          timeZoneInfoId: timezoneId,
        },
      });
    },
  });
  // sync information and disable first and last name fields if google login
  useEffect(() => {
    if (isSocialLogin && user) {
      formik.setFieldValue("firstName", user?.given_name || user?.name);
      formik.setFieldValue("lastName", user?.family_name || ".");
    }
    if (user?.email) {
      mixpanel.track("Sign Up Completed", {
        email: user.email,
      });
    }
  }, [JSON.stringify(user), isSocialLogin]);

  useEffect(() => {
    if (closetLocation?.data.data_center_location) {
      formik.setFieldValue(
        "location",
        closetLocation?.data.data_center_location
      );
    }
  }, [closetLocation?.data.data_center_location]);
  useEffect(() => {
    try {
      const parsedNumber = parsePhoneNumber(`+${formik.values.phoneNumber}`);
      const countryCode = parsedNumber.country;
      if (!countryCode || !parsedNumber.isValid()) {
        return;
      }

      if (euCountryCodeList.includes(countryCode)) {
        formik.setFieldValue("location", "westeurope");
      }
      if (americaCountryCodeList.includes(countryCode)) {
        formik.setFieldValue("location", "eastus");
      }
    } catch (e) {}
  }, [formik.values.phoneNumber]);

  return (
    <div className={`main-content ${signupStyles.content} ${styles.content}`}>
      <div className={`${signupStyles.column} ${signupStyles.left}`}>
        <div className={signupStyles.contentWrapper}>
          <div className={signupStyles.stepBar}>
            <div className={`${signupStyles.step} ${signupStyles.active}`}>
              1
            </div>
            <div className={`${signupStyles.line} ${signupStyles.active}`} />
            <div className={`${signupStyles.step} ${signupStyles.active}`}>
              2
            </div>
            <div className={signupStyles.line} />
            <div className={signupStyles.step}>3</div>
          </div>
          <div className={styles.descWrapper}>
            <div className={styles.title}>
              {t("form.signup.signupRegisterInfo.subTitle")}
            </div>
            <div className={styles.description}>
              {t("form.signup.signupRegisterInfo.desc")}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      <div className={`${signupStyles.column} ${signupStyles.right}`}>
        <div className={signupStyles.contentWrapper}>
          <div className={`container ${styles.card}`}>
            <Form
              onSubmit={formik.handleSubmit}
              id="signupInfo"
              className={`${styles.form} ${signupStyles.form}`}
            >
              <input
                id="email"
                className={styles.hidden}
                type="email"
                value={user?.email}
              />
              <div className={styles.nameRow}>
                <div className={styles.first}>
                  <label htmlFor="firstName">
                    {t("form.signup.field.firstName.label")}
                  </label>
                  <Form.Input
                    id="firstName"
                    disabled={isSocialLogin}
                    onChange={formik.handleChange}
                    value={formik.values.firstName}
                    placeholder={t("form.signup.field.firstName.placeholder")}
                    error={!!formik.errors.firstName}
                  />
                  <FieldError
                    text={formik.errors.firstName || ""}
                    className={styles.fieldError}
                  />
                </div>
                <div className={styles.last}>
                  <label htmlFor="lastName">
                    {t("form.signup.field.lastName.label")}
                  </label>
                  <Form.Input
                    id="lastName"
                    disabled={isSocialLogin}
                    onChange={formik.handleChange}
                    value={formik.values.lastName}
                    placeholder={t("form.signup.field.lastName.placeholder")}
                    error={!!formik.errors.lastName}
                  />
                  <FieldError
                    text={formik.errors.lastName || ""}
                    className={styles.fieldError}
                  />
                </div>
              </div>
              <Form.Field>
                <label htmlFor="phoneNumber">
                  {t("form.signup.field.phone.label")}
                </label>
                <div
                  className={
                    !!formik.errors.phoneNumber
                      ? signupStyles.phoneNumberErr
                      : ""
                  }
                >
                  <PhoneNumber
                    placeholder={t("form.signup.field.phone.placeholder")}
                    fieldName="phoneNumber"
                    onChange={(_, phone, code) => {
                      formik.setFieldValue("countryCode", code);
                      formik.setFieldValue("phoneNumber", phone);
                    }}
                    existValue={formik.values.phoneNumber}
                  />
                </div>
                <FieldError
                  text={formik.errors.phoneNumber || ""}
                  className={styles.fieldError}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="companyName">
                  {t("form.signup.field.companyName.label")}
                </label>
                <Form.Input
                  id="companyName"
                  onChange={formik.handleChange}
                  value={formik.values.companyName}
                  placeholder={t("form.signup.field.companyName.placeholder")}
                  error={!!formik.errors.companyName}
                />
                <FieldError
                  text={formik.errors.companyName || ""}
                  className={styles.fieldError}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="companyWebsite">
                  {t("form.signup.field.companyWebsite.label")}
                  <span className={styles.extraLabel}>
                    {t("form.signup.field.companyWebsite.extraLabel")}
                  </span>
                </label>
                <Form.Input
                  id="companyWebsite"
                  onChange={formik.handleChange}
                  value={formik.values.companyWebsite}
                  placeholder={t(
                    "form.signup.field.companyWebsite.placeholder"
                  )}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="companySize">
                  {t("form.signup.field.companySize.label")}
                </label>
                <Dropdown
                  selectOnBlur={false}
                  options={companySizeOpts.map(({ value, text }) => ({
                    id: value,
                    value,
                    text,
                  }))}
                  fluid
                  upward={false}
                  value={formik.values.companySize}
                  onChange={(event, data) => {
                    formik.setFieldValue(data.id, data.value);
                  }}
                  id="companySize"
                  placeholder={t("form.signup.field.industry.placeholder")}
                  error={!!formik.errors.companySize}
                />
                <FieldError
                  text={formik.errors.companySize || ""}
                  className={styles.fieldError}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="industry">
                  {t("form.signup.field.industry.label")}
                </label>
                <Dropdown
                  selectOnBlur={false}
                  options={companyIndustryOpts.map(({ value, text }) => ({
                    id: value,
                    value,
                    text,
                  }))}
                  fluid
                  scrolling
                  upward={false}
                  value={formik.values.industry}
                  onChange={(event, data) => {
                    if (data.id && typeof data.id === "string") {
                      formik.setFieldValue(data.id, data.value);
                    }
                  }}
                  id="industry"
                  placeholder={t("form.signup.field.industry.placeholder")}
                  error={!!formik.errors.industry}
                />
                <FieldError
                  text={formik.errors.industry || ""}
                  className={styles.fieldError}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="onlineShopSystem">
                  {t("form.signup.field.onlineShopSystem.label")}
                  <span className={styles.extraLabel}>
                    {t("form.signup.field.onlineShopSystem.extraLabel")}
                  </span>
                </label>
                <Dropdown
                  selectOnBlur={false}
                  options={onlineShopOpts.map(({ value, text }) => ({
                    id: value,
                    value,
                    text,
                  }))}
                  fluid
                  scrolling
                  upward={false}
                  value={formik.values.onlineShopSystem}
                  onChange={(event, data) => {
                    if (data.id && typeof data.id === "string") {
                      formik.setFieldValue(data.id, data.value);
                    }
                  }}
                  id="onlineShopSystem"
                  placeholder={t(
                    "form.signup.field.onlineShopSystem.placeholder"
                  )}
                  error={!!formik.errors.onlineShopSystem}
                />
                <FieldError
                  text={formik.errors.onlineShopSystem || ""}
                  className={styles.fieldError}
                />
              </Form.Field>
              {/* {isNewSignup && (
                <GeoLocationDropdown
                  onChange={(id, value) => formik.setFieldValue(id, value)}
                  selectedValue={formik.values.location}
                  error={formik.errors.location || ""}
                />
              )} */}
              <Form.Field>
                <label>{t("account.form.field.yourTimeZone.label")}</label>
                <TimeZoneComponent
                  placeholder={t("account.form.prompt.text", {
                    field: t("account.form.field.yourTimeZone.placeholder"),
                  })}
                  onChange={(id: string) => setTimezoneId(id)}
                  currentTimezone={timezoneId}
                  defaultLoading={timezoneLoading}
                />
              </Form.Field>
              <Form.Field error={!!formik.errors.isAgreeMarketingConsent}>
                <Checkbox
                  label={t("form.signup.field.marketingConsentDescription")}
                  id="isAgreeMarketingConsent"
                  onChange={(event, data) => {
                    if (typeof data.id === "string") {
                      formik.setFieldValue(data.id, data.checked);
                    }
                  }}
                  checked={formik.values.isAgreeMarketingConsent}
                />
                <FieldError
                  text={formik.errors.isAgreeMarketingConsent || ""}
                  className={styles.fieldError}
                />
              </Form.Field>
              <div className={styles.btnBlock}>
                <Button
                  loading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                  customSize="mid"
                  primary
                  centerText
                  className={styles.nextStepBtn}
                  content={t("form.signup.button.next")}
                />
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
