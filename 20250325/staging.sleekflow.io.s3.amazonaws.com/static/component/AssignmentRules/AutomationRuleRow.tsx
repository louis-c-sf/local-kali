import {
  Checkbox,
  Dropdown,
  Icon,
  Label,
  Loader,
  Table,
} from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import moment from "moment";
import React, { useState } from "react";
import {
  AssignmentRuleType,
  AutomationConditionType,
  flattenCondition,
} from "../../types/AssignmentRuleType";
import { PostCommentAutomation } from "./AutomationRuleEdit/CreateRule/FbIg/PostCommentTypes";
import { TableContextMenu } from "../shared/grid/TableContextMenu";
import { isDefaultAssignmentRule } from "./filters";
import { useConditionNameLocale } from "../Contact/locaizable/useConditionNameLocale";
import { useTranslation } from "react-i18next";
import { useAutomationRulesLocalized } from "./AutomationRuleEdit/localizable/useAutomationRulesLocalized";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import useRouteConfig from "../../config/useRouteConfig";
import { ToggleInput } from "../shared/input/ToggleInput";
import { SelectTriggerType } from "./AutomationTable";
import { useAppDispatch } from "../../AppRootContext";
import { IsContinueIcon } from "./AutomationTable/IsContinueIcon";
import { useCurrentUtcOffset } from "../Chat/hooks/useCurrentUtcOffset";

export function AutomationRuleRow(props: {
  isDefaultRule: boolean;
  triggerType?: SelectTriggerType;
  selectHandler: (e: React.MouseEvent) => void;
  isSelected: boolean;
  innerDraggableRef?: any;
  draggableProps?: any;
  dragHandleProps?: any;
  rule: AssignmentRuleType;
  onDuplicate?: (rule: AssignmentRuleType) => void;
  onStatusToggle?: (id: string, published: boolean) => void;
}) {
  const {
    rule,
    isSelected,
    selectHandler,
    isDefaultRule,
    onDuplicate,
    onStatusToggle,
    triggerType,
  } = props;
  const { updatedAt, ruleName, isContinue } = rule;
  const utcOffset = useCurrentUtcOffset();
  const [processing, setProcessing] = useState(false);
  const { conditionNameDisplayMap } = useConditionNameLocale();
  const { scheduleIntervalDict } = useAutomationRulesLocalized();
  const { routeTo } = useRouteConfig();
  const [hovered, setHovered] = useState(false);
  let predicates: Array<[string, string, string[]]> = [];
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();

  if (rule.conditions) {
    predicates = rule.conditions
      .filter(Boolean)
      .map(flattenCondition)
      .flat(2)
      .map((cond: AutomationConditionType) => {
        let fieldName = "";
        let values: string[] = [];

        if (cond.fieldName) {
          fieldName = cond.fieldName;
          values = cond.values || [];
        } else if (cond.containHashTag) {
          fieldName = t("profile.field.hashtag.label_plural");
          values = cond.values;
        }

        return [
          fieldName,
          cond.conditionOperator
            ? conditionNameDisplayMap[cond.conditionOperator] ??
              cond.conditionOperator
            : t("profile.field.hashtag.label"),
          values,
        ];
      });
  }

  const { dragHandleProps, innerDraggableRef } = props;

  const isRuleEnabled = rule.status === "Live";
  const allowViewRuleHistory = PostCommentAutomation.includes(
    rule.automationType
  )
    ? rule.triggeredCounter > 0 &&
      rule.automationActions.find((action) =>
        ["FacebookInitiateDm", "InstagramInitiateDm"].includes(
          action.automatedTriggerType
        )
      ) !== undefined
    : rule.triggeredCounter > 0;

  return (
    <tr
      onClick={!isDefaultRule ? selectHandler : undefined}
      ref={innerDraggableRef}
      className={`${isDefaultRule ? "last-rule" : ""} ${
        hovered ? "hovered" : ""
      } `}
      {...props.draggableProps}
    >
      <Table.Cell className={"checkbox"}>
        <div className="checkbox-wrap">
          {dragHandleProps && !processing ? (
            <InfoTooltip
              placement={"right"}
              children={t("automation.tooltip.grid.drag")}
              trigger={
                <div className={"drag-handle"} {...dragHandleProps}>
                  <Icon className={"button-dots"} />
                </div>
              }
            />
          ) : (
            <div className={"drag-handle disabled"}>
              <Icon className={"button-dots"} />
            </div>
          )}
          {!isDefaultRule && !processing ? (
            <Checkbox checked={isSelected} onClick={selectHandler} />
          ) : (
            <Checkbox disabled className={"invisible"} />
          )}
          {processing && <Loader active size={"small"} />}
        </div>
      </Table.Cell>
      <Table.Cell className={"status-cell"}>
        {onStatusToggle ? (
          <InfoTooltip
            placement={"right"}
            children={t("automation.tooltip.grid.status")}
            trigger={
              <ToggleInput
                on={isRuleEnabled}
                labelOn={t("automation.rule.status.live")}
                labelOff={t("automation.rule.status.draft")}
                onChange={(checked) => {
                  onStatusToggle(rule.id!, checked);
                }}
              />
            }
          />
        ) : (
          <div className={`rule-status rule-status_live`}>
            {t("automation.rule.default.short")}
          </div>
        )}
      </Table.Cell>
      <Table.Cell className="rule-name">
        <div className={"wrap"}>
          <NavLink
            to={{
              pathname: routeTo(`/automations/edit/${rule.id}`),
              state: {
                selectedTriggerType: triggerType,
              },
            }}
            className={"name"}
          >
            {isDefaultAssignmentRule(rule) ? (
              <>
                <Icon name={"lock"} />
                {t("automation.rule.default.name")}
              </>
            ) : (
              ruleName?.trim() || t("automation.rule.name.missing")
            )}
          </NavLink>
          {allowViewRuleHistory && (
            <div
              className="ui button view-rule"
              onClick={() => {
                const { id, ruleName, automationType, status, isDefault } =
                  rule;
                loginDispatch({
                  type: "AUTOMATION_RULE_SELECTED",
                  selectedAutomationRule: {
                    id,
                    ruleName,
                    automationType,
                    status,
                    isDefault,
                  },
                });
              }}
            >
              <NavLink to={routeTo(`/automations/history/${rule.id}`)}>
                {t("automation.buttons.viewRuleHistory")}
              </NavLink>
            </div>
          )}
          <TableContextMenu>
            {(close) => (
              <>
                <Dropdown.Item>
                  <NavLink
                    to={{
                      pathname: routeTo(`/automations/edit/${rule.id}`),
                      state: {
                        selectedTriggerType: triggerType,
                      },
                    }}
                  >
                    {t("form.button.edit")}
                  </NavLink>
                </Dropdown.Item>
                {onDuplicate && (
                  <InfoTooltip
                    placement={"left"}
                    children={t("automation.tooltip.duplicate")}
                    trigger={
                      <Dropdown.Item
                        onClick={async (event) => {
                          event.stopPropagation();
                          setProcessing(true);
                          close();
                          await onDuplicate(rule);
                          setProcessing(false);
                        }}
                      >
                        {t("automation.buttons.duplicate")}
                      </Dropdown.Item>
                    }
                  />
                )}
              </>
            )}
          </TableContextMenu>
        </div>
      </Table.Cell>
      <Table.Cell className={"rule-isContinue"}>
        <IsContinueIcon
          isContinue={isDefaultAssignmentRule(rule) ? true : isContinue}
        />
      </Table.Cell>
      <Table.Cell className="trigger-counter">
        <div className="wrap">
          <Label>{rule.triggeredSuccessCounter}</Label>
        </div>
      </Table.Cell>
      <Table.Cell className="trigger-counter">
        <div className="wrap">
          <Label>{rule.triggeredFailedCounter}</Label>
        </div>
      </Table.Cell>
      <Table.Cell className={"rule-predicate"}>
        <div className="wrap">
          {predicates.length === 0 ? "-" : <Label>{predicates.length}</Label>}
        </div>
      </Table.Cell>
      <Table.Cell className="rule-strategy">
        <div className="wrap">
          {rule.automationActions.length > 0 && (
            <Label>{rule.automationActions.length}</Label>
          )}
        </div>
      </Table.Cell>
      {triggerType === "RecurringJob" && (
        <Table.Cell className="rule-schedule">
          {rule.schedule ? scheduleIntervalDict[rule.schedule.type] : "-"}
        </Table.Cell>
      )}
      <Table.Cell className={"last-updated"}>
        {moment(updatedAt).utcOffset(utcOffset).format("LLL")}
      </Table.Cell>
    </tr>
  );
}
