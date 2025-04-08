import React from "react";
import { StepView } from "./StepView";
import { useTranslation } from "react-i18next";
import { CreateRuleActionType } from "./createRuleReducer";
import { StepGrid } from "./StepGrid";
import { TriggerIcon } from "./TriggerIcon";

export function ChooseStrategy(props: {
  dispatch: (action: CreateRuleActionType) => void;
}) {
  const { dispatch } = props;
  const { t } = useTranslation();

  return (
    <StepView
      header={t("automation.create.init.header")}
      fixedContent={
        <StepGrid.Grid columns={2} size={"normal"}>
          <StepGrid.Item
            onClick={() => {
              dispatch({ type: "CHANGE_STRATEGY", strategy: "customize" });
            }}
          >
            <StepGrid.Pictogram>
              <TriggerIcon name={"customize"} />
            </StepGrid.Pictogram>
            <StepGrid.Header>
              {t("automation.create.strategy.customize.header")}
            </StepGrid.Header>
            <StepGrid.Body>
              {t("automation.create.strategy.customize.body")}
            </StepGrid.Body>
          </StepGrid.Item>

          <StepGrid.Item
            onClick={() => {
              dispatch({ type: "CHANGE_STRATEGY", strategy: "template" });
            }}
          >
            <StepGrid.Pictogram>
              <TriggerIcon name={"template"} />
            </StepGrid.Pictogram>
            <StepGrid.Header>
              {t("automation.create.strategy.template.header")}
            </StepGrid.Header>
            <StepGrid.Body>
              {t("automation.create.strategy.template.body")}
            </StepGrid.Body>
          </StepGrid.Item>
        </StepGrid.Grid>
      }
    />
  );
}
