import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import ChannelInfoType from "../types/ChannelInfoType";
import {
  GET_COMPANY_FACEBOOK_ADS_CONNECTIONURL,
  GET_COMPANY_FACEBOOK_CONNECTIONURL,
  GET_COMPANY_INSTAGRAM_CONNECTIONURL,
  GET_FACEBOOK_REDIRECT,
  POST_COMPANY_FACEBOOK_SUBSCRIBE,
  POST_COMPANY_INSTAGRAM_SUBSCRIBE,
  POST_COMPANY_LINE_CONNECT,
  POST_COMPANY_TWILIO_SMS_CONNECT,
  POST_COMPANY_TWILIO_WHATSAPP_CONNECT,
  POST_COMPANY_WECHAT_CONNECT,
  POST_FACEBOOK_ADS_SUBSCRIBE,
  POST_WECHAT_QRCODE,
} from "../api/apiPath";
import { get, getWithExceptions, postWithExceptions } from "../api/apiRequest";
import { useFlashMessageChannel } from "./BannerMessage/flashBannerMessage";
import { ValidationError } from "yup";
import { twilioSmsTransformer } from "./Channel/Forms/TwilioSmsForm";
import { twilioWhatsAppTransformer } from "./Channel/Forms/TwilioWhatsAppForm";
import { AxiosError } from "axios";
import { ChannelFormInputs } from "./Channel/ChannelForms";
import { FacebookFormInputType } from "./Channel/Forms/FacebookForm";
import {
  LineFormInputType,
  SmsFormInputType,
  TwilioWhatsappFormInputType,
  WeChatFormInputType,
} from "./Channel/ChannelSelection";
import { useTwilioValidator } from "./Channel/Forms/localizable/useTwilioValidator";
import { useChannelValidators } from "./Channel/Forms/localizable/useChannelValidators";
import { useTranslation } from "react-i18next";
import { htmlEscape } from "../lib/utility/htmlEscape";
import {
  FacebookPhoneNumberOptionKeyType,
  useFacebookLogin,
} from "features/Facebook/helper/useFacebookLogin";
import { useHistory } from "react-router";
import { getChannelTypeObj } from "component/shared/useAnalytics";
import mixpanel from "mixpanel-browser";

export interface ChannelConfirmCommonProps {
  channelInfo: ChannelInfoType;
  onConnect?: Function;
  setErrorMsg: Function;
}

interface ChannelConfirmModalProps extends ChannelConfirmCommonProps {
  facebookResponded: boolean;
  facebookNotStarted: boolean;
  fileList?: File[];
  formInputs: ChannelFormInputs;
}

export default ChannelConfirmModal;

export function isValidationError(e: any): e is ValidationError {
  return ValidationError.isError(e);
}

export function isHttpError(e: any): e is AxiosError<any> {
  return (e as AxiosError).response !== undefined;
}

const facebookAPIMapping = {
  facebook: {
    subscribe: POST_COMPANY_FACEBOOK_SUBSCRIBE,
    connection: GET_COMPANY_FACEBOOK_CONNECTIONURL,
  },
  facebookLeadAds: {
    subscribe: POST_FACEBOOK_ADS_SUBSCRIBE,
    connection: GET_COMPANY_FACEBOOK_ADS_CONNECTIONURL,
  },
  instagram: {
    subscribe: POST_COMPANY_INSTAGRAM_SUBSCRIBE,
    connection: GET_COMPANY_INSTAGRAM_CONNECTIONURL,
  },
};

function ChannelConfirmModal(props: ChannelConfirmModalProps) {
  const {
    channelInfo,
    fileList,
    onConnect,
    setErrorMsg,
    facebookResponded,
    facebookNotStarted,
  } = props;
  const { formInputs } = props;
  const [httpError, setHttpError] = useState<AxiosError<any>>();
  const [loading, isLoading] = useState(false);
  const flash = useFlashMessageChannel();
  const channelName = channelInfo.name;
  const formValues = formInputs[channelName];
  const { t } = useTranslation();

  const { twilioSmsValidator, twilioWhatsAppValidator } = useTwilioValidator();
  const { lineValidator, wechatValidator } = useChannelValidators();
  const history = useHistory();
  async function redirectMetaConnection(
    token: string,
    type: FacebookPhoneNumberOptionKeyType
  ) {
    const codeParam = new URLSearchParams({ code: token });
    if (type === "facebookConnect") {
      history.push({
        pathname: "/facebook/connect",
        search: codeParam.toString(),
      });
    } else if (type === "instagramConnect") {
      history.push({
        pathname: "/instagram/connect",
        search: codeParam.toString(),
      });
    } else if (type === "facebookLeadAdsConnect") {
      history.push({
        pathname: "/facebook/ads/connect",
        search: codeParam.toString(),
      });
    }
  }
  const facebookLogin = useFacebookLogin({
    updateEvent: redirectMetaConnection,
  });

  const displayBanner = () => {
    flash(
      t("flash.channels.request.submitted", {
        name: htmlEscape(channelInfo.title),
      })
    );
  };

  const submitContent = async () => {
    isLoading(true);
    if (formValues) {
      let errMsgList = Object.keys(formValues).reduce(
        (acc, fieldName) => ({ ...acc, [fieldName]: "" }),
        {}
      );

      setErrorMsg({ ...errMsgList, message: "" });
    }

    if (formValues && onConnect) {
      try {
        switch (channelName) {
          case "wechat":
            //todo
            if (fileList && fileList.length > 0) {
              const valuesValidated = await wechatValidator.validate(
                formValues as WeChatFormInputType
              );
              const formData = new FormData();
              formData.append("files", fileList[0]);

              const result = await postWithExceptions(
                POST_COMPANY_WECHAT_CONNECT,
                { param: valuesValidated }
              );
              mixpanel.track("Channel Connected", getChannelTypeObj("weChat"));
              await postWithExceptions(
                POST_WECHAT_QRCODE.replace("{connectId}", result.appId),
                {
                  param: formData,
                  header: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
              );
            } else {
              throw new ValidationError(
                t("channels.form.confirm.field.qrcode.error.required"),
                null,
                "qrCode"
              );
            }
            break;

          case "facebook":
          case "instagram":
            const facebookValue = formValues as FacebookFormInputType;
            await Promise.all(
              facebookValue.pageTokens.map((formValue) => {
                postWithExceptions(facebookAPIMapping[channelName].subscribe, {
                  param: {
                    ...formValue,
                    business_integration_system_user_access_token:
                      facebookValue.businessIntegrationSystemUserAccessToken,
                  },
                });
              })
            );
            if (channelName === "facebook") {
              mixpanel.track(
                "Channel Connected",
                getChannelTypeObj("facebook")
              );
            }
            break;
          case "line": {
            const valuesValidated = await lineValidator.validate(
              formValues as LineFormInputType
            );
            await postWithExceptions(POST_COMPANY_LINE_CONNECT, {
              param: valuesValidated,
            });
            mixpanel.track("Channel Connected", getChannelTypeObj("line"));
            break;
          }

          case "sms": {
            const valuesValidated = await twilioSmsValidator.validate(
              formValues as SmsFormInputType
            );
            const valuesTransformed =
              twilioSmsTransformer.cast(valuesValidated);
            await postWithExceptions(POST_COMPANY_TWILIO_SMS_CONNECT, {
              param: valuesTransformed,
            });
            mixpanel.track("Channel Connected", getChannelTypeObj("sms"));
            break;
          }

          case "twilio_whatsapp": {
            const valuesValidated = await twilioWhatsAppValidator.validate(
              formValues as TwilioWhatsappFormInputType
            );
            const valuesTransformed =
              twilioWhatsAppTransformer.cast(valuesValidated);
            await postWithExceptions(POST_COMPANY_TWILIO_WHATSAPP_CONNECT, {
              param: valuesTransformed,
            });
            break;
          }
        }
        await onConnect();
        isLoading(false);
        displayBanner();
      } catch (e) {
        isLoading(false);

        if (isValidationError(e)) {
          setErrorMsg({ [e.path]: e.message });
        } else if (isHttpError(e)) {
          setHttpError(e);
        } else {
          console.error(e);
        }
        return;
      }
    } else {
      isLoading(false);
      displayBanner();
    }
  };

  async function getFacebookRedirectInfo() {
    let result = { Url: "" };
    isLoading(true);
    try {
      // result = await get(facebookAPIMapping[channelName].connection, {
      //   param: {},
      // });
      facebookLogin.handleClick({
        type: `${channelName}Connect` as FacebookPhoneNumberOptionKeyType,
      });
    } catch (e) {
      console.error(`getFacebookRedirectInfo error ${e}`);
      isLoading(false);
    }
  }

  const isSubmitEnabled = !loading;
  const isSubmitLoading = loading;

  return (
    <>
      {["facebook", "instagram"].includes(channelName) && facebookNotStarted ? (
        <Button
          className="formButton"
          onClick={isSubmitEnabled ? getFacebookRedirectInfo : undefined}
          content={t("channels.form.confirm.button.install")}
          disabled={!isSubmitEnabled}
          loading={isSubmitLoading}
          fluid
        />
      ) : (
        <Button
          className="formButton primary"
          onClick={isSubmitEnabled ? submitContent : undefined}
          content={
            facebookResponded
              ? t("channels.form.confirm.button.done")
              : t("channels.form.confirm.button.install")
          }
          disabled={!isSubmitEnabled}
          loading={isSubmitLoading}
          fluid
        />
      )}
      {httpError && <Error error={httpError} />}
    </>
  );
}

export function Error(props: { error: AxiosError<any> }) {
  let { response } = props.error;
  let showMessage: string | undefined;
  if (response?.data?.message && !response?.data.code) {
    showMessage = response.data.message;
  }
  const { t } = useTranslation();

  switch (response?.status) {
    case 400:
      showMessage = showMessage ?? t("system.error.http.400");
      break;
    case 500:
      showMessage = showMessage ?? t("system.error.http.500");
      break;
  }

  return <div className="error">{showMessage}</div>;
}
