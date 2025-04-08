import { AutomationTypeEnum } from "../../../types/AssignmentRuleType";
import React from "react";
import { Button } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import EmptyContent from "../../EmptyContent";
import { NavLink } from "react-router-dom";
import useRouteConfig from "../../../config/useRouteConfig";

export function EmptyListSplash(props: {
  type: AutomationTypeEnum;
  defaultRuleId?: string;
}) {
  const { type } = props;
  const { t } = useTranslation();
  const contentMap: Record<string, { header: string; points: string[] }> = {
    FieldValueChanged: {
      header: t("automation.splash.empty.FieldValueChanged.header"),
      points: [
        t("automation.splash.empty.FieldValueChanged.point.notify"),
        t("automation.splash.empty.FieldValueChanged.point.segment"),
        t("automation.splash.empty.FieldValueChanged.point.actions"),
      ],
    },
    RecurringJob: {
      header: t("automation.splash.empty.RecurringJob.header"),
      points: [
        t("automation.splash.empty.RecurringJob.point.schedule"),
        t("automation.splash.empty.RecurringJob.point.remind"),
      ],
    },
    ContactAdded: {
      header: t("automation.splash.empty.ContactAdded.header"),
      points: [
        t("automation.splash.empty.ContactAdded.point.notify"),
        t("automation.splash.empty.ContactAdded.point.segment"),
        t("automation.splash.empty.ContactAdded.point.actions"),
      ],
    },
    MessageReceived: {
      header: t("automation.splash.empty.MessageReceived.header"),
      points: [
        t("automation.splash.empty.MessageReceived.point.assign"),
        t("automation.splash.empty.MessageReceived.point.segment"),
        t("automation.splash.empty.MessageReceived.point.bot"),
      ],
    },
  };

  const content = contentMap[type];
  if (!content) {
    return null;
  }

  return React.createElement(Splash, {
    type,
    points: content.points,
    header: content.header,
    defaultRuleId: props.defaultRuleId,
  });
}

function Splash(props: {
  header: string;
  points: string[];
  type: AutomationTypeEnum;
  defaultRuleId?: string;
}) {
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const editDefaultContent = React.createElement(
    Button,
    {
      className: "button-link",
      as: "span",
    },
    <>
      {t("automation.splash.empty.action.editDefault")}{" "}
      <i className={"ui icon arrow-right-action"} />
    </>
  );

  return (
    <EmptyContent
      header={props.header}
      content={
        <ul className={"checklist"}>
          {props.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      }
      actionContent={
        <>
          <NavLink
            to={{
              pathname: routeTo("/automations/create"),
              state: {
                selectedTriggerType: props.type,
                backToType: props.type,
              },
            }}
            children={
              <Button
                primary
                content={t("automation.splash.empty.action.create")}
              />
            }
          />
          {props.defaultRuleId && (
            <NavLink
              className={"button-link-wrap"}
              to={routeTo(`/automations/edit/${props.defaultRuleId}`)}
              children={editDefaultContent}
            />
          )}
        </>
      }
    />
  );
}
