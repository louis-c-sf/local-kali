import React, { useEffect, useState } from "react";
import { Image, Modal } from "semantic-ui-react";
import UpgradeImg from "../../assets/images/upgrade.svg";
import { CloseButton } from "../shared/CloseButton";
import { isFreemiumPlan } from "../../types/PlanSelectionType";
import { useHistory } from "react-router";
import { useFeaturesGuard } from "../Settings/hooks/useFeaturesGuard";
import { Trans, useTranslation } from "react-i18next";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppSelector } from "../../AppRootContext";

export default function ContactExceedPortal() {
  const [usage, company, currentPlan] = useAppSelector((s) => [
    s.usage,
    s.company,
    s.currentPlan,
  ]);
  const [messageMode, setMessageMode] = useState("free");
  const history = useHistory();
  const featureGuard = useFeaturesGuard();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const messages = {
    free: {
      buttonText: t("account.trial.start.button"),
      contentText: (
        <Trans i18nKey="account.contactExceed.trial.content">
          You can upgrade to either our Pro or Premium Plan to continue
          <br />
          using SleekFlow. We offer a 3-day free trial so you can <br />
          experience our complete range of functions.
        </Trans>
      ),
    },
    planExpired: {
      buttonText: t("account.upgrade.button"),
      contentText: (
        <Trans i18nKey="account.contactExceed.upgrade.content">
          You can upgrade your plan to continue using SleekFlow which <br />
          provide you with more contacts and campaign message limits.
        </Trans>
      ),
    },
  };
  useEffect(() => {
    if (company?.id) {
      if (featureGuard.hasUserPaidBills()) {
        setMessageMode("planExpired");
      } else if (isFreemiumPlan(currentPlan)) {
        setMessageMode("free");
      }
    }
  }, [
    company?.id,
    JSON.stringify(company?.billRecords),
    currentPlan.id,
    usage.totalContacts,
    usage.maximumAutomatedMessages,
  ]);

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (company?.id) {
      setOpen(usage.totalContacts >= usage.maximumContacts);
    }
  }, [usage.totalContacts, usage.maximumContacts, company]);
  const onClick = () => {
    history.push(routeTo("/settings/plansubscription"));
  };
  return (
    <Modal open={open} className="contact-exceed-modal">
      <Modal.Content className="_content">
        <CloseButton onClick={() => setOpen(false)} />
        <div className="container">
          <div className="header">
            <Trans i18nKey="account.contactExceed.header">
              You have exceeded your
              <br />
              plan’s limits for contacts
            </Trans>
          </div>
          <Image src={UpgradeImg} />
          <div className="content">{messages[messageMode].contentText}</div>
          <div className="ui button primary" onClick={onClick}>
            {messages[messageMode].buttonText}
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}
