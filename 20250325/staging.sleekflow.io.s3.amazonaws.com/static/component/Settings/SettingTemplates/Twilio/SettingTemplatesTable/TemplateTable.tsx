import { WhatsappTemplateNormalizedType } from "../../../../../types/WhatsappTemplateResponseType";
import React, { useMemo } from "react";
import { WhatsappTemplateAction } from "../../../../../container/Settings/OfficialWhatsApp/whatsappTemplateReducer";
import { useTranslation } from "react-i18next";
import { Table } from "semantic-ui-react";
import { TableHeader } from "./TableHeader";
import { TemplateRow } from "./TemplateRow";
import { byBookmarkedStatus } from "../../../../Broadcast/TemplateSelection/byBookmarkedStatus";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

export function TemplateTable(props: {
  tabId: string;
  templates: readonly WhatsappTemplateNormalizedType[];
  checkableItems: readonly string[];
  bookmarksPending: string[];
  dispatch: React.Dispatch<
    WhatsappTemplateAction<WhatsappTemplateNormalizedType>
  >;
  toggleBookmark: (sid: string) => void;
}) {
  const {
    tabId,
    templates,
    checkableItems,
    dispatch,
    bookmarksPending,
    toggleBookmark,
  } = props;
  const { t } = useTranslation();
  const { check } = usePermission();
  const [canEditTemplate, canDeleteTemplate] = useMemo(
    () =>
      check([
        PERMISSION_KEY.channelTemplateEdit,
        PERMISSION_KEY.channelTemplateDelete,
      ]),
    [check]
  );
  let bookmarkedCount = templates.filter((t) => t.isBookmarked).length;

  return (
    <Table basic={"very"} className={"app data-grid"}>
      <TableHeader
        bookmarkedCount={bookmarkedCount}
        deletable={canDeleteTemplate}
      />
      <Table.Body>
        {[...templates].sort(byBookmarkedStatus).map((template) => (
          <TemplateRow
            t={t}
            tabId={tabId}
            toggleBookmark={toggleBookmark}
            dispatch={dispatch}
            checkableItems={checkableItems}
            template={template}
            bookmarkPending={bookmarksPending.includes(template.sid)}
            editable={canEditTemplate}
            deletable={canDeleteTemplate}
          />
        ))}
      </Table.Body>
    </Table>
  );
}
