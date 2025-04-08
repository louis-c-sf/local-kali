import {
  LanguagesMapping,
  WhatsappTemplateNormalizedType,
} from "../../../../../types/WhatsappTemplateResponseType";
import React from "react";
import { WhatsappTemplateAction } from "../../../../../container/Settings/OfficialWhatsApp/whatsappTemplateReducer";
import { TFunction } from "i18next";
import useRouteConfig from "../../../../../config/useRouteConfig";
import { uniq } from "ramda";
import { Checkbox, Loader, Table } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { getButtonName } from "../SettingTemplate";
import Star from "../../../../../assets/tsx/icons/Star";
import styles from "./TemplateRow.module.css";
import { ButtonType } from "../../../../../features/Whatsapp360/API/ButtonType";
import { getCategory } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";

export function TemplateRow(props: {
  tabId: string;
  template: WhatsappTemplateNormalizedType;
  checkableItems: readonly string[];
  dispatch: React.Dispatch<
    WhatsappTemplateAction<WhatsappTemplateNormalizedType>
  >;
  toggleBookmark: (id: string) => void;
  bookmarkPending: boolean;
  t: TFunction;
  editable: boolean;
  deletable: boolean;
}) {
  const { template, t, checkableItems, dispatch, tabId, editable, deletable } =
    props;
  const { routeTo } = useRouteConfig();
  const searchParams = new URLSearchParams();
  const categoryCopyMap = getCategory(t).reduce(
    (acc, category) => ({ ...acc, [category.value]: category.text }),
    {}
  );
  searchParams.set("id", tabId);
  searchParams.set("isContent", template.isContent ? "true" : "false");

  const [firstTemplate] = template.whatsapp_template;
  const buttonType =
    uniq(
      firstTemplate.components?.map((ch) =>
        ch.buttons?.some((button) => button.type === "QUICK_REPLY")
          ? "QUICK_REPLY"
          : "CALL_TO_ACTION"
      ) ?? []
    ).join("") || "NONE";

  const toggleBookmark = () => {
    props.toggleBookmark(template.sid);
  };

  return (
    <Table.Row>
      {deletable && (
        <Table.Cell className={"checkbox"}>
          <div className="checkbox-wrap">
            <Checkbox
              checked={checkableItems.includes(template.sid)}
              onChange={(event, data) => {
                if (data.checked) {
                  dispatch({ type: "CHECKED_ITEM", id: template.sid });
                } else {
                  dispatch({ type: "UNCHECKED_ITEM", id: template.sid });
                }
              }}
            />
          </div>
        </Table.Cell>
      )}
      <Table.Cell>
        <div className={`cell-wrap ${styles.cellWrap}`}>
          {props.bookmarkPending && <Loader active size={"tiny"} />}
          {template.whatsapp_template.some((t) => t.status === "approved") ? (
            !props.bookmarkPending && (
              <span
                className={styles.starWrap}
                onClick={editable ? toggleBookmark : undefined}
              >
                <Star
                  className={`${styles.star} ${
                    template.isBookmarked ? styles.solid : ""
                  } ${editable ? styles.editable : ""}`}
                  solid={template.isBookmarked}
                />
              </span>
            )
          ) : (
            <></>
          )}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="cell-wrap">
          <NavLink
            className={"name link"}
            to={{
              pathname: routeTo(`/settings/templates/${template.sid}`),
              search: searchParams.toString(),
            }}
            children={template.template_name}
          />
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="content">
          <pre>{firstTemplate.content}</pre>
        </div>
      </Table.Cell>
      <Table.Cell>{categoryCopyMap[template.category]}</Table.Cell>
      <Table.Cell>{getButtonName(t, buttonType as ButtonType)}</Table.Cell>
      <Table.Cell>
        {template.whatsapp_template
          .map(
            (wt) =>
              LanguagesMapping.find((lang) => lang.value === wt.language)?.label
          )
          .join(", ")}
      </Table.Cell>
      <Table.Cell>
        {template.isPending ? (
          <span className="status pending">
            {t("settings.templates.status.pending")}
          </span>
        ) : template.approvedCount > 0 ? (
          <span className="status approved">
            {t("settings.templates.status.approved", {
              count: template.approvedCount,
              total: template.totalCount,
            })}
          </span>
        ) : (
          template.rejectedCount > 0 && (
            <span className="status rejected">
              {t("settings.templates.status.rejected", {
                count: template.rejectedCount,
                total: template.totalCount,
              })}
            </span>
          )
        )}
        {/* todo common case for unknown statuses */}
      </Table.Cell>
    </Table.Row>
  );
}
