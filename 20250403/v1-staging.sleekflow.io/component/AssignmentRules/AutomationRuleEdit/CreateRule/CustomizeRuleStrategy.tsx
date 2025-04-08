import React, { useState } from "react";
import styles from "./CustomizeRuleStrategy.module.css";
import viewStyles from "./StepView.module.css";
import iconStyles from "../../../shared/Icon/Icon.module.css";
import { StepView } from "./StepView";
import { Trans, useTranslation } from "react-i18next";
import { Menu, MenuItemProps } from "semantic-ui-react";
import { CreateRuleActionType } from "./createRuleReducer";
import { useAutomationRulesLocalized } from "../localizable/useAutomationRulesLocalized";
import { RuleTemplateType } from "../templates";
import { StepGrid } from "./StepGrid";
import { isTriggerIconName, TriggerIcon } from "./TriggerIcon";
import { TriggerGroupType } from "../../AutomationTable";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";

export function CustomizeRuleStrategy(props: {
  dispatch: (action: CreateRuleActionType) => void;
  onTemplateChosen: (t: RuleTemplateType) => void;
}) {
  const { dispatch, onTemplateChosen } = props;
  const { t } = useTranslation();
  const {
    getBaseTemplates,
    getShopifyTemplates,
    getFacebookTemplates,
    getInstagramTemplates,
  } = useAutomationRulesLocalized();
  const [triggerType, setTriggerType] = useState<TriggerGroupType>("general");
  const company = useAppSelector((s) => s.company, equals);
  const hideShopify = true;
  const hasFacebookConfig = company?.facebookConfigs ?? false;
  const hasInstagramConfig = company?.instagramConfigs ?? false;
  const menuItems: MenuItemProps[] = [
    {
      content: t("automation.create.triggerType.general"),
      onClick: () => setTriggerType("general"),
      active: triggerType === "general",
      key: "general",
    },
  ];
  if (!hideShopify) {
    menuItems.push({
      content: (
        <>
          <i className={`${iconStyles.icon} ${styles.shopify}`} />
          {t("automation.create.triggerType.shopify")}
        </>
      ),
      onClick: () => setTriggerType("shopify"),
      active: triggerType === "shopify",
      key: "shopify",
    });
  }
  if (hasFacebookConfig) {
    menuItems.push({
      content: (
        <>
          <i className={`${iconStyles.icon} ${styles.facebook}`} />
          {t("automation.create.triggerType.facebook")}
        </>
      ),
      onClick: () => setTriggerType("facebook"),
      active: triggerType === "facebook",
      key: "facebook",
    });
  }
  if (hasInstagramConfig) {
    menuItems.push({
      content: (
        <>
          <i className={`${iconStyles.icon} ${styles.instagram}`} />
          {t("automation.create.triggerType.instagram")}
        </>
      ),
      onClick: () => setTriggerType("instagram"),
      active: triggerType === "instagram",
      key: "instagram",
    });
  }

  const columnsMapping: Record<TriggerGroupType, 1 | 2 | 3> = {
    general: 2,
    shopify: 3,
    facebook: 1,
    instagram: 1,
  };

  const getTemplatesMapping: Record<
    TriggerGroupType,
    () => RuleTemplateType[]
  > = {
    general: getBaseTemplates,
    shopify: getShopifyTemplates,
    facebook: getFacebookTemplates,
    instagram: getInstagramTemplates,
  };

  const templates = getTemplatesMapping[triggerType]();

  return (
    <StepView
      header={t("automation.create.customizeRule.header")}
      subheader={
        <div>
          <Trans i18nKey={"automation.create.customizeRule.subheader"}>
            Your automation rule has to start by a defined trigger.
            <br />
            Not sure which trigger to choose? Check how automation works{" "}
            <a
              className={viewStyles.external}
              href={"https://docs.sleekflow.io/using-the-platform/automation"}
              rel={"noreferrer noopener"}
              target={"_blank"}
            >
              here
            </a>
            .
          </Trans>
        </div>
      }
      backAction={() => dispatch({ type: "RESET" })}
      alternativeActionText={t("automation.create.strategy.template.header")}
      alternativeAction={() =>
        dispatch({
          type: "CHANGE_STRATEGY",
          strategy: "template",
        })
      }
      fixedContent={
        <>
          <div className={styles.tabs}>
            <Menu pointing secondary items={menuItems} />
          </div>
        </>
      }
      scrollableContent={
        <>
          <StepGrid.Grid columns={columnsMapping[triggerType]} size={"normal"}>
            {templates.map((template) => (
              <StepGrid.Item
                onClick={() => onTemplateChosen(template)}
                key={template.name}
              >
                <StepGrid.Pictogram>
                  <div className={styles.headerIcon}>
                    {template.triggerIcon &&
                      isTriggerIconName(template.triggerIcon) && (
                        <TriggerIcon name={template.triggerIcon} />
                      )}
                    {template.triggerIcon &&
                      !isTriggerIconName(template.triggerIcon) &&
                      template.triggerIcon}
                  </div>
                </StepGrid.Pictogram>
                <StepGrid.Header>{template.name}</StepGrid.Header>
                <StepGrid.Body>{template.tooltip}</StepGrid.Body>
              </StepGrid.Item>
            ))}
          </StepGrid.Grid>
          {triggerType === "shopify" && (
            <div className={styles.warning}>
              <div className={styles.header}>
                {t("automation.create.warning.shopify.header")}
              </div>
              <div className={styles.body}>
                <Trans i18nKey={"automation.create.warning.shopify.body"}>
                  If you create conflicting rules, Shopify rules will{" "}
                  <b>always have a higher priority</b> and General rules will
                  not be triggered under such circumstance.
                </Trans>
              </div>
            </div>
          )}
        </>
      }
    />
  );
}
