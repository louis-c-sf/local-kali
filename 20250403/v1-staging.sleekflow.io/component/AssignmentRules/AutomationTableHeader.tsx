import { AssignmentRuleType } from "../../types/AssignmentRuleType";
import { useTranslation } from "react-i18next";
import { Checkbox, Image, Table } from "semantic-ui-react";
import React from "react";
import { SelectTriggerType } from "./AutomationTable";
import InfoIcon from "../../assets/images/info_gray.svg";
import { InfoTooltipClick } from "../shared/popup/InfoTooltipClick";
import { IsContinueTooltipContent } from "./AutomationTable/IsContinueTooltipContent";

export function AutomationTableHeader(props: {
  assignmentRules?: AssignmentRuleType[];
  strings: string[];
  loading: boolean;
  selectAll: () => void;
  triggerType?: SelectTriggerType;
}) {
  const { t } = useTranslation();
  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell className={"checkbox"}>
          <div className="checkbox-wrap">
            <Checkbox
              label=""
              checked={
                props.assignmentRules &&
                props.strings.length > 0 &&
                props.strings.length === props.assignmentRules.length
              }
              disabled={props.loading}
              onClick={!props.loading ? props.selectAll : undefined}
            />
          </div>
        </Table.HeaderCell>
        <Table.HeaderCell className={"status-cell"}>
          {t("automation.grid.header.col.status")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"rule-name"}>
          {t("automation.grid.header.col.name")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"rule-isContinue"}>
          <div>
            {t("automation.grid.header.col.isContinue")}
            <InfoTooltipClick
              placement={"bottom"}
              trigger={<Image src={InfoIcon} size={"mini"} />}
            >
              {(setOpened) => (
                <IsContinueTooltipContent close={() => setOpened(false)} />
              )}
            </InfoTooltipClick>
          </div>
        </Table.HeaderCell>
        <Table.HeaderCell className={"trigger-counter"}>
          {t("automation.grid.header.col.success")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"trigger-counter"}>
          {t("automation.grid.header.col.errored")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"rule-predicate"}>
          {t("automation.grid.header.col.conditions")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"rule-strategy"}>
          {t("automation.grid.header.col.actions")}
        </Table.HeaderCell>
        {props.triggerType === "RecurringJob" && (
          <Table.HeaderCell className={"rule-schedule"}>
            {t("automation.grid.header.col.schedule")}
          </Table.HeaderCell>
        )}
        <Table.HeaderCell className={"last-updated"}>
          {t("automation.grid.header.col.updatedAt")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}
