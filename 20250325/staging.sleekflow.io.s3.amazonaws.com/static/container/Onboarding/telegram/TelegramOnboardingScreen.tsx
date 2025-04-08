import React, { useState } from "react";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import flowStyles from "../../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import styles from "../360Dialog/Activate360DialogHelp.module.css";
import { PostLogin } from "../../../component/Header";
import BannerMessage from "../../../component/BannerMessage/BannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { WhatsappFlowHeader } from "../../../component/CreateWhatsappFlow/WhatsappFlowHeader";
import { BackLink } from "../../../component/shared/nav/BackLink";
import { Button } from "../../../component/shared/Button/Button";
import InfoTip from "../../../component/shared/infoTip/InfoTip";
import Helmet from "react-helmet";
import { useFormik } from "formik";
import { object, string } from "yup";
import { FieldError } from "../../../component/shared/form/FieldError";
import { TelegramConfigType } from "../../../types/CompanyType";
import { TelegramQrCodeActivated } from "./TelegramQrCodeActivated";
import { submitCreateTelegramChannel } from "../../../api/Channel/submitCreateTelegramChannel";
import { fetchCompany } from "../../../api/Company/fetchCompany";
import { useAppDispatch } from "../../../AppRootContext";
import { getChannelTypeObj } from "component/shared/useAnalytics";
import mixpanel from "mixpanel-browser";

function TelegramOnboardingScreen() {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const [hasApiError, setHasApiError] = useState(false);
  const [pending, setPending] = useState(false);
  const [channelCreated, setChannelCreated] = useState<TelegramConfigType>();

  const { values, errors, setFieldValue, submitForm } = useFormik({
    onSubmit: async (values, formikHelpers) => {
      setHasApiError(false);
      setPending(true);
      try {
        const result = await submitCreateTelegramChannel(
          values.channelName,
          values.token
        );
        mixpanel.track("Channel Connected", getChannelTypeObj("telegram"));
        formikHelpers.resetForm({ values });
        setChannelCreated(result);
        try {
          const companyUpdated = await fetchCompany();
          loginDispatch({
            type: "UPDATE_COMPANY_INFO",
            company: companyUpdated,
          });
        } catch (e) {
          console.error(e);
        }
      } catch (e) {
        console.error(e);
        setHasApiError(true);
      } finally {
        setPending(false);
      }
    },
    validationSchema: object({
      channelName: string().required(),
      token: string().required(),
    }),
    initialValues: {
      channelName: "",
      token: "",
    },
    validateOnChange: true,
  });

  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} />
      <div className="main content create-whatsapp-form">
        <Helmet title={t("onboarding.telegram.connect.pageTitle")} />
        <div className={flowStyles.container}>
          <div className={`create-form`}>
            <div className={flowStyles.wrapper}>
              <div className={styles.nav}>
                <BackLink onClick={() => history.push(routeTo("/channels"))} />
              </div>
              <div className={flowStyles.contentContainer}>
                <WhatsappFlowHeader
                  icon={"telegram"}
                  header={t("onboarding.telegram.connect.form.header")}
                  subheader={t("onboarding.telegram.connect.form.subheader")}
                />
                <Trans i18nKey="onboarding.telegram.connect.form.body1">
                  <div className={styles.textHeader}>
                    To use Telegram on SleekFlow
                  </div>
                  <div className={styles.text}>
                    Log in to your Telegram account and submit certain
                    information below to complete the set up.
                  </div>
                  <div className={styles.text}>
                    <InfoTip noHorizontalOutset>
                      <div>
                        To connect Telegram, a <b>Telegram Bot</b> is required.
                      </div>
                    </InfoTip>
                  </div>
                  <div className={styles.textHeader}>
                    Do not have a Telegram Account?
                  </div>
                  <div className={styles.text}>
                    Please register an account on{" "}
                    <a
                      href={"https://telegram.org/apps"}
                      rel={"noreferrer noopener"}
                      target={"_blank"}
                    >
                      Telegram
                    </a>
                    and create a Telegram Bot.
                  </div>
                </Trans>
                <div className={styles.inset}>
                  <Trans i18nKey="onboarding.form.checkGuide">
                    <div className={styles.insetHeader}>
                      Not sure about the set up process?
                    </div>
                    <div className={styles.insetText}>
                      We’ve got your back! Follow the steps from our guide to
                      help you easy connect.
                    </div>
                    <div className={styles.insetActions}>
                      <Button
                        onClick={() =>
                          window.open(
                            "https://docs.sleekflow.io/messaging-channels/telegram",
                            "_blank"
                          )
                        }
                        customSize={"sm"}
                      >
                        Check Step-by-Step Guide
                      </Button>
                    </div>
                  </Trans>
                </div>
                <div className={styles.form}>
                  <div className={`ui form`}>
                    <div className="ui field">
                      <Trans i18nKey="onboarding.telegram.connect.form.field.channelName.label">
                        <label>Channel Name</label>
                        <div className={styles.hint}>
                          Make sure it's easily recognizable for yourself and
                          your team. This name will only be used internally.
                        </div>
                      </Trans>
                      <input
                        type="text"
                        value={values.channelName}
                        onChange={(event) => {
                          setFieldValue("channelName", event.target.value);
                        }}
                        placeholder={t(
                          "onboarding.telegram.connect.form.field.channelName.placeholder"
                        )}
                      />
                      <FieldError text={errors.channelName} />
                    </div>
                    <div className="ui field">
                      <Trans i18nKey="onboarding.telegram.connect.form.field.token.label">
                        <label>Bot Token</label>
                        <div className={styles.hint}>
                          Search{" "}
                          <a
                            href="https://t.me/botfather"
                            target={"_blank"}
                            rel={"noreferrer noopener"}
                          >
                            @BotFather
                          </a>{" "}
                          and message this bot account. You will receive your
                          Bot Token by Pressing Start
                          {" > "}
                          Send the command <code>/newbot</code>
                          {" > "}
                          Enter Display Name {">"} Enter Username
                        </div>
                      </Trans>
                      <input
                        type="text"
                        value={values.token}
                        onChange={(event) => {
                          setFieldValue("token", event.target.value);
                        }}
                        placeholder={t(
                          "onboarding.telegram.connect.form.field.token.placeholder"
                        )}
                      />
                      <FieldError text={errors.token} />
                    </div>
                  </div>
                </div>
                <div className={flowStyles.footerActions}>
                  <Button
                    primary
                    fluid
                    centerText
                    customSize={"mid"}
                    disabled={pending}
                    onClick={submitForm}
                  >
                    {t("form.button.install")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {channelCreated && <TelegramQrCodeActivated channel={channelCreated} />}
        <BannerMessage />
      </div>
    </div>
  );
}

export default TelegramOnboardingScreen;
