import React from "react";
import { Checkbox, Table } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import useBroadcastFieldLocalized from "../../config/localizable/useBroadcastFieldLocalized";

export function BroadcastTableHeader(props: {
  selectAll: (event: React.MouseEvent, data: object) => any | undefined;
  hasResults: boolean;
  selectAllCheckbox: boolean;
  showFields: string[];
}) {
  const { t } = useTranslation();
  const { broadcastFieldList } = useBroadcastFieldLocalized();
  const tooltipMap = {
    sent: t("broadcast.tooltip.field.sent"),
    delivered: t("broadcast.tooltip.field.delivered"),
    read: t("broadcast.tooltip.field.read"),
    reply: t("broadcast.tooltip.field.reply"),
  };
  return (
    <Table.Header>
      <Table.Row>
        {props.showFields.map((fieldName) => {
          const tooltipText = tooltipMap[fieldName];
          const fieldHeader = (
            <div className="field-header">
              {broadcastFieldList[fieldName] ?? ""}
            </div>
          );

          return (
            <Table.HeaderCell
              key={`field${fieldName}`}
              className={`${fieldName === "id" ? "checkbox" : ""}`}
            >
              {fieldName === "id" ? (
                <div className="checkbox-wrap">
                  <Checkbox
                    checked={props.selectAllCheckbox}
                    disabled={!props.hasResults}
                    label=""
                    onClick={props.hasResults ? props.selectAll : undefined}
                  />
                </div>
              ) : tooltipText ? (
                <InfoTooltip
                  trigger={fieldHeader}
                  placement={"top"}
                  children={tooltipText}
                />
              ) : (
                fieldHeader
              )}
            </Table.HeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
}
