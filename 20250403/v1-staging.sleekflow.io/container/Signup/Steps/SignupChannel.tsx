import React, { useContext, useEffect, useState } from "react";
import signupStyles from "./Signup.module.css";
import styles from "./SignupChannel.module.css";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../../component/shared/nav/BackLink";
import SignupContext from "../SignupContext";
import Footer from "./Footer";
import WhatsAppIcon from "../../../assets/images/channels/whatsapp.svg";
import InstagramIcon from "../../../assets/images/channels/Instagram.svg";
import WechatIcon from "../../../assets/images/channels/wechat.svg";
import LineIcon from "../../../assets/images/channels/line.svg";
import WebWidgetIcon from "../../../assets/images/channels/website-widget.svg";
import MessengerIcon from "../../../assets/images/channels/facebook-messenger.svg";
import SmsIcon from "../../../assets/images/channels/sms.svg";
import TelegramIcon from "../../../assets/images/channels/telegram.svg";
import ViberIcon from "../../../assets/images/channels/viber-filled.svg";
import { Checkbox, Image } from "semantic-ui-react";
import { Button } from "../../../component/shared/Button/Button";
import { FieldError } from "../../../component/shared/form/FieldError";
import { array, boolean, object, TestContext } from "yup";
import { sendRegisterAccountCompany } from "../../../api/User/sendRegisterAccountCompany";
import { useFormik } from "formik";
import { trackDreamData } from "../../../utility/dreamData";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import { isAxiosHttpError } from "../../../api/apiRequest";
import mixpanel from "mixpanel-browser";
import useRegisterAccountCompnay from "api/User/useRegisterAccountCompany";
import { useAuth0 } from "@auth0/auth0-react";
import useFetchPlanFeatureInfo from "api/Company/useFetchPlanFeatureInfo";
import postUserWorkspace from "api/User/postUserWorkspace";
import { axiosObservableInstance } from "AppRootContext";

const channels = [
  { name: "WhatsApp", icon: WhatsAppIcon, value: "whatsapp" },
  { name: "Instagram", icon: InstagramIcon, value: "instagram" },
  { name: "WeChat", icon: WechatIcon, value: "wechat" },
  { name: "Facebook", icon: MessengerIcon, value: "facebook" },
  { name: "Line", icon: LineIcon, value: "line" },
  { name: "SMS", icon: SmsIcon, value: "sms" },
  { name: "Telegram", icon: TelegramIcon, value: "telegram" },
  { name: "Viber", icon: ViberIcon, value: "viber" },
  { name: "Website Widget", icon: WebWidgetIcon, value: "websiteWidget" },
];

export default function SignupChannel() {
  const { t } = useTranslation();
  const { signupDispatch, registerInfo } = useContext(SignupContext);
  const accessRuleGuard = useAccessRulesGuard();
  const isSocialLogin = accessRuleGuard.isSocialLoginUser();
  const { user } = useAuth0();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isGlobalPricingFeatureEnabled } = useFetchPlanFeatureInfo();

  const formValidator = object().shape({
    channels: array().test(
      "select channels",
      t("form.signup.field.channel.error.required"),
      function (this: TestContext, value: string[]) {
        if (value.length !== 0) {
          return true;
        }
        return this.parent.isEmpty;
      }
    ),
    isEmpty: boolean().test(
      "is empty",
      t("form.signup.field.channel.error.required"),
      function (this: TestContext, value: boolean) {
        if (this.parent.channels && this.parent.channels?.length !== 0) {
          return true;
        }
        return value;
      }
    ),
  });

  const isNewSignup = process.env.REACT_APP_ENABLE_NEW_SIGNUP === "true";
  const { setFieldValue, values, errors, submitForm, setErrors } = useFormik({
    initialValues: {
      channels: registerInfo.channels,
      isEmpty: registerInfo.isEmptyChannel,
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: formValidator,
    onSubmit: async ({ channels }) => {
      try {
        if (!isNewSignup) {
          setLoading(true);
          const result = await sendRegisterAccountCompany(
            {
              ...registerInfo,
              webClientUUID: localStorage.getItem("webClientUUID") || "",
              channels,
              ...(isSocialLogin && {
                firstName: null,
                lastName: null,
              }),
            },
            registerInfo.timeZoneInfoId as string,
            isGlobalPricingFeatureEnabled
          );
          if (window["dataLayer"]) {
            window["dataLayer"].push({ event: "signup" });
          }
          if (window["tolt_referral"]) {
            window.tolt.signup(result.email);
          }
          trackDreamData("mql", result.email);
          signupDispatch({ type: "NEXT_STEP" });
          mixpanel.identify(result.id);
          mixpanel.people.set({
            Industry: registerInfo.industry,
          });
          mixpanel.track("Sign Up Completed");
        } else {
          setIsSubmitting(true);
          if (registerAccountAndCompany.error) {
            const errorMessage =
              registerAccountAndCompany.errorRes.response.data?.message;
            console.debug(`errorMessage`, errorMessage);
            if (errorMessage) {
              if (errorMessage.includes("You already in company")) {
                // just in case
                setErrors({ channels: errorMessage });
              }
            } else {
              setErrors(t("form.signup.field.email.error.unknown"));
            }
          }
        }
      } catch (e) {
        if (isAxiosHttpError(e) && e.response) {
          const errorMessage = e.response.data?.message;
          if (errorMessage) {
            if (errorMessage.includes("You already in company")) {
              // just in case
              setErrors({ channels: errorMessage });
            }
          } else {
            setErrors(t("form.signup.field.email.error.unknown"));
          }
        }
      }
    },
  });
  const registerAccountAndCompany = useRegisterAccountCompnay({
    data: {
      ...registerInfo,
      webClientUUID: localStorage.getItem("webClientUUID") || "",
      communicationTools: values.channels,
      industry: registerInfo.industry,
      timeZoneInfoId: registerInfo.timeZoneInfoId as string,
      lmref: "",
      promotionCode: registerInfo.promoCode,
      connectionStrategy:
        user?.["https://app.sleekflow.io/connection_strategy"],
      isGlobalPricingEnabled: isGlobalPricingFeatureEnabled,
      partnerstackKey: localStorage.getItem("partnerKey") || "",
    },
    enabled:
      (values.channels.length > 0 || values.isEmpty) &&
      isSubmitting &&
      isNewSignup,
  });
  localStorage.setItem("partnerKey", "");
  const loadingData = isNewSignup ? registerAccountAndCompany.loading : loading;
  useEffect(() => {
    if (registerAccountAndCompany.data?.data) {
      const result = registerAccountAndCompany.data.data;
      if (window["dataLayer"]) {
        window["dataLayer"].push({ event: "signup" });
      }
      if (window["tolt_referral"]) {
        window.tolt.signup(result.email);
      }
      postUserWorkspace().then((res) => {
        const defaultLocation = res.data.user_workspaces.find(
          (w) => w.is_default
        );
        if (defaultLocation) {
          axiosObservableInstance.interceptors.request.use(
            async (config) => {
              try {
                if (defaultLocation) {
                  config.headers = {
                    ...config.headers,
                    "X-Sleekflow-Location": defaultLocation.server_location,
                  };
                }
                return config;
              } catch (e) {
                return config;
              }
            },
            (error) => {
              return error;
            }
          );
        }
        mixpanel.identify(result.user_id);
        mixpanel.people.set({
          Industry: registerInfo.industry,
          "User Email": result.email,
          Name: result.user_name,
          Username: result.user_name,
        });
        mixpanel.track("Company Account Created");
        trackDreamData("mql", result.email);
        signupDispatch({ type: "NEXT_STEP" });
      });
    }
  }, [registerAccountAndCompany.data]);
  return (
    <div className={`main-content ${signupStyles.content} ${styles.content}`}>
      <div className={`${signupStyles.column} ${signupStyles.left}`}>
        <div className={signupStyles.contentWrapper}>
          <div className={signupStyles.backBtn}>
            <BackLink
              onClick={() => {
                if (values.isEmpty) {
                  signupDispatch({
                    type: "PREV_STEP",
                    updatedRegisterInfo: {
                      channels: [],
                      isEmptyChannel: true,
                    },
                  });
                } else {
                  signupDispatch({
                    type: "PREV_STEP",
                    updatedRegisterInfo: {
                      channels: values.channels,
                      isEmptyChannel: false,
                    },
                  });
                }
              }}
            >
              {t("nav.backShort")}
            </BackLink>
          </div>
          <div className={signupStyles.stepBar}>
            <div className={`${signupStyles.step} ${signupStyles.active}`}>
              1
            </div>
            <div className={`${signupStyles.line} ${signupStyles.active}`} />
            <div className={`${signupStyles.step} ${signupStyles.active}`}>
              2
            </div>
            <div className={`${signupStyles.line} ${signupStyles.active}`} />
            <div className={`${signupStyles.step} ${signupStyles.active}`}>
              3
            </div>
          </div>
          <div className={styles.descWrapper}>
            <div className={styles.title}>
              {t("form.signup.signupChannel.subTitle")}
            </div>
            <div className={styles.description}>
              {t("form.signup.signupChannel.desc")}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      <div className={`${signupStyles.column} ${signupStyles.right}`}>
        <div className={signupStyles.contentWrapper}>
          <div className={signupStyles.mobileBackLink}>
            <BackLink
              onClick={() => {
                if (values.isEmpty) {
                  signupDispatch({
                    type: "PREV_STEP",
                    updatedRegisterInfo: {
                      channels: [],
                      isEmptyChannel: true,
                    },
                  });
                } else {
                  signupDispatch({
                    type: "PREV_STEP",
                    updatedRegisterInfo: {
                      channels: values.channels,
                      isEmptyChannel: false,
                    },
                  });
                }
              }}
            >
              {t("nav.backShort")}
            </BackLink>
          </div>
          <div className={`container ${styles.card}`}>
            <div className={styles.channels}>
              {channels.map((channel) => {
                const isActive = values.channels.includes(channel.value);
                return (
                  <div
                    key={channel.value}
                    className={
                      isActive
                        ? `${styles.channel} ${styles.active}`
                        : styles.channel
                    }
                    onClick={() => {
                      if (isActive) {
                        const filteredChannels = values.channels.filter(
                          (_channel) => _channel !== channel.value
                        );
                        setFieldValue("channels", filteredChannels);
                      } else {
                        setFieldValue("isEmpty", false);
                        setFieldValue("channels", [
                          ...values.channels,
                          channel.value,
                        ]);
                      }
                    }}
                  >
                    <Image className={styles.icon} src={channel.icon} />
                    <div className={styles.channelName}>{channel.name}</div>
                  </div>
                );
              })}
            </div>
            <div className={styles.isEmpty}>
              <Checkbox
                id="isEmpty"
                disabled={(values.channels?.length ?? 0) > 0}
                label={t("form.signup.field.channel.emptyCheck")}
                checked={values.isEmpty}
                onChange={(_, data) => {
                  setFieldValue("isEmpty", data.checked);
                }}
              />
            </div>
            <div className={styles.btnBlock}>
              <Button
                primary
                customSize="mid"
                centerText
                className={styles.nextStepBtn}
                loading={loadingData}
                disabled={loadingData}
                onClick={loadingData ? undefined : submitForm}
                content={t("form.signup.button.next")}
              />
            </div>
            <FieldError
              text={errors.channels || errors.isEmpty || ""}
              className={`${styles.footerError} ${styles.fieldError}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
