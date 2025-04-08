import React from "react";
import { WhatsappAccessLevel } from "../WhatsappAccessLabel";
import { Trans, useTranslation } from "react-i18next";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import iconStyles from "../../shared/Icon/Icon.module.css";
import styles from "./CompleteOfficialVerification.module.css";
import { TickedList } from "../../shared/content/TickedList";

export function AccessLevelTicks(props: { accessLevel: WhatsappAccessLevel }) {
  const { t } = useTranslation();
  const { accessLevel } = props;
  const dayWindowInfo = (
    <InfoTooltip
      trigger={<i className={`${iconStyles.icon} ${styles.info}`} />}
      placement={"right"}
      hoverable={true}
    ></InfoTooltip>
  );

  if (accessLevel === WhatsappAccessLevel.Standard) {
    return (
      <TickedList
        items={[
          <Trans i18nKey={"form.createWhatsapp.complete.ticks.standard0"}>
            More than 2 phone numbers
          </Trans>,
          <Trans
            i18nKey={"form.createWhatsapp.complete.ticks.standard1"}
            defaults={
              "Higher template messaging limits (1K, 10K, 100K unique customers/day) <info>{{text}}</info>"
            }
            components={{ info: dayWindowInfo }}
            values={{ text: t("form.createWhatsapp.complete.tooltip.message") }}
          />,
          <Trans i18nKey={"form.createWhatsapp.complete.ticks.standard2"}>
            An
            <a
              href={
                "https://developers.facebook.com/docs/whatsapp/guides/display-name#types"
              }
              target={"_blank"}
              rel={"noopener noreferrer"}
            >
              Official Business Account (OBA)
            </a>
            &nbsp;— Any business that requires an OBA must complete Business
            Verification.
          </Trans>,
        ]}
      />
    );
  }

  if (accessLevel === WhatsappAccessLevel.BasicTrial) {
    return (
      <TickedList
        items={[
          <Trans i18nKey={"form.createWhatsapp.complete.ticks.basicTrial0"}>
            Use Templates to reach out to two unique customers, and send up to
            ten messages every day.
          </Trans>,
          <Trans
            i18nKey={"form.createWhatsapp.complete.ticks.basicTrial1"}
            defaults={
              "Reply to up to 10 phone numbers a day within 24-hour window <info>{{text}}</info>"
            }
            components={{ info: dayWindowInfo }}
            values={{ text: t("form.createWhatsapp.complete.tooltip.message") }}
          />,
        ]}
      />
    );
  }

  if (accessLevel === WhatsappAccessLevel.ExpandedTrial) {
    return (
      <TickedList
        items={[
          <Trans i18nKey={"form.createWhatsapp.complete.ticks.expandedTrial0"}>
            Notifications: Can be sent to 2 phone numbers, up to 10 messages a
            day. Notifications can only be sent with
            <a href={"https://www.facebook.com/business/help/722393685250070"}>
              pre-approved message templates
            </a>
            .
          </Trans>,
          <Trans
            i18nKey={"form.createWhatsapp.complete.ticks.expandedTrial1"}
            components={{ info: dayWindowInfo }}
            values={{ text: t("form.createWhatsapp.complete.tooltip.message") }}
          >
            Higher template messaging limits (1K, 10K, 100K unique
            customers/day)
          </Trans>,
        ]}
      />
    );
  }

  if (accessLevel === WhatsappAccessLevel.LimitedAccess) {
    return (
      <TickedList
        items={[
          <Trans
            i18nKey={"form.createWhatsapp.complete.ticks.limitedAccess0"}
            components={{ info: dayWindowInfo }}
            values={{ text: t("form.createWhatsapp.complete.tooltip.message") }}
          >
            Unlimited customer-initiated conversations (24-hour messaging
            windows).
          </Trans>,
          <Trans i18nKey={"form.createWhatsapp.complete.ticks.limitedAccess1"}>
            Ability to send notifications to 50 unique customers in a rolling
            24-hour period
          </Trans>,
          <Trans i18nKey={"form.createWhatsapp.complete.ticks.limitedAccess2"}>
            Ability to register up to two (2) phone numbers, which can both be
            assigned to 1 WABA or split between 2 WABAs
          </Trans>,
        ]}
      />
    );
  }
  return null;
}
