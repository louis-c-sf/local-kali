import {
  isBodyType,
  isButtonType,
  LanguagesMapping,
} from "types/WhatsappTemplateResponseType";
import React from "react";
import { WhatsappTemplateAction } from "container/Settings/OfficialWhatsApp/whatsappTemplateReducer";
import useRouteConfig from "config/useRouteConfig";
import { uniq } from "ramda";
import { Checkbox, Loader, Table } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { getButtonName } from "../Twilio/SettingTemplate";
import { ButtonType } from "features/Whatsapp360/API/ButtonType";
import { WhatsappCloudAPITemplateType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { getCategory } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";
import Star from "assets/tsx/icons/Star";
import styles from "../Twilio/SettingTemplatesTable/TemplateRow.module.css";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";

const getStatusCopies = (status: string, t: TFunction): string => {
  const statusCopies = {
    APPROVED: t("settings.templates.cloudAPI.status.approved"),
    IN_APPEAL: t("settings.templates.cloudAPI.status.inAppeal"),
    PENDING: t("settings.templates.cloudAPI.status.pending"),
    REJECTED: t("settings.templates.cloudAPI.status.rejected"),
    PENDING_DELETION: t("settings.templates.cloudAPI.status.pendingDeletion"),
    DELETED: t("settings.templates.cloudAPI.status.deleted"),
    DISABLED: t("settings.templates.cloudAPI.status.disabled"),
    PAUSED: t("settings.templates.cloudAPI.status.paused"),
    LIMIT_EXCEEDED: t("settings.templates.cloudAPI.status.limitExceeded"),
  };
  return statusCopies[status] || "";
};

export default function TableRow(props: {
  tabId: string;
  template: WhatsappCloudAPITemplateType;
  checkableItems: readonly string[];
  dispatch: React.Dispatch<
    WhatsappTemplateAction<WhatsappCloudAPITemplateType>
  >;
  toggleBookmark: (id: string) => void;
  bookmarkPending: boolean;
  editable: boolean;
  deletable: boolean;
}) {
  const { template, checkableItems, dispatch, tabId, editable, deletable } =
    props;
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const bodyComponent = template.components.find((com) => isBodyType(com));
  const buttonTypesExtracted = uniq(
    template.components
      .filter((com) => isButtonType(com))
      .map((component) =>
        component?.buttons?.some((button) => button.type === "QUICK_REPLY")
          ? "QUICK_REPLY"
          : "CALL_TO_ACTION"
      ) ?? []
  );
  const buttonType = buttonTypesExtracted[0] ?? "NONE";
  const searchParams = new URLSearchParams();
  const categoryCopyMap = getCategory(t).reduce(
    (acc, category) => ({ ...acc, [category.value]: category.text }),
    {}
  );
  searchParams.set("id", tabId);
  const toggleBookmark = () => {
    props.toggleBookmark(template.id);
  };

  const rejectReasonMapping = {
    ABUSIVE_CONTENT: t(
      "settings.template.cloudApi.rejectReason.abusiveContent"
    ),
    INVALID_FORMAT: t("settings.template.cloudApi.rejectReason.invalidFormat"),
    INCORRECT_CATEGORY: t(
      "settings.template.cloudApi.rejectReason.incorrectCategory"
    ),
    SCAM: t("settings.template.cloudApi.rejectReason.scam"),
  };

  return (
    <Table.Row>
      {deletable && (
        <Table.Cell className={"checkbox"}>
          <div className="checkbox-wrap">
            <Checkbox
              checked={checkableItems.includes(
                `${template.id}-${template.name}`
              )}
              onChange={(event, data) => {
                if (data.checked) {
                  dispatch({
                    type: "CHECKED_ITEM",
                    id: `${template.id}-${template.name}`,
                  });
                } else {
                  dispatch({
                    type: "UNCHECKED_ITEM",
                    id: `${template.id}-${template.name}`,
                  });
                }
              }}
            />
          </div>
        </Table.Cell>
      )}
      <Table.Cell>
        <div className={`cell-wrap ${styles.cellWrap}`}>
          {props.bookmarkPending && <Loader active size={"tiny"} />}
          {template.status === "APPROVED" ? (
            !props.bookmarkPending && (
              <span
                className={styles.starWrap}
                onClick={editable ? toggleBookmark : undefined}
              >
                <Star
                  className={`${styles.star} ${
                    template.is_template_bookmarked ? styles.solid : ""
                  } ${editable ? styles.hoverable : ""}`}
                  solid={template.is_template_bookmarked}
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
              pathname: routeTo(`/settings/templates/${template.id}`),
              search: searchParams.toString(),
            }}
            children={template.name}
          />
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="content">
          <pre>{bodyComponent?.text}</pre>
        </div>
      </Table.Cell>
      <Table.Cell>{categoryCopyMap[template.category]}</Table.Cell>
      <Table.Cell>{getButtonName(t, buttonType as ButtonType)}</Table.Cell>
      <Table.Cell>
        {
          LanguagesMapping.find((lang) => lang.value === template.language)
            ?.label
        }
      </Table.Cell>
      <Table.Cell>
        {template.status === "APPROVED" ? (
          <span className="status approved">
            {getStatusCopies(template.status, t)}
          </span>
        ) : template.status === "PENDING" ? (
          <span className="status pending">
            {getStatusCopies(template.status, t)}
          </span>
        ) : (
          <span className="status rejected">
            <InfoTooltip
              placement={"top"}
              trigger={<div>{getStatusCopies(template.status, t)}</div>}
            >
              {template.rejected_reason
                ? rejectReasonMapping[template.rejected_reason]
                : t("form.field.any.error.common")}
            </InfoTooltip>
          </span>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
