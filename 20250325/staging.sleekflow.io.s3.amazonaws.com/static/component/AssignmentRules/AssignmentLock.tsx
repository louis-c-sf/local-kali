import React from "react";
import { Button, ButtonProps, Header, Image } from "semantic-ui-react";
import AutomationImg from "../../assets/images/automation.svg";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../config/useRouteConfig";

const AssignmentLock = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const clickToUpgrade = (e: React.MouseEvent, data: ButtonProps) => {
    history.push(routeTo("/settings/plansubscription"));
  };
  return (
    <div className="assignment-lock">
      <Header>{t("automation.grid.locked.header")}</Header>
      <div className="container">
        <Header>{t("automation.grid.locked.subheader")}</Header>
        <div className="sub-header">{t("automation.grid.locked.text")}</div>
        <div className="img">
          <Image src={AutomationImg} />
        </div>
        <div className="action-btn">
          <Button
            primary
            onClick={clickToUpgrade}
            content={t("automation.buttons.upgradePlan")}
          />
        </div>
        <div className="link">
          <a
            className="link"
            target="_blank"
            href="https://calendly.com/sleekflow/demo"
          >
            {t("automation.grid.actions.book")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AssignmentLock;
