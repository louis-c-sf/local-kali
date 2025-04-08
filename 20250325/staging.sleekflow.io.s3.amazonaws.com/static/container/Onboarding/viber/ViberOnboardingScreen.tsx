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
import { submitCreateViberChannel } from "../../../api/Channel/submitCreateViberChannel";
import { ViberConfigType } from "../../../types/CompanyType";
import { ViberQrCodeActivated } from "./ViberQrCodeActivated";
import { fetchCompany } from "../../../api/Company/fetchCompany";
import { useAppDispatch } from "../../../AppRootContext";
import StatusAlert from "../../../component/shared/StatusAlert";
import { TextInput } from "../form/input/TextInput";
import { getChannelTypeObj } from "component/shared/useAnalytics";
import mixpanel from "mixpanel-browser";

export const MAX_BOT_NAME_LENGTH = 28;

function ViberOnboardingScreen() {
  const { routeTo } = useRouteConfig();
  const loginDispatch = useAppDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const [hasApiError, setHasApiError] = useState(false);
  const [channelCreated, setChannelCreated] = useState<ViberConfigType>();

  const { values, errors, setFieldValue, submitForm, isSubmitting } = useFormik(
    {
      onSubmit: async (values, formikHelpers) => {
        setHasApiError(false);
        try {
          const result = await submitCreateViberChannel(
            values.channelName,
            values.token,
            values.senderName
          );
          mixpanel.track("Channel Connected", getChannelTypeObj("viber"));
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
        }
      },
      validationSchema: object({
        senderName: string().required().max(MAX_BOT_NAME_LENGTH),
        channelName: string().required(),
        token: string().required(),
      }),
      initialValues: {
        senderName: "",
        channelName: "",
        token: "",
      },
      validateOnChange: true,
    }
  );

  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} />
      <div className="main content create-whatsapp-form">
        <Helmet title={t("onboarding.viber.connect.pageTitle")} />
        <div className={flowStyles.container}>
          <div className={`create-form`}>
            <div className={flowStyles.wrapper}>
              <div className={styles.nav}>
                <BackLink onClick={() => history.push(routeTo("/channels"))} />
              </div>
              <div className={flowStyles.contentContainer}>
                <WhatsappFlowHeader
                  icon={"viber"}
                  header={t("onboarding.viber.connect.form.header")}
                  subheader={t("onboarding.viber.connect.form.subheader")}
                />
                <Trans i18nKey="onboarding.viber.connect.form.body1">
                  <div className={styles.textHeader}>
                    To use Viber on SleekFlow
                  </div>
                  <div className={styles.text}>
                    Log in to your{" "}
                    <a
                      href={"https://partners.viber.com/login"}
                      rel={"noreferrer noopener"}
                      target={"_blank"}
                    >
                      Viber Admin Panel
                    </a>{" "}
                    and submit certain information below to complete the set up.
                  </div>
                  <div className={styles.text}>
                    <InfoTip noHorizontalOutset>
                      <div>To connect Viber, a Viber Bot is required.</div>
                    </InfoTip>
                  </div>
                  <div className={styles.textHeader}>
                    Do not have a Viber Account?
                  </div>
                  <div className={styles.text}>
                    Please register an account and create a bot account on{" "}
                    <a
                      href={"https://partners.viber.com/login"}
                      rel={"noreferrer noopener"}
                      target={"_blank"}
                    >
                      {" "}
                      Viber Admin Panel
                    </a>
                    .
                  </div>
                </Trans>
                <div className={styles.inset}>
                  <Trans i18nKey="onboarding.viber.connect.form.checkGuide">
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
                            "https://docs.sleekflow.io/messaging-channels/viber",
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
                  <div className={`ui form `}>
                    <TextInput
                      value={values.channelName}
                      error={errors.channelName}
                      onChange={(value) => setFieldValue("channelName", value)}
                      label={t(
                        "onboarding.viber.connect.form.field.channelName.label"
                      )}
                      hint={t(
                        "onboarding.viber.connect.form.field.channelName.hint"
                      )}
                      placeholder={t(
                        "onboarding.viber.connect.form.field.channelName.placeholder"
                      )}
                    />

                    <TextInput
                      value={values.token}
                      error={errors.token}
                      onChange={(value) => setFieldValue("token", value)}
                      label={t(
                        "onboarding.viber.connect.form.field.token.label"
                      )}
                      hint={t("onboarding.viber.connect.form.field.token.hint")}
                      placeholder={t(
                        "onboarding.viber.connect.form.field.token.placeholder"
                      )}
                    />

                    <TextInput
                      value={values.senderName}
                      error={errors.senderName}
                      onChange={(value) => setFieldValue("senderName", value)}
                      label={t(
                        "onboarding.viber.connect.form.field.senderName.label"
                      )}
                      hint={t(
                        "onboarding.viber.connect.form.field.senderName.hint"
                      )}
                      placeholder={t(
                        "onboarding.viber.connect.form.field.senderName.placeholder"
                      )}
                    />
                  </div>
                  {hasApiError && (
                    <StatusAlert type={"warning"}>
                      {t("form.createWhatsapp.form.error.apiCheck.text")}
                    </StatusAlert>
                  )}
                </div>
                <div className={flowStyles.footerActions}>
                  <Button
                    primary
                    fluid
                    centerText
                    customSize={"mid"}
                    disabled={isSubmitting}
                    onClick={submitForm}
                  >
                    {t("form.button.install")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {channelCreated && <ViberQrCodeActivated channel={channelCreated} />}
        <BannerMessage />
      </div>
    </div>
  );
}

export default ViberOnboardingScreen;
