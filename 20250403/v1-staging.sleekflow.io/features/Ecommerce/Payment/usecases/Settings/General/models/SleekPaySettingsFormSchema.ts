import { TFunction } from "i18next";
import * as yup from "yup";
import moment from "moment";
import {
  DeliveryEstimateUnit,
  PaymentLinkExpirationType,
  ShippingConditionType,
  ShippingOption,
} from "core/models/Ecommerce/Payment/SleekPayStatusType";
import { parseAndFormatAnyPhone } from "component/Channel/selectors";

export type SleekPaySettingsFormValues = {
  brandColor: string;
  buttonsColor: string;
  companyLogoUrl: string;
  companyLogo?: File;
  isShippingEnabled: boolean;
  shippingOptions: ShippingOption[];
  shippingAllowedCountries: string[];
  paymentLinkExpirationOption: {
    expireAt: string;
    expireNumberOfDaysAfter: number;
    paymentLinkExpirationType: PaymentLinkExpirationType;
  };
  isShopifyDiscountEnable: boolean;
  contactDetail: {
    phoneNumber?: string;
    email?: string;
  };
};

export const getDefaultFormValues = (): SleekPaySettingsFormValues => ({
  isShippingEnabled: false,
  brandColor: "#000000",
  buttonsColor: "#000000",
  companyLogoUrl: "",
  companyLogo: undefined,
  shippingAllowedCountries: ["HK"],
  paymentLinkExpirationOption: {
    expireAt: new Date().toISOString(),
    expireNumberOfDaysAfter: 0,
    paymentLinkExpirationType: 0,
  },
  shippingOptions: [
    {
      displayName: "",
      shippingFee: 0,
      currency: "hkd",
      deliveryEstimateMin: 1,
      deliveryEstimateMax: 5,
      deliveryEstimateUnit: 2,
      condition: {
        shippingOptionConditionType: 0,
        orderPriceRangeLower: 0,
        orderPriceRangeUpper: 1,
      },
    },
  ],
  isShopifyDiscountEnable: false,
  contactDetail: {
    phoneNumber: undefined,
    email: undefined,
  },
});

export function generateSchema(t: TFunction) {
  const colorSchema = yup
    .string()
    .test("is-hex-colour", t("form.stripe.hexColor"), (value) => {
      return /^#[0-9a-f]{6}$/i.test(value);
    })
    .required();

  const companyLogoSchema = yup.mixed().when("companyLogoUrl", {
    is: (url) => url === "",
    then: yup.mixed().required(),
    otherwise: yup.mixed().notRequired(),
  });

  const orderPriceRangeLowerSchema = yup
    .mixed()
    .when("shippingOptionConditionType", {
      is: (type) => type === ShippingConditionType.ORDER_PRICING_RANGE,
      then: yup
        .number()
        .min(0)
        .when(
          "orderPriceRangeUpper",
          (value: number, schema: yup.NumberSchema) => {
            return schema.lessThan(value).required();
          }
        ),
      otherwise: yup.number().notRequired(),
    });

  const orderPriceRangeUpperSchema = yup
    .mixed()
    .when("shippingOptionConditionType", {
      is: (type) => type === ShippingConditionType.ORDER_PRICING_RANGE,
      then: yup
        .number()
        .when(
          "orderPriceRangeLower",
          (value: number, schema: yup.NumberSchema) => {
            return schema.moreThan(value).required();
          }
        ),
      otherwise: yup.number().notRequired(),
    });

  const shippingOptionsSchema = yup.array().of(
    yup.object().shape(
      {
        displayName: yup.string().required(),
        shippingFee: yup.number().required(),
        currency: yup.string().required(),
        deliveryEstimateUnit: yup
          .number()
          .oneOf([
            DeliveryEstimateUnit.BUSINESS_DAY,
            DeliveryEstimateUnit.DAY,
            DeliveryEstimateUnit.HOUR,
          ])
          .required(),
        deliveryEstimateMin: yup
          .number()
          .min(0)
          .when(
            "deliveryEstimateMax",
            (value: number, schema: yup.NumberSchema) => {
              return schema.max(value - 1).integer();
            }
          )
          .required(),
        deliveryEstimateMax: yup
          .number()
          .when(
            "deliveryEstimateMin",
            (value: number, schema: yup.NumberSchema) => {
              return schema.min(value + 1).integer();
            }
          )
          .required(),
        condition: yup.object().shape({
          shippingOptionConditionType: yup
            .number()
            .oneOf([
              ShippingConditionType.ALWAYS_SHOW,
              ShippingConditionType.ORDER_PRICING_RANGE,
            ])
            .required(),
          orderPriceRangeLower: orderPriceRangeLowerSchema,
          orderPriceRangeUpper: orderPriceRangeUpperSchema,
        }),
      },
      [
        ["deliveryEstimateMin", "deliveryEstimateMax"],
        ["orderPriceRangeUpper", "orderPriceRangeLower"],
      ]
    )
  );
  const contactDetailSchema = yup.object().shape({
    email: yup.string().email(t("form.field.email.error.invalid")),
    phoneNumber: yup
      .string()
      .test(
        "phone-is-valid",
        t("form.profile.field.phone.error.format"),
        function (this: yup.TestContext, value?: any) {
          if (!value) {
            return true;
          }
          const parsed = parseAndFormatAnyPhone(value as string);
          return parsed !== undefined;
        }
      ),
  });
  const paymentLinkExpirationOptionSchema = yup.object().shape({
    paymentLinkExpirationType: yup
      .number()
      .oneOf([PaymentLinkExpirationType.DAYS, PaymentLinkExpirationType.DATE])
      .required(),
    expireAt: yup.date().when("paymentLinkExpirationType", {
      is: (type) => type === PaymentLinkExpirationType.DATE,
      then: yup
        .date()
        .required()
        .test("expireAt", "expireAt must be after today", (value) =>
          moment(value).isAfter(moment())
        ),
      otherwise: yup.date().notRequired(),
    }),
    expireNumberOfDaysAfter: yup.number().when("paymentLinkExpirationType", {
      is: (type) => type === PaymentLinkExpirationType.DAYS,
      then: yup.number().min(1).required(),
      otherwise: yup.number().notRequired(),
    }),
  });

  return yup.object({
    brandColor: colorSchema,
    buttonsColor: colorSchema,
    companyLogo: companyLogoSchema,
    paymentLinkExpirationOption: paymentLinkExpirationOptionSchema,
    isShippingEnabled: yup.boolean().required(),
    shippingOptions: yup.mixed().when("isShippingEnabled", {
      is: true,
      then: shippingOptionsSchema,
      otherwise: yup.object().nullable().notRequired(),
    }),
    isShopifyDiscountEnable: yup.boolean().required(),
    contactDetail: contactDetailSchema,
  });
}
