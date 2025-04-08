import React from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./CompleteOfficialVerification.module.css";
import iconStyles from "../../shared/Icon/Icon.module.css";
import { Button } from "../../shared/Button/Button";
import {
  WhatsappAccessLabel,
  WhatsappAccessLevel,
} from "../WhatsappAccessLabel";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import { QRCodeStart } from "./QRCodeStart";
import {
  TierType,
  VerticalStepper,
} from "../../shared/content/VerticalStepper/VerticalStepper";
import { iconFactory } from "../../Chat/hooks/useCompanyChannels";
import { prop } from "ramda";
import { AccessLevelTicks } from "./AccessLevelTicks";

const FACEBOOK_DOC_URL =
  "https://docs.sleekflow.io/messaging-channels/360dialog-whatsapp/facebook-business-verification";
const WHATSAPP_DOC_URL =
  "https://faq.whatsapp.com/general/account-and-profile/about-creating-a-business-name/?lang=en";

export default function CompleteOfficialVerificationView(props: {
  accessLevel: WhatsappAccessLevel;
  primaryAction: () => void;
  primaryActionName: string;
  reviewMode: boolean;
  phone?: string;
  channelName?: string;
  channelId?: number;
}) {
  const {
    accessLevel,
    primaryAction,
    primaryActionName,
    reviewMode,
    phone,
    channelName,
    channelId,
  } = props;
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();

  const showFacebookStep =
    reviewMode ||
    [WhatsappAccessLevel.ExpandedTrial, WhatsappAccessLevel.Standard].includes(
      accessLevel
    );

  const showWhatsappStep =
    reviewMode ||
    [WhatsappAccessLevel.LimitedAccess, WhatsappAccessLevel.Standard].includes(
      accessLevel
    );

  const tiers: Array<{ tier: TierType; visible: boolean }> = [
    {
      visible: showFacebookStep,
      tier: {
        active: false,
        header: {
          text: t("form.createWhatsapp.complete.step.facebook.header"),
          icon: <img src={iconFactory("facebook")} alt="" />,
        },
        body: (
          <>
            <p>{t("form.createWhatsapp.complete.step.facebook.description")}</p>
            <p>
              <Trans
                i18nKey={
                  "form.createWhatsapp.complete.step.facebook.checkGuide"
                }
              >
                Not sure about your status? Check our step-by-step guide
                <a
                  href={FACEBOOK_DOC_URL}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  here
                </a>
                .
              </Trans>
            </p>
          </>
        ),
      },
    },
    {
      visible: showWhatsappStep,
      tier: {
        active: false,
        header: {
          icon: <img src={iconFactory("whatsapp")} alt="" />,
          text: t("form.createWhatsapp.complete.step.whatsapp.header"),
        },
        body: (
          <Trans
            i18nKey={"form.createWhatsapp.complete.step.whatsapp.description"}
          >
            <p>
              To get approval for the Display Name, check the guide
              <a
                href={WHATSAPP_DOC_URL}
                target={"_blank"}
                rel={"noopener noreferrer"}
              >
                here
              </a>
              to better understand how to avoid formatting errors.
            </p>

            <p>
              WhatsApp will also review your WhatsApp Account to make sure it is
              compliant with the
              <a
                href={"https://www.whatsapp.com/legal/commerce-policy"}
                target={"_blank"}
                rel={"noopener noreferrer"}
              >
                Whatsapp Commerce Policy
              </a>
              .
            </p>
          </Trans>
        ),
      },
    },
    {
      visible: true,
      tier: {
        active: true,
        header: {
          text: t("form.createWhatsapp.complete.step.try.header"),
        },
        body: (
          <>
            <p>{t("form.createWhatsapp.complete.step.try.description")}</p>
            <div className={styles.actionWrap}>
              <AccessLevelTicks accessLevel={accessLevel} />
              <div className={styles.secondaryActions}>
                <Button
                  onClick={() => history.push(routeTo("/settings/templates"))}
                >
                  {t("form.createWhatsapp.complete.action.createTemplate")}
                </Button>
              </div>
            </div>
          </>
        ),
      },
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.cheers} />
          <div className={styles.header}>
            {t("form.createWhatsapp.complete.header.cheers")}
          </div>
          <div className={styles.accessLevel}>
            {t("form.createWhatsapp.complete.accessLevel")}
            <span className={styles.label}>
              <WhatsappAccessLabel level={accessLevel} />
            </span>
          </div>
          <div className={styles.headerSingle}>
            {t("form.createWhatsapp.complete.header.whatNext")}
          </div>
        </div>

        <VerticalStepper
          checkType={"fill"}
          tiers={tiers.filter(prop("visible")).map(prop("tier"))}
        />
        <div className={styles.actions}>
          {reviewMode ? (
            <Button
              onClick={primaryAction}
              fluid
              primary
              customSize={"mid"}
              centerText
            >
              {primaryActionName}
            </Button>
          ) : (
            phone &&
            channelName &&
            channelId && (
              <QRCodeStart
                channelName={channelName}
                phone={phone}
                channelId={channelId}
                trigger={
                  <Button fluid primary customSize={"mid"} centerText>
                    {primaryActionName}
                  </Button>
                }
              />
            )
          )}
        </div>
        {reviewMode && (
          <div className={styles.footer}>
            <a
              href={"https://www.360dialog.com/"}
              className={styles.footerLink}
              target={"_blank"}
              rel={"noopener noreferrer"}
            >
              {t("form.createWhatsapp.complete.action.check360Dialog")}
              <span className={`${iconStyles.icon} ${styles.extLink}`} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
